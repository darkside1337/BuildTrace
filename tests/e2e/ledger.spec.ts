import { expect, test as base } from "@playwright/test";
import {
  catalogFixtureEnvironmentAvailable,
  createCatalogBrowserFixture,
  type CatalogBrowserFixture,
} from "../helpers/catalog-browser-fixture";

const test = base.extend<{ catalog: CatalogBrowserFixture }>({
  catalog: async ({ page, baseURL }, use) => {
    test.skip(
      !catalogFixtureEnvironmentAvailable(),
      "Ledger browser checks require the configured Neon pair and Better Auth test settings.",
    );
    const { fixture, cleanup } = await createCatalogBrowserFixture(page, baseURL);
    try {
      await fixture.authenticate(page);
      // Playwright's fixture `use` callback is not a React Hook.
      // eslint-disable-next-line react-hooks/rules-of-hooks
      await use(fixture);
    } finally {
      await cleanup();
    }
  },
});

test.describe("authenticated Trace / Ledger catalog", () => {
  test("renders without horizontal overflow at phone, tablet, and desktop widths", async ({ page, catalog }, testInfo) => {
    await page.goto("/inventory");
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      await expect(page.getByRole("heading", { name: "Parts catalog" })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `catalog should not overflow at ${width}px`,
      ).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`ledger-${width}.png`), fullPage: true });
    }
    await expect(page.getByRole("link", { name: new RegExp(catalog.products.cpu.name) })).toBeVisible();
  });

  test("applies shop manufacturer filters, stable price sorting, and matching counts", async ({ page, catalog }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto("/inventory?manufacturer=Northstar&sort=referenceSalePriceCents&direction=desc");

    await expect(page).toHaveURL(/manufacturer=Northstar/);
    await expect(page.getByRole("status").filter({ hasText: "2 parts matching filters" })).toBeVisible();
    const rows = page.getByRole("row");
    await expect(rows.nth(1)).toContainText(catalog.products.ram.name);
    await expect(rows.nth(2)).toContainText(catalog.products.gpu.name);
    await expect(page.getByRole("link", { name: new RegExp(catalog.products.foreign.name) })).toHaveCount(0);

    await page.goto("/inventory?archived=true");
    await expect(page.getByRole("status").filter({ hasText: "1 part" })).toBeVisible();
    await expect(page.getByRole("link", { name: new RegExp(catalog.products.archived.name) })).toBeVisible();
  });

  test("opens a product panel, restores focus on Escape, and supports a canonical reload", async ({ page, catalog }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto("/inventory");
    const productLink = page.getByRole("link", { name: new RegExp(catalog.products.cpu.name) });
    await productLink.click();
    await expect(page).toHaveURL(new RegExp(`/inventory/${catalog.products.cpu.id}$`));
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: catalog.products.cpu.name })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page).toHaveURL("/inventory");
    await expect(productLink).toBeFocused();

    await productLink.click();
    await expect(page).toHaveURL(new RegExp(`/inventory/${catalog.products.cpu.id}$`));
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: catalog.products.cpu.name })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("validates product fields and serial-required categories, then saves a real catalog record", async ({ page, catalog }) => {
    await page.goto("/inventory/new");
    const category = page.getByLabel("Category");
    const tracking = page.getByLabel("Tracking mode");
    await category.selectOption("gpu");
    await expect(tracking).toHaveValue("serialized");
    await expect(tracking.locator('option[value="quantity"]')).toBeDisabled();

    await page.getByRole("button", { name: "Create part" }).click();
    await expect(page.getByText("Part name: Enter a part name.")).toBeVisible();
    await expect(page.getByLabel("Part name")).toBeFocused();

    const suffix = crypto.randomUUID();
    const values = {
      name: `Saved Ledger part ${suffix}`,
      manufacturer: "Fixture Works",
      model: "Saved Model",
      sku: `SAVED-${suffix}`,
    };
    await page.getByLabel("Part name").fill(values.name);
    await page.getByRole("textbox", { name: "Manufacturer", exact: true }).fill(values.manufacturer);
    await page.getByLabel("Model").fill(values.model);
    await page.getByLabel("Internal SKU").fill(values.sku);
    await page.getByRole("button", { name: "Create part" }).click();

    await expect(page.getByRole("heading", { name: values.name })).toBeVisible();
    const saved = await catalog.readProductBySku(values.sku);
    expect(saved).not.toBeNull();
    expect(saved?.shopId).toBe(catalog.shopId);
    await expect(page.getByText("Not recorded").first()).toBeVisible();
  });

  test("rejects a duplicate shop SKU and keeps the rejected value in the form", async ({ page, catalog }) => {
    await page.goto("/inventory/new");
    await page.getByLabel("Part name").fill("Duplicate SKU attempt");
    await page.getByRole("textbox", { name: "Manufacturer", exact: true }).fill("Fixture Works");
    await page.getByLabel("Model").fill("Duplicate model");
    await page.getByLabel("Internal SKU").fill(catalog.products.ram.sku);
    await page.getByLabel("Category").selectOption("ram");
    await page.getByRole("button", { name: "Create part" }).click();

    await expect(page.getByText("A part with this SKU already exists in this shop.")).toBeVisible();
    await expect(page.getByLabel("Internal SKU")).toHaveValue(catalog.products.ram.sku);
    await expect(page.getByLabel("Internal SKU")).toBeFocused();
  });

  test("archives and restores within the shop and hides a foreign-shop detail", async ({ page, catalog }) => {
    await page.goto(`/inventory/${catalog.products.ram.id}`);
    await page.getByRole("button", { name: "Archive part" }).click();
    await expect(page.getByText("Archived part", { exact: true })).toBeVisible();

    await page.goto("/inventory?archived=true");
    await page.getByRole("link", { name: new RegExp(catalog.products.ram.name) }).click();
    await expect(page.getByText("Archived part", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Restore part" }).click();
    await expect(page.getByRole("link", { name: "Edit part" })).toBeVisible();

    await page.goto("/inventory");
    await expect(page.getByRole("link", { name: new RegExp(catalog.products.ram.name) })).toBeVisible();
    await page.goto(`/inventory/${catalog.products.foreign.id}`);
    await expect(page.getByRole("heading", { name: "Part not found" })).toBeVisible();
    await expect(page.getByText(catalog.products.foreign.name)).toHaveCount(0);
  });

  test("confirms discarding a dirty panel and recovers its draft through Back and Forward", async ({ page, catalog }) => {
    void catalog;
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto("/inventory");
    await page.getByRole("link", { name: "Add part" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const name = page.getByLabel("Part name");
    await name.fill("Unsaved Ledger draft");

    await page.getByRole("link", { name: "Cancel" }).click();
    const discardDialog = page.getByRole("alertdialog");
    await expect(discardDialog.getByText("Discard your changes?")).toBeVisible();
    await discardDialog.getByRole("button", { name: "Keep editing" }).click();
    await expect(name).toHaveValue("Unsaved Ledger draft");
    await page.keyboard.press("Escape");
    await expect(discardDialog.getByText("Discard your changes?")).toBeVisible();
    await discardDialog.getByRole("button", { name: "Keep editing" }).click();

    await page.goBack();
    await expect(page).toHaveURL("/inventory");
    await page.goForward();
    await expect(page).toHaveURL(/\/inventory\/new$/);
    await expect(page.getByLabel("Part name")).toHaveValue("Unsaved Ledger draft");

    await page.getByRole("button", { name: "Close panel" }).click();
    await expect(discardDialog.getByText("Discard your changes?")).toBeVisible();
    await discardDialog.getByRole("button", { name: "Discard changes" }).click();
    await expect(page).toHaveURL("/inventory");
    await page.getByRole("link", { name: "Add part" }).click();
    await expect(page.getByRole("textbox", { name: "Part name", exact: true })).toHaveValue("");
  });
});


test("keeps submitted controls and history locked until saving completes", async ({ page, catalog }) => {
  await page.goto("/inventory");
  await page.getByRole("link", { name: "Add part" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const suffix = crypto.randomUUID();
  await page.getByRole("textbox", { name: "Part name", exact: true }).fill(`Pending part ${suffix}`);
  await page.getByRole("textbox", { name: "Manufacturer", exact: true }).fill("Fixture");
  await page.getByRole("textbox", { name: "Model", exact: true }).fill("Model");
  await page.getByRole("textbox", { name: "Internal SKU", exact: true }).fill(`PENDING-${suffix}`);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/inventory/new", async route => {
    if (route.request().method() === "POST") await gate;
    await route.continue();
  });
  try {
    await page.getByRole("button", { name: "Create part" }).click();
    await expect(page.getByRole("button", { name: "Saving…" })).toBeDisabled();
    await expect(page.getByRole("textbox", { name: "Part name", exact: true })).toBeDisabled();
    await page.evaluate(() => history.back());
    await expect(page).toHaveURL(/\/inventory\/new$/);
  } finally { release(); }
  await expect(page.getByRole("heading", { name: `Pending part ${suffix}` })).toBeVisible();
  expect(await catalog.readProductBySku(`PENDING-${suffix}`)).not.toBeNull();
});

test("edits a shared detail panel and restores focus to its Edit link", async ({ page, catalog }, testInfo) => {
  await page.goto("/inventory");
  await page.getByRole("link", { name: new RegExp(catalog.products.ram.name) }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("link", { name: "Edit part" }).click();
  await expect(page.getByRole("textbox", { name: "Part name", exact: true })).toHaveValue(catalog.products.ram.name);
  await page.getByRole("button", { name: "Close panel" }).click();
  await expect(page.getByRole("link", { name: "Edit part" })).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath("ledger-detail.png"), fullPage: false });
  await page.getByRole("link", { name: "Edit part" }).click();
  await page.getByRole("textbox", { name: "Part name", exact: true }).fill("Updated memory kit");
  await page.screenshot({ path: testInfo.outputPath("ledger-form.png"), fullPage: false });
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("heading", { name: "Updated memory kit" })).toBeVisible();
});


test("confirms unsaved changes before ending the authenticated session", async ({ page, catalog }) => {
  void catalog;
  await page.goto("/inventory/new");
  await page.getByRole("textbox", { name: "Part name", exact: true }).fill("Unsaved sign-out draft");
  if (await page.getByRole("button", { name: "Open navigation" }).isVisible()) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
  } else {
    await page.getByRole("button", { name: "Trace validation shop" }).click();
    await page.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  }
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Discard changes" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/inventory");
  await expect(page).toHaveURL(/\/sign-in$/);
});


test("workspace mobile navigation closes on activation and restores focus on Escape", async ({ page, catalog }, testInfo) => {
  void catalog;
  test.skip(!testInfo.project.name.includes("mobile"));
  await page.goto("/inventory");
  const menuButton = page.getByRole("button", { name: "Open navigation" });
  await menuButton.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const catalogLink = dialog.getByRole("link", { name: "Parts catalog" });
  await expect(catalogLink).toHaveAttribute("aria-current", "page");
  await catalogLink.click();
  await expect(dialog).toBeHidden();
  await menuButton.click();
  await catalogLink.focus();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await menuButton.click();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(menuButton).toBeFocused();
  await menuButton.click();
  await dialog.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
