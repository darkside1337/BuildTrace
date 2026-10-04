import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadEnvConfig: vi.fn(),
  defineConfig: vi.fn((config: unknown) => config),
}));

vi.mock("@next/env", () => ({ loadEnvConfig: mocks.loadEnvConfig }));
vi.mock("drizzle-kit", () => ({ defineConfig: mocks.defineConfig }));

const pooledUrl =
  "postgresql://buildtrace:secret@ep-sample-pooler.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";
const directUrl =
  "postgresql://buildtrace:secret@ep-sample.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";
const configurationError =
  "Valid matching pooled DATABASE_URL and direct DATABASE_URL_UNPOOLED PostgreSQL URLs are required for migrations.";

describe("Drizzle migration configuration", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("DATABASE_URL", pooledUrl);
    vi.stubEnv("DATABASE_URL_UNPOOLED", directUrl);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("loads environment before validating and passes the direct URL to Drizzle", async () => {
    mocks.loadEnvConfig.mockImplementationOnce(() => {
      vi.stubEnv("DATABASE_URL", pooledUrl);
      vi.stubEnv("DATABASE_URL_UNPOOLED", directUrl);
    });
    vi.stubEnv("DATABASE_URL", undefined);
    vi.stubEnv("DATABASE_URL_UNPOOLED", undefined);

    const { default: config } = await import("../../drizzle.config");

    expect(mocks.loadEnvConfig).toHaveBeenCalledOnce();
    expect(mocks.loadEnvConfig).toHaveBeenCalledWith(process.cwd());
    expect(mocks.defineConfig).toHaveBeenCalledOnce();
    expect(config).toMatchObject({
      dialect: "postgresql",
      dbCredentials: { url: directUrl },
    });
  });

  it.each([
    ["missing pooled URL", undefined, directUrl],
    ["missing direct URL", pooledUrl, undefined],
    ["malformed URL", "not-a-url", directUrl],
    ["non-PostgreSQL URL", pooledUrl, "https://example.com/neondb"],
    ["application URL is direct", directUrl, directUrl],
    ["migration URL is pooled", pooledUrl, pooledUrl],
    [
      "different endpoint",
      pooledUrl,
      directUrl.replace("ep-sample.", "ep-other."),
    ],
    ["different database", pooledUrl, directUrl.replace("/neondb", "/other")],
    ["different role", pooledUrl, directUrl.replace("buildtrace", "other")],
  ])("rejects %s before defining a migration config", async (_reason, pooled, direct) => {
    vi.stubEnv("DATABASE_URL", pooled);
    vi.stubEnv("DATABASE_URL_UNPOOLED", direct);

    await expect(import("../../drizzle.config")).rejects.toMatchObject({
      message: configurationError,
    });
    expect(mocks.loadEnvConfig).toHaveBeenCalledOnce();
    expect(mocks.defineConfig).not.toHaveBeenCalled();
  });
});
