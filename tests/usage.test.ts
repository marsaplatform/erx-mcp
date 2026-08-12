import { rmSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";

import { UsageCounter, usageOptionsFromEnv } from "../src/usage/counter.js";
import { deriveFreeKey, verifyFreeKey } from "../src/usage/keys.js";

const SECRET = "erx-test-secret";
const DB = "erx-test-usage.sqlite";

afterEach(() => rmSync(DB, { force: true }));

describe("erx free keys", () => {
  it("derives and verifies a key back to its subject", async () => {
    const key = await deriveFreeKey(12, SECRET);
    expect(key).toMatch(/^erx_12_[0-9a-f]{16}$/);
    expect(await verifyFreeKey(key, SECRET)).toBe("wp:customer-12");
  });

  it("rejects tampering, wrong secret and junk", async () => {
    const key = await deriveFreeKey(12, SECRET);
    expect(await verifyFreeKey(key.replace("_12_", "_13_"), SECRET)).toBeNull();
    expect(await verifyFreeKey(key, "other-secret")).toBeNull();
    expect(await verifyFreeKey("hm_12_0000000000000000", SECRET)).toBeNull();
    expect(await verifyFreeKey("", SECRET)).toBeNull();
  });
});

describe("erx usage counter", () => {
  it("splits keyed vs anonymous and ranks endpoint families", async () => {
    const counter = await UsageCounter.create({ keySecret: SECRET });
    counter.record("api:search", null, "1.2.3.4");
    counter.record("api:search", "wp:customer-12", "1.2.3.4");
    counter.record("mcp", "wp:customer-12", "1.2.3.4");
    const summary = counter.summary();
    expect(summary.total).toBe(3);
    expect(summary.keyed).toBe(2);
    expect(summary.anonymous).toBe(1);
    expect(summary.topTools[0]).toEqual({ tool: "api:search", count: 2 });
    expect(counter.usedThisMonth("wp:customer-12")).toBe(2);
    counter.stop();
  });

  it("gates anonymous through, keys to their subject, and flags over-limit", async () => {
    const counter = await UsageCounter.create({ keySecret: SECRET, monthlyFreeLimit: 1 });
    expect((await counter.gate(null)).keyed).toBe(false);
    expect((await counter.gate("erx_12_deadbeefdeadbeef")).keyed).toBe(false);
    const key = await deriveFreeKey(12, SECRET);
    expect(await counter.gate(key)).toEqual({ keyed: true, subject: "wp:customer-12", overLimit: false });
    counter.record("api:search", "wp:customer-12", "ip");
    expect(await counter.gate(key)).toEqual({ keyed: true, subject: "wp:customer-12", overLimit: true });
    counter.stop();
  });

  it("persists counts across restarts", async () => {
    const first = await UsageCounter.create({ databasePath: DB, keySecret: SECRET });
    first.record("api:documents", "wp:customer-12", "ip");
    first.stop();
    const second = await UsageCounter.create({ databasePath: DB, keySecret: SECRET });
    expect(second.usedThisMonth("wp:customer-12")).toBe(1);
    expect(second.summary().total).toBe(1);
    second.stop();
  });

  it("reads options from ERX_ environment variables", () => {
    const options = usageOptionsFromEnv({
      ERX_KEY_SECRET: "s",
      ERX_FREE_MONTHLY_LIMIT: "1234",
      ERX_USAGE_DATABASE_PATH: "/tmp/x.sqlite",
    } as NodeJS.ProcessEnv);
    expect(options.keySecret).toBe("s");
    expect(options.monthlyFreeLimit).toBe(1234);
    expect(options.metric).toBe("erx_calls");
    expect(options.databasePath).toBe("/tmp/x.sqlite");
  });
});
