import { expect, test } from "@playwright/test";

test("explains setup or database recovery without exposing details", async ({
  page,
}, testInfo) => {
  await page.goto("/");

  if (testInfo.project.metadata.status === "setup") {
    await expect(
      page.getByRole("heading", { name: "Connection details need setup" }),
    ).toBeVisible();
    await expect(page.getByText(/DATABASE_URL_UNPOOLED/)).toBeVisible();
  } else {
    await expect(
      page.getByRole("heading", { name: "Couldn’t reach your database" }),
    ).toBeVisible();
    await expect(page.getByText(/do-not-use/)).toHaveCount(0);
  }

  await expect(
    page.getByRole("button", { name: "Check connection again" }),
  ).toBeEnabled();
});
