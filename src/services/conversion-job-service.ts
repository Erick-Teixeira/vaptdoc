import type { FastifyBaseLogger } from "fastify";
import type { ToolId } from "../catalog.js";
import type { AccountQueuedConversionJob, AccountService } from "./account-service.js";
import type { ConversionResult, UploadedAsset } from "../types.js";
import type { ConversionGate } from "../utils/conversion-gate.js";

type ConversionHandler = Pick<{ convert: (payload: { toolId: ToolId; uploads: UploadedAsset[]; options?: Record<string, string> }) => Promise<ConversionResult> }, "convert">;

interface ConversionJobServiceOptions {
  accountService: AccountService;
  conversionService: ConversionHandler;
  gate?: ConversionGate;
  logger?: Pick<FastifyBaseLogger, "info" | "warn" | "error">;
}

export class ConversionJobService {
  private readonly accountService: AccountService;
  private readonly conversionService: ConversionHandler;
  private readonly gate?: ConversionGate;
  private readonly logger: Pick<FastifyBaseLogger, "info" | "warn" | "error"> | Console;
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  private stopped = false;

  constructor(options: ConversionJobServiceOptions) {
    this.accountService = options.accountService;
    this.conversionService = options.conversionService;
    this.gate = options.gate;
    this.logger = options.logger ?? console;
  }

  start() {
    this.stopped = false;
    this.accountService.reclaimStaleAsyncJobs();
    this.schedule(120);
  }

  stop() {
    this.stopped = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private schedule(delayMs: number) {
    if (this.stopped) {
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      void this.drainOnce();
    }, delayMs);
  }

  private async drainOnce() {
    if (this.stopped || this.running) {
      return;
    }

    this.running = true;
    let claimedJob: AccountQueuedConversionJob | null = null;

    try {
      claimedJob = await this.accountService.claimNextAsyncConversionJob();
      if (!claimedJob) {
        this.schedule(1400);
        return;
      }
      const job = claimedJob;

      const executeConversion = () =>
        this.conversionService.convert({
          toolId: job.toolId as ToolId,
          uploads: job.uploads.map((upload) => ({
            filename: upload.filename,
            declaredMime: upload.declaredMime,
            size: upload.size,
            buffer: upload.buffer
          })),
          options: job.options as never
        });

      const result = this.gate ? await this.gate.run(executeConversion) : await executeConversion();
      await this.accountService.completeConversionHistory(job.id, {
        outputFilename: result.filename,
        outputContentType: result.contentType,
        outputSizeBytes: result.data.byteLength,
        provider: result.provider,
        data: result.data
      });

      this.logger.info?.(
        {
          event: "async-conversion.completed",
          historyId: job.id,
          toolId: job.toolId,
          provider: result.provider
        },
        "Async conversion completed."
      );
      this.schedule(80);
    } catch (error) {
      if (claimedJob) {
        await this.accountService.failConversionHistory(
          claimedJob.id,
          error instanceof Error ? error.message : "Async conversion failed."
        ).catch(() => undefined);
      }

      this.logger.error?.(
        {
          event: "async-conversion.failed",
          historyId: claimedJob?.id ?? null,
          toolId: claimedJob?.toolId ?? "unknown",
          errorMessage: error instanceof Error ? error.message : String(error)
        },
        "Async conversion failed."
      );
      this.schedule(1800);
    } finally {
      this.running = false;
    }
  }
}
