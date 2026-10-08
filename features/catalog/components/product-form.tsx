"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCatalogSession, CatalogDiscardDialog } from "@/features/catalog/components/catalog-session";
import { cn } from "cn";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/button-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Field as FormField, FieldLabel, FieldError, FieldGroup, FieldSet, FieldLegend, FieldDescription } from "@/components/ui/field";
import { categoryLabel } from "@/features/catalog/format";
import { categories, defaultTrackingMode } from "@/features/catalog/schemas";
import { createProductAction, updateProductAction } from "@/features/catalog/actions";
import type { SaveResult } from "@/features/catalog/types";
import type { products } from "@/lib/db/schema";

type ProductRow = typeof products.$inferSelect;
type Props = { mode: "create" | "edit"; product?: ProductRow; panel?: boolean };
const usdInput = (cents: number | null | undefined) => cents == null ? "" : (cents / 100).toFixed(2);
const labels: Record<string, string> = {
  name: "Part name", manufacturer: "Manufacturer", model: "Model", sku: "Internal SKU",
  category: "Category", trackingMode: "Tracking mode", manufacturerPartNumber: "Manufacturer part number",
  barcode: "Barcode", referencePurchaseCostCents: "Reference purchase cost", referenceSalePriceCents: "Reference sale price",
  lowStockThreshold: "Low-stock threshold", supplierWarrantyMonths: "Supplier / manufacturer warranty",
  customerWarrantyMonths: "Shop / customer warranty", specifications: "Basic specifications", notes: "Notes",
};

function ProductFormFields({ mode, product, panel = false }: Props) {
  const session = useCatalogSession();
  const router = useRouter();
  const draftKey = product?.id ?? "new";
  const [draft] = useState(() => session?.readDraft(draftKey));
  const boundUpdate = product ? updateProductAction.bind(null, product.id) : null;
  const action = mode === "create" ? createProductAction : boundUpdate!;
  const [state, formAction, pending] = useActionState<SaveResult | null, FormData>(async (previous, data) => {
    session?.setFormStatus(draftKey, true, true);
    try {
      const result = await action(previous, data);
      session?.setFormStatus(draftKey, !result.ok, false);
      if (result.ok) session?.writeDraft(draftKey, null);
      return result;
    } catch {
      session?.setFormStatus(draftKey, true, false);
      return { ok: false, message: "Saving could not be confirmed. Check the catalog before retrying." };
    }
  }, null);
  const [category, setCategory] = useState((draft?.category as typeof categories[number]) ?? product?.category ?? "cpu");
  const [trackingMode, setTrackingMode] = useState((draft?.trackingMode as "serialized" | "quantity") ?? product?.trackingMode ?? defaultTrackingMode("cpu"));
  // Controlled fields retain the submitted draft when a Server Action returns validation/failure.
  const [values, setValues] = useState<Record<string, string>>(() => draft?.values ?? ({
    name: product?.name ?? "", manufacturer: product?.manufacturer ?? "", model: product?.model ?? "", sku: product?.sku ?? "",
    manufacturerPartNumber: product?.manufacturerPartNumber ?? "", barcode: product?.barcode ?? "",
    referencePurchaseCostCents: usdInput(product?.referencePurchaseCostCents), referenceSalePriceCents: usdInput(product?.referenceSalePriceCents),
    lowStockThreshold: product?.lowStockThreshold?.toString() ?? "", supplierWarrantyMonths: product?.supplierWarrantyMonths?.toString() ?? "",
    customerWarrantyMonths: product?.customerWarrantyMonths?.toString() ?? "", specifications: product?.specifications ?? "", notes: product?.notes ?? "",
  }));
  const [initial] = useState(() => JSON.stringify({ values: {
    name: product?.name ?? "", manufacturer: product?.manufacturer ?? "", model: product?.model ?? "", sku: product?.sku ?? "",
    manufacturerPartNumber: product?.manufacturerPartNumber ?? "", barcode: product?.barcode ?? "",
    referencePurchaseCostCents: usdInput(product?.referencePurchaseCostCents), referenceSalePriceCents: usdInput(product?.referenceSalePriceCents),
    lowStockThreshold: product?.lowStockThreshold?.toString() ?? "", supplierWarrantyMonths: product?.supplierWarrantyMonths?.toString() ?? "",
    customerWarrantyMonths: product?.customerWarrantyMonths?.toString() ?? "", specifications: product?.specifications ?? "", notes: product?.notes ?? "",
  }, category: product?.category ?? "cpu", trackingMode: product?.trackingMode ?? defaultTrackingMode("cpu") }));
  const serialized = JSON.stringify({ values, category, trackingMode });
  const dirty = serialized !== initial && !state?.ok;
  useEffect(() => {
    session?.setFormStatus(draftKey, dirty, pending);
    session?.writeDraft(draftKey, dirty ? { values, category, trackingMode } : null);
  }, [session, draftKey, dirty, pending, values, category, trackingMode]);
  useEffect(() => {
    if (state?.ok) { session?.resetDraft(draftKey); toast.success(state.message ?? "Part saved."); router.replace(`/inventory/${state.productId}`); }
  }, [state, session, draftKey, router]);
  const errorSummary = useRef<HTMLDivElement>(null);
  const trackingRequired = defaultTrackingMode(category) === "serialized";
  const errors = state && !state.ok ? state.fieldErrors : undefined;
  useEffect(() => { if (state && !state.ok) { const first = Object.keys(state.fieldErrors ?? {}).find(key => labels[key]); if (first) document.getElementById(`product-${first}`)?.focus(); else errorSummary.current?.focus(); } }, [state]);
  function field(name: string) {
    return { name, value: values[name], error: errors?.[name]?.[0], onValueChange: (value: string) => setValues(current => ({ ...current, [name]: value })) };
  }

  // React resets action forms even for returned domain failures. Keep native selects with the draft.
  return <form data-catalog-form={draftKey} data-dirty={dirty} noValidate action={formAction} onReset={event => event.preventDefault()} className="flex min-w-0 flex-col gap-6" aria-busy={pending}>
    {state && !state.ok ? <div ref={errorSummary} tabIndex={-1} className="outline-none focus-visible:ring-2 focus-visible:ring-destructive"><Alert variant="destructive"><AlertCircle aria-hidden="true" /><AlertTitle>Part could not be saved</AlertTitle><AlertDescription><p>{state.message}</p>{errors ? <ul className="mt-2 flex list-inside list-disc flex-col gap-1">{Object.entries(errors).filter(([name, messages]) => labels[name] && messages?.length).map(([name, messages]) => <li key={name}><a className="inline-flex min-h-11 items-center underline underline-offset-4" href={`#product-${name}`}>{labels[name]}: {messages?.[0]}</a></li>)}</ul> : null}</AlertDescription></Alert></div> : null}
    {state?.ok ? <Alert variant="success" role="status"><AlertTitle>{state.message ?? "Part saved."}</AlertTitle><AlertDescription><ButtonLink href={`/inventory/${state.productId}`} variant="link">View saved part</ButtonLink></AlertDescription></Alert> : null}
    <fieldset disabled={pending} className="contents">
    <div className={cn("grid min-w-0 gap-6", !panel && "lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start")}>
      <div className="flex min-w-0 flex-col gap-7 border bg-card p-5 sm:p-6">
        <FieldSet><FieldLegend>Part identity</FieldLegend><FieldDescription>Identify the product model. Fields marked * are required.</FieldDescription><FieldGroup className={cn("grid gap-5", !panel && "sm:grid-cols-2")}>
          <Field label="Part name" {...field("name")} required />
          <Field label="Manufacturer" {...field("manufacturer")} required />
          <Field label="Model" {...field("model")} required />
          <Field label="Internal SKU" {...field("sku")} required identifier />
          <SelectField label="Category" name="category" error={errors?.category?.[0]} value={category} onChange={value => {
            const next = value as typeof category; setCategory(next);
            if (defaultTrackingMode(next) === "serialized") setTrackingMode("serialized");
            else if (defaultTrackingMode(category) === "serialized") setTrackingMode(defaultTrackingMode(next));
          }}>{categories.map(value => <option key={value} value={value}>{categoryLabel(value)}</option>)}</SelectField>
        </FieldGroup></FieldSet>
        <FieldSet className="border-t pt-6"><FieldLegend>Model identifiers</FieldLegend><FieldDescription>Optional identifiers refer to the model, not an individual unit’s serial number.</FieldDescription><FieldGroup className={cn("grid gap-5", !panel && "sm:grid-cols-2")}><Field label="Manufacturer part number" {...field("manufacturerPartNumber")} identifier /><Field label="Barcode" {...field("barcode")} identifier /></FieldGroup></FieldSet>
        <FieldSet className="border-t pt-6"><FieldLegend>Specifications & notes</FieldLegend><FieldGroup><TextAreaField label="Basic specifications" {...field("specifications")} /><TextAreaField label="Notes" {...field("notes")} /></FieldGroup></FieldSet>
      </div>
      <div className="flex min-w-0 flex-col gap-7 border bg-card p-5 sm:p-6">
        <FieldSet><FieldLegend>Tracking rules</FieldLegend><FieldGroup><SelectField label="Tracking mode" name="trackingMode" error={errors?.trackingMode?.[0]} value={trackingMode} onChange={value => setTrackingMode(value as typeof trackingMode)}><option value="serialized">Serial tracked</option><option value="quantity" disabled={trackingRequired}>Quantity tracked</option></SelectField><FieldDescription>{trackingRequired ? "Serial tracking is required for this category." : "Choose serial tracking to identify individual units, or quantity tracking to count parts."}</FieldDescription><Field label="Low-stock threshold" {...field("lowStockThreshold")} inputMode="numeric" /></FieldGroup></FieldSet>
        <FieldSet className="border-t pt-6"><FieldLegend>Reference prices</FieldLegend><FieldDescription>Reference values in USD. They do not change historical transaction prices.</FieldDescription><FieldGroup><Field label="Purchase cost (USD)" {...field("referencePurchaseCostCents")} inputMode="decimal" /><Field label="Sale price (USD)" {...field("referenceSalePriceCents")} inputMode="decimal" /></FieldGroup></FieldSet>
        <FieldSet className="border-t pt-6"><FieldLegend>Warranty defaults</FieldLegend><FieldDescription>Optional durations. These defaults do not confirm coverage for a physical unit.</FieldDescription><FieldGroup><Field label="Supplier / manufacturer (months)" {...field("supplierWarrantyMonths")} inputMode="numeric" /><Field label="Shop / customer (months)" {...field("customerWarrantyMonths")} inputMode="numeric" /></FieldGroup></FieldSet>
      </div>
    </div>
    <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"><p className="text-sm text-muted-foreground">Saving a part does not add stock.</p><div className="flex flex-wrap gap-3"><ButtonLink href={product ? `/inventory/${product.id}` : "/inventory"} variant="outline">Cancel</ButtonLink><Button type="submit" className="min-w-36 gap-2" disabled={pending}>{pending ? <LoaderCircle aria-hidden="true" data-icon="inline-start" className="animate-spin" /> : null}{pending ? "Saving…" : mode === "create" ? "Create part" : "Save changes"}</Button></div></div>
    </fieldset>
    <CatalogDiscardDialog />
  </form>;
}

type ControlledField = { name: string; error?: string; value: string; onValueChange: (value: string) => void };
function Field({ label, name, error, value, onValueChange, required = false, inputMode, identifier = false }: ControlledField & { label: string; required?: boolean; inputMode?: "decimal" | "numeric"; identifier?: boolean }) {
  const id = `product-${name}`;
  return <FormField data-invalid={Boolean(error)}><FieldLabel htmlFor={id}>{label}{required ? <span aria-hidden="true"> *</span> : null}</FieldLabel><Input id={id} name={name} value={value} onChange={event => onValueChange(event.target.value)} required={required} inputMode={inputMode} className={identifier ? "font-mono" : undefined} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />{error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}</FormField>;
}
function SelectField({ label, name, value, error, onChange, children }: { label: string; name: string; value: string; error?: string; onChange: (value: string) => void; children: React.ReactNode }) {
  const id = `product-${name}`;
  return <FormField data-invalid={Boolean(error)}><FieldLabel htmlFor={id}>{label}</FieldLabel><NativeSelect id={id} name={name} value={value} onChange={event => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}>{children}</NativeSelect>{error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}</FormField>;
}
function TextAreaField({ label, name, error, value, onValueChange }: ControlledField & { label: string }) {
  const id = `product-${name}`;
  return <FormField data-invalid={Boolean(error)}><FieldLabel htmlFor={id}>{label}</FieldLabel><Textarea id={id} name={name} value={value} onChange={event => onValueChange(event.target.value)} rows={4} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="min-h-28 resize-y" />{error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}</FormField>;
}

export function ProductForm(props: Props) {
  const session = useCatalogSession();
  return <ProductFormFields key={`${props.product?.id ?? "new"}:${session?.epoch ?? 0}`} {...props} />;
}
