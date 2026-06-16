import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

const spawnMock = vi.fn();

vi.mock("node:child_process", () => ({
  spawn: spawnMock
}));

class MockChildProcess extends EventEmitter {
  stdout = new PassThrough();
  stderr = new PassThrough();
  kill = vi.fn(() => {
    this.emit("close", null);
    return true;
  });
}

describe("runCommand", () => {
  beforeEach(() => {
    spawnMock.mockReset();
  });

  it("captures stdout from a successful process", async () => {
    const child = new MockChildProcess();
    spawnMock.mockReturnValue(child);

    const { runCommand } = await import("../src/utils/process.js");
    const promise = runCommand("fake-command", ["--ok"], { timeoutMs: 2_000 });

    child.stdout.write("ok");
    child.stdout.end();
    child.emit("close", 0);

    await expect(promise).resolves.toEqual({
      stdout: "ok",
      stderr: ""
    });
  });

  it("fails with timeout when the child process hangs", async () => {
    vi.useFakeTimers();
    const child = new MockChildProcess();
    spawnMock.mockReturnValue(child);

    try {
      const { runCommand } = await import("../src/utils/process.js");
      const promise = runCommand("fake-command", ["--hang"], { timeoutMs: 50 });
      const assertion = expect(promise).rejects.toMatchObject({
        code: "PROCESS_TIMEOUT"
      });

      await vi.advanceTimersByTimeAsync(60);

      await assertion;
      expect(child.kill).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("terminates a process that emits excessive output", async () => {
    const child = new MockChildProcess();
    spawnMock.mockReturnValue(child);
    const { runCommand } = await import("../src/utils/process.js");
    const promise = runCommand("fake-command", ["--noisy"], {
      timeoutMs: 2_000,
      maxOutputBytes: 8
    });
    const assertion = expect(promise).rejects.toMatchObject({
      code: "PROCESS_OUTPUT_LIMIT"
    });
    child.stdout.write("0123456789");
    await assertion;
    expect(child.kill).toHaveBeenCalled();
  });
});
