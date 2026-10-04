import { z } from "zod";

export const categories = [
  "cpu",
  "gpu",
  "motherboard",
  "ram",
  "storage",
  "case",
  "power_supply",
  "cooling",
  "accessory",
] as const;

export const trackingModes = ["serialized", "quantity"] as const;

const optionalText = z.string().trim().optional()
  .transform((value) => value || null);

function optionalWholeNumber(label: string) {
  return z.string().trim().optional()
    .refine((value) => !value || /^\d+$/.test(value), `${label} must be a whole number.`)
    .transform((value) => value ? Number(value) : null)
    .refine((value) => value === null || Number.isSafeInteger(value), `${label} is too large.`);
}

function optionalUsdCents(label: string) {
  return z.string().trim().optional()
    .refine((value) => !value || /^\d+(\.\d{1,2})?$/.test(value),
      `${label} must be a nonnegative USD amount with at most two decimal places.`)
    .transform((value) => {
      if (!value) return null;
      const [whole, fraction = ""] = value.split(".");
      return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    })
    .refine((value) => value === null || Number.isSafeInteger(value), `${label} is too large.`);
}

const serialRequiredCategories = new Set<string>([
  "cpu",
  "gpu",
  "motherboard",
  "storage",
]);

export const catalogFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a part name.").max(200),
  manufacturer: z.string().trim().min(1, "Enter a manufacturer.").max(160),
  model: z.string().trim().min(1, "Enter a model.").max(160),
  sku: z.string().trim().min(1, "Enter an SKU.").max(100),
  category: z.enum(categories),
  trackingMode: z.enum(trackingModes),
  manufacturerPartNumber: optionalText,
  barcode: optionalText,
  referencePurchaseCostCents: optionalUsdCents("Purchase cost"),
  referenceSalePriceCents: optionalUsdCents("Sale price"),
  lowStockThreshold: optionalWholeNumber("Low-stock threshold"),
  supplierWarrantyMonths: optionalWholeNumber("Supplier warranty duration"),
  customerWarrantyMonths: optionalWholeNumber("Customer warranty duration"),
  specifications: optionalText,
  notes: optionalText,
}).superRefine((product, context) => {
  if (serialRequiredCategories.has(product.category) && product.trackingMode !== "serialized") {
    context.addIssue({
      code: "custom",
      path: ["trackingMode"],
      message: "This category requires serial tracking.",
    });
  }
});

export const productIdSchema = z.string().uuid();
export type CatalogInput = z.output<typeof catalogFormSchema>;
export type CatalogFormValues = z.input<typeof catalogFormSchema>;

export function defaultTrackingMode(category: (typeof categories)[number]) {
  return serialRequiredCategories.has(category) ? "serialized" : "quantity";
}
