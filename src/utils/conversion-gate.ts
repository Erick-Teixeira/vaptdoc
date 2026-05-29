import { AppError } from "./errors.js";

export interface ConversionGateSnapshot {
  active: number;
  pending: number;
  maxConcurrent: number;
  maxPending: number;
  acceptingNewWork: boolean;
}

type QueueEntry = {
  task: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

export class ConversionGate {
  private readonly maxConcurrent: number;
  private readonly maxPending: number;
  private active = 0;
  private readonly queue: QueueEntry[] = [];

  constructor(maxConcurrent: number, maxPending: number) {
    this.maxConcurrent = maxConcurrent;
    this.maxPending = maxPending;
  }

  snapshot(): ConversionGateSnapshot {
    return {
      active: this.active,
      pending: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      maxPending: this.maxPending,
      acceptingNewWork: this.active < this.maxConcurrent || this.queue.length < this.maxPending
    };
  }

  async run<T>(task: () => Promise<T>) {
    if (this.active < this.maxConcurrent) {
      return this.execute(task);
    }

    if (this.queue.length >= this.maxPending) {
      throw new AppError(
        "O servidor esta com muitas conversoes em andamento agora. Tente novamente em instantes.",
        503,
        "QUEUE_BUSY"
      );
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        task: task as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject
      });
    });
  }

  private async execute<T>(task: () => Promise<T>) {
    this.active += 1;

    try {
      return await task();
    } finally {
      this.active = Math.max(0, this.active - 1);
      this.drain();
    }
  }

  private drain() {
    if (this.active >= this.maxConcurrent) {
      return;
    }

    const next = this.queue.shift();
    if (!next) {
      return;
    }

    void this.execute(next.task)
      .then(next.resolve)
      .catch(next.reject);
  }
}
