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
});

test("keeps catalog routes behind sign-in", async ({ page }) => {
  for (const route of [
    "/inventory",
    "/inventory/00000000-0000-4000-8000-000000000001/edit",
  ]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole("heading", { name: "Sign in to your shop" })).toBeVisible();
  }
});

test("mobile navigation closes after Home activation and Escape", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"));
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Open navigation" });
  await menuButton.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "BuildTrace" })).toBeVisible();
  const homeLink = dialog.getByRole("link", { name: "Home" });
  await expect(homeLink).toHaveAttribute("href", "/");
  await expect(homeLink).toHaveAttribute("aria-current", "page");

  await homeLink.click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL("/");

  await menuButton.click();
  await expect(dialog).toBeVisible();
  await homeLink.focus();
  await expect(homeLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL("/");

  await menuButton.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
