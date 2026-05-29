import { describe, expect, it } from "vitest";
import { ConversionGate } from "../src/utils/conversion-gate.js";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("conversion gate", () => {
  it("queues work when concurrency is saturated", async () => {
    const gate = new ConversionGate(1, 2);
    const executionOrder: string[] = [];

    const first = gate.run(async () => {
      executionOrder.push("first-start");
      await wait(20);
      executionOrder.push("first-end");
      return "first";
    });

    const second = gate.run(async () => {
      executionOrder.push("second-start");
      executionOrder.push("second-end");
      return "second";
    });

    await expect(Promise.all([first, second])).resolves.toEqual(["first", "second"]);
    expect(executionOrder).toEqual(["first-start", "first-end", "second-start", "second-end"]);
  });

  it("rejects new work when the queue is full", async () => {
    const gate = new ConversionGate(1, 0);

    const first = gate.run(async () => {
      await wait(20);
      return "first";
    });

    await expect(
      gate.run(async () => "second")
    ).rejects.toMatchObject({
      code: "QUEUE_BUSY"
    });

    await first;
  });
});
