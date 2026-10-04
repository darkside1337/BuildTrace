"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, defaultTrackingMode } from "@/features/catalog/schemas";
import { createProductAction, updateProductAction } from "@/features/catalog/actions";
import type { SaveResult } from "@/features/catalog/types";
import type { products } from "@/lib/db/schema";

type ProductRow = typeof products.$inferSelect;

type Props = {
  mode: "create" | "edit";
  product?: ProductRow;
};

function usdInput(cents: number | null) {
  return cents === null ? "" : (cents / 100).toFixed(2);
}

const inputClass =
  "min-h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ProductForm({ mode, product }: Props) {
  const boundUpdate = product ? updateProductAction.bind(null, product.id) : null;
  const action = mode === "create" ? createProductAction : boundUpdate!;
  const [state, formAction, pending] = useActionState<SaveResult | null, FormData>(action, null);
  const [category, setCategory] = useState(product?.category ?? "cpu");
  const [trackingMode, setTrackingMode] = useState(
    product?.trackingMode ?? defaultTrackingMode("cpu"),
  );
  const trackingRequired = ["cpu", "gpu", "motherboard", "storage"].includes(category);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  function error(name: string) {
    return errors?.[name]?.[0];
  }

  return (
    <form action={formAction} className="flex flex-col gap-7">
      {state && !state.ok ? (
        <div role="alert" className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      {state?.ok ? (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          <p>{state.message ?? "Part saved."}</p>
          <Link className="mt-1 inline-block font-medium underline underline-offset-4" href={`/inventory/${state.productId}`}>
            View saved part
          </Link>
        </div>
      ) : null}

      <div>
        <h2 className="font-heading text-lg font-semibold">Part identity</h2>
        <p className="mt-1 text-sm text-muted-foreground">Catalog details identify the model. Saving a part does not add stock.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Part name" name="name" error={error("name")} defaultValue={product?.name} required />
          <Field label="Manufacturer" name="manufacturer" error={error("manufacturer")} defaultValue={product?.manufacturer} required />
          <Field label="Model" name="model" error={error("model")} defaultValue={product?.model} required />
          <Field label="Internal SKU" name="sku" error={error("sku")} defaultValue={product?.sku} required />
          <SelectField label="Category" name="category" error={error("category")} value={category}
            onChange={(value) => {
              const next = value as typeof category;
              setCategory(next);
              if (["cpu", "gpu", "motherboard", "storage"].includes(next)) {
                setTrackingMode("serialized");
              } else if (category === "cpu" || category === "gpu" || category === "motherboard" || category === "storage") {
                setTrackingMode(defaultTrackingMode(next));
              }
            }}>
            {categories.map((value) => <option key={value} value={value}>{categoryLabel(value)}</option>)}
          </SelectField>
          <SelectField label="Tracking mode" name="trackingMode" error={error("trackingMode")} value={trackingMode}
            onChange={(value) => setTrackingMode(value as typeof trackingMode)}>
            <option value="serialized">Serial tracked</option>
            <option value="quantity" disabled={trackingRequired}>Quantity tracked</option>
          </SelectField>
          <p className="text-sm text-muted-foreground sm:col-span-2">
            {trackingRequired
              ? "Serial tracking is required for this category."
              : "Quantity tracking is selected by default. You can choose serial tracking for individually identified parts."}
          </p>
          <Field label="Manufacturer part number" name="manufacturerPartNumber" error={error("manufacturerPartNumber")} defaultValue={product?.manufacturerPartNumber ?? ""} />
          <Field label="Barcode" name="barcode" error={error("barcode")} defaultValue={product?.barcode ?? ""} />
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold">Reference details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Prices are recorded in USD. Historical transaction prices are handled in later workflows.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Reference purchase cost (USD)" name="referencePurchaseCostCents" error={error("referencePurchaseCostCents")} defaultValue={usdInput(product?.referencePurchaseCostCents ?? null)} inputMode="decimal" />
          <Field label="Reference sale price (USD)" name="referenceSalePriceCents" error={error("referenceSalePriceCents")} defaultValue={usdInput(product?.referenceSalePriceCents ?? null)} inputMode="decimal" />
          <Field label="Low-stock threshold" name="lowStockThreshold" error={error("lowStockThreshold")} defaultValue={product?.lowStockThreshold?.toString() ?? ""} inputMode="numeric" />
          <Field label="Supplier / manufacturer warranty (months)" name="supplierWarrantyMonths" error={error("supplierWarrantyMonths")} defaultValue={product?.supplierWarrantyMonths?.toString() ?? ""} inputMode="numeric" />
          <Field label="Shop / customer warranty (months)" name="customerWarrantyMonths" error={error("customerWarrantyMonths")} defaultValue={product?.customerWarrantyMonths?.toString() ?? ""} inputMode="numeric" />
        </div>
      </div>

      <div className="grid gap-4">
        <TextAreaField label="Basic specifications" name="specifications" error={error("specifications")} defaultValue={product?.specifications ?? ""} />
        <TextAreaField label="Notes" name="notes" error={error("notes")} defaultValue={product?.notes ?? ""} />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Button nativeButton={false} render={<Link href={product ? `/inventory/${product.id}` : "/inventory"} />} variant="outline" className="min-h-11">
          Cancel
        </Button>
        <Button type="submit" className="min-h-11 min-w-36 gap-2" disabled={pending}>
          {pending ? <LoaderCircle aria-hidden="true" data-icon="inline-start" className="animate-spin" /> : null}
          {pending ? "Saving…" : mode === "create" ? "Create part" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export function categoryLabel(value: string) {
  return value.split("_").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
}

function Field({
  label,
  name,
  error,
  defaultValue,
  required = false,
  inputMode,
}: {
  label: string;
  name: string;
  error?: string;
  defaultValue?: string;
  required?: boolean;
  inputMode?: "decimal" | "numeric";
}) {
  const id = `product-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}{required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        id={id}
        name={name}
        defaultValue={defaultValue}
        required={required}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass}
      />
      {error ? <p id={`${id}-error`} className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  error,
  onChange,
  children,
}: {
  label: string;
  name: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  const id = `product-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <select id={id} name={name} value={value} onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass}>
        {children}
      </select>
      {error ? <p id={`${id}-error`} className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function TextAreaField({
  label,
  name,
  error,
  defaultValue,
}: {
  label: string;
  name: string;
  error?: string;
  defaultValue: string;
}) {
  const id = `product-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <textarea id={id} name={name} defaultValue={defaultValue} rows={4}
        aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputClass} min-h-28 resize-y`} />
      {error ? <p id={`${id}-error`} className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
