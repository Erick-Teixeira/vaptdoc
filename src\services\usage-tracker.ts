export interface UsageSnapshot {
  day: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  reachedLimit: boolean;
}

interface CounterRecord {
  day: string;
  used: number;
  touchedAt: number;
}

function getCurrentDayStamp() {
  return new Date().toISOString().slice(0, 10);
}

export class UsageTracker {
  private readonly counters = new Map<string, CounterRecord>();

  peek(bucket: string, limit: number | null): UsageSnapshot {
    this.cleanup();
    const day = getCurrentDayStamp();
    const current = this.counters.get(bucket);
    const used = current && current.day === day ? current.used : 0;
    const remaining = limit === null ? null : Math.max(0, limit - used);

    return {
      day,
      used,
      limit,
      remaining,
      reachedLimit: limit !== null && used >= limit
    };
  }

  consume(bucket: string, limit: number | null): UsageSnapshot {
    const day = getCurrentDayStamp();
    const snapshot = this.peek(bucket, limit);
    const nextUsed = snapshot.used + 1;

    this.counters.set(bucket, {
      day,
      used: nextUsed,
      touchedAt: Date.now()
    });

    return {
      day,
      used: nextUsed,
      limit,
      remaining: limit === null ? null : Math.max(0, limit - nextUsed),
      reachedLimit: limit !== null && nextUsed >= limit
    };
  }

  private cleanup() {
    const currentDay = getCurrentDayStamp();

    for (const [bucket, record] of this.counters.entries()) {
      if (record.day !== currentDay) {
        this.counters.delete(bucket);
      }
    }
  }
}
