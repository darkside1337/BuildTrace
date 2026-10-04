import { describe, expect, it } from "vitest";
import { getDatabaseEnvironment } from "../../lib/env";

const pooledUrl =
  "postgresql://buildtrace:local@ep-sample-pooler.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";
const directUrl =
  "postgresql://buildtrace:local@ep-sample.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";

describe("database environment", () => {
  it("accepts matching pooled and direct Neon URLs", () => {
    expect(
      getDatabaseEnvironment({
        DATABASE_URL: pooledUrl,
        DATABASE_URL_UNPOOLED: directUrl,
      }),
    ).not.toBeNull();
  });

  it("returns setup required when a URL is missing", () => {
    expect(getDatabaseEnvironment({ DATABASE_URL: pooledUrl })).toBeNull();
  });

  it("rejects an unpooled application URL", () => {
    expect(
      getDatabaseEnvironment({
        DATABASE_URL: directUrl,
        DATABASE_URL_UNPOOLED: directUrl,
      }),
    ).toBeNull();
  });

  it("rejects URLs that point at different Neon databases", () => {
    expect(
      getDatabaseEnvironment({
        DATABASE_URL: pooledUrl,
        DATABASE_URL_UNPOOLED:
          "postgresql://buildtrace:local@ep-other.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require",
      }),
    ).toBeNull();
  });
});
