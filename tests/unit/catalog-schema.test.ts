import { describe, expect, it } from "vitest";
import { catalogFormSchema, defaultTrackingMode } from "../../features/catalog/schemas";

const validProduct = {
  name: "RTX 5090",
  manufacturer: "NVIDIA",
  model: "Founders Edition",
  sku: "GPU-5090-FE",
  category: "gpu",
  trackingMode: "serialized",
  manufacturerPartNumber: "RTX5090FE",
  barcode: "0123456789",
  referencePurchaseCostCents: "1999.99",
  referenceSalePriceCents: "2499",
  lowStockThreshold: "2",
  supplierWarrantyMonths: "36",
  customerWarrantyMonths: "12",
  specifications: "32 GB GDDR7",
  notes: "Launch model",
};

describe("catalog form schema", () => {
  it("converts exact USD strings to integer cents and blank optionals to null", () => {
    const parsed = catalogFormSchema.parse({ ...validProduct, barcode: "" });
    expect(parsed.referencePurchaseCostCents).toBe(199999);
    expect(parsed.referenceSalePriceCents).toBe(249900);
    expect(parsed.barcode).toBeNull();
  });

  it("rejects negative prices, fractional cents, and missing required fields", () => {
    expect(catalogFormSchema.safeParse({ ...validProduct, referenceSalePriceCents: "-2" }).success).toBe(false);
    expect(catalogFormSchema.safeParse({ ...validProduct, referenceSalePriceCents: "2.555" }).success).toBe(false);
    expect(catalogFormSchema.safeParse({ ...validProduct, manufacturer: " " }).success).toBe(false);
  });

  it("requires serialized tracking for CPU, GPU, motherboard, and storage", () => {
    for (const category of ["cpu", "gpu", "motherboard", "storage"] as const) {
      expect(catalogFormSchema.safeParse({ ...validProduct, category, trackingMode: "quantity" }).success).toBe(false);
      expect(defaultTrackingMode(category)).toBe("serialized");
    }
    expect(defaultTrackingMode("ram")).toBe("quantity");
  });
});
