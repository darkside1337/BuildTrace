import { expect, test } from "@playwright/test";

test("shows database status and offers a working retry", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Connected to Neon" }),
  ).toBeVisible();

  const refreshResponse = page.waitForResponse((response) => {
    const request = response.request();
    const headers = request.headers();

    return (
      new URL(response.url()).pathname === "/" &&
      headers.rsc === "1" &&
      headers["next-router-prefetch"] !== "1"
    );
  });
  await page.getByRole("button", { name: "Check connection again" }).click();
  expect((await refreshResponse).status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "Connected to Neon" }),
  ).toBeVisible();

  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  await expect(page.getByRole("link", { name: "Open Inventory", exact: true })).toHaveAttribute("href", "/inventory");
});

test("keeps catalog routes behind sign-in", async ({ page }, testInfo) => {
  for (const route of [
    "/inventory",
    "/inventory/00000000-0000-4000-8000-000000000001/edit",
  ]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole("heading", { name: "Sign in to your shop" })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Back to Home", exact: true })).toHaveAttribute("href", "/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("sign-in.png"), fullPage: true });
});

test("public headers provide direct links without a workspace menu", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveCount(0);
  await page.locator("header").getByRole("link", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveCount(0);
  await expect(page.locator("header").getByRole("link", { name: "Sign in", exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Back to Home", exact: true }).click();
  await expect(page).toHaveURL("/");
});


test("removed mock routes return 404", async ({ request }) => {
  for (const route of ["/design-lab/receiving", "/prototypes/swiss-shell"]) {
    expect((await request.get(route)).status()).toBe(404);
  }
});
