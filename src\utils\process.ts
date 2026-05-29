import { spawn } from "node:child_process";
import type { SpawnOptionsWithoutStdio } from "node:child_process";
import { AppError } from "./errors.js";

export interface ProcessResult {
  stdout: string;
  stderr: string;
}

export interface RunCommandOptions extends SpawnOptionsWithoutStdio {
  timeoutMs?: number;
}

export async function runCommand(
  command: string,
  args: string[],
  options: RunCommandOptions = {}
): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const { timeoutMs = 120_000, ...spawnOptions } = options;
    const child = spawn(command, args, {
      ...spawnOptions,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false
    });

    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;
    const timeoutHandle =
      timeoutMs > 0
        ? setTimeout(() => {
            timedOut = true;
            child.kill();
          }, timeoutMs)
        : null;

    const finish = (callback: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
      callback();
    };

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      finish(() => {
        reject(new AppError(`Falha ao iniciar processo externo: ${error.message}`, 500, "PROCESS_SPAWN_FAILED"));
      });
    });

    child.on("close", (code) => {
      finish(() => {
        if (timedOut) {
          reject(
            new AppError(
              `Conversao externa excedeu o limite de ${Math.max(1, Math.ceil(timeoutMs / 1000))} segundos.`,
              504,
              "PROCESS_TIMEOUT"
            )
          );
          return;
        }

        if (code === 0) {
          resolve({ stdout, stderr });
          return;
        }

        reject(
          new AppError(
            `Conversao externa falhou com codigo ${code}.`,
            500,
            "PROCESS_FAILED"
          )
        );
      });
    });
  });
}
