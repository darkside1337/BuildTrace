"use client";

import { useEffect, useRef } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/button-link";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { categories } from "@/features/catalog/schemas";
import { categoryLabel } from "@/features/catalog/format";
import type { CatalogFilters } from "@/features/catalog/queries";

type CatalogFiltersToolbarProps = {
  filters: CatalogFilters;
  manufacturers: string[];
  idPrefix?: string;
};


function FilterFields({
  filters,
  manufacturers,
  idPrefix = "catalog",
}: CatalogFiltersToolbarProps) {
  const idFor = (field: string) => `${idPrefix}-${field}`;
  return (
    <>
      <Field>
        <FieldLabel htmlFor={idFor("category")}>Category</FieldLabel>
        <NativeSelect id={idFor("category")} name="category" defaultValue={filters.category ?? ""}>
          <NativeSelectOption value="">All categories</NativeSelectOption>
          {categories.map((category) => (
            <NativeSelectOption key={category} value={category}>{categoryLabel(category)}</NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor={idFor("tracking")}>Tracking</FieldLabel>
        <NativeSelect id={idFor("tracking")} name="tracking" defaultValue={filters.tracking ?? ""}>
          <NativeSelectOption value="">All tracking</NativeSelectOption>
          <NativeSelectOption value="serialized">Serial tracked</NativeSelectOption>
          <NativeSelectOption value="quantity">Quantity tracked</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor={idFor("manufacturer")}>Manufacturer</FieldLabel>
        <NativeSelect id={idFor("manufacturer")} name="manufacturer" defaultValue={filters.manufacturer ?? ""}>
          <NativeSelectOption value="">All manufacturers</NativeSelectOption>
          {manufacturers.map((manufacturer) => (
            <NativeSelectOption key={manufacturer} value={manufacturer}>{manufacturer}</NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor={idFor("sort")}>Sort by</FieldLabel>
        <NativeSelect id={idFor("sort")} name="sort" defaultValue={filters.sort ?? "name"}>
          <NativeSelectOption value="name">Part name</NativeSelectOption>
          <NativeSelectOption value="manufacturer">Manufacturer</NativeSelectOption>
          <NativeSelectOption value="referenceSalePriceCents">Sale price</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor={idFor("direction")}>Direction</FieldLabel>
        <NativeSelect id={idFor("direction")} name="direction" defaultValue={filters.direction ?? "asc"}>
          <NativeSelectOption value="asc">Ascending</NativeSelectOption>
          <NativeSelectOption value="desc">Descending</NativeSelectOption>
        </NativeSelect>
      </Field>
    </>
  );
}

function preservedState(filters: CatalogFilters) {
  return [
    ["q", filters.q ?? ""],
    ["archived", filters.archived ? "true" : "false"],
  ] as const;
}

function resetHref(filters: CatalogFilters) {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.archived) params.set("archived", "true");
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.direction) params.set("direction", filters.direction);
  const query = params.toString();
  return query ? `/inventory?${query}` : "/inventory";
}

function clearAllHref(filters: CatalogFilters) {
  const params = new URLSearchParams();
  if (filters.archived) params.set("archived", "true");
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.direction) params.set("direction", filters.direction);
  const query = params.toString();
  return query ? `/inventory?${query}` : "/inventory";
}

export function CatalogFiltersToolbar({ filters, manufacturers }: CatalogFiltersToolbarProps) {
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const filterKey = JSON.stringify(filters);
  const activeFilters = [
    filters.q?.trim() ? `Search: ${filters.q.trim()}` : null,
    filters.category ? `Category: ${categoryLabel(filters.category)}` : null,
    filters.tracking ? `Tracking: ${filters.tracking === "serialized" ? "Serial tracked" : "Quantity tracked"}` : null,
    filters.manufacturer ? `Manufacturer: ${filters.manufacturer}` : null,
  ].filter((value): value is string => Boolean(value));

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const search = window.matchMedia("(min-width: 1024px)").matches
          ? desktopSearchRef.current
          : mobileSearchRef.current;
        search?.focus();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <section aria-label="Catalog filters" className="w-full border-b px-4 py-4">
      <form key={filterKey} action="/inventory" method="get" className="hidden items-end gap-3 lg:grid lg:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_auto]">
        <div className="min-w-0">
          <label className="sr-only" htmlFor="catalog-search">Search parts</label>
          <InputGroup >
            <InputGroupInput
              ref={desktopSearchRef}
              id="catalog-search"
              name="q"
              type="search"
              defaultValue={filters.q ?? ""}
              placeholder="Search name, SKU, model, manufacturer…"
            />
            <InputGroupAddon align="inline-end" aria-hidden="true">
              <Search data-icon="inline-start" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <FieldGroup className="col-span-full grid grid-cols-2 gap-3 lg:grid-cols-5 [&>*]:min-w-0">
          <FilterFields filters={filters} manufacturers={manufacturers} idPrefix="catalog" />
        </FieldGroup>
        <input type="hidden" name="archived" value={filters.archived ? "true" : "false"} />
        <Button type="submit" variant="outline" aria-label="Apply catalog filters" className="md:col-start-2 md:row-start-1 md:justify-self-end lg:col-start-2">Apply</Button>
      </form>

      <div className="flex items-center gap-2 lg:hidden">
        <form key={filterKey} action="/inventory" method="get" className="min-w-0 flex-1">
          <InputGroup >
            <InputGroupInput
              ref={mobileSearchRef}
              id="catalog-search-mobile"
              name="q"
              type="search"
              aria-label="Search parts"
              defaultValue={filters.q ?? ""}
              placeholder="Search parts…"
            />
            <InputGroupAddon align="inline-end">
              <Button type="submit" variant="ghost" size="icon" aria-label="Search parts">
                <Search data-icon="inline-start" />
              </Button>
            </InputGroupAddon>
          </InputGroup>
          {preservedState(filters).map(([name, value]) => (
            name !== "q" && <input key={name} type="hidden" name={name} value={value} />
          ))}
          <input type="hidden" name="category" value={filters.category ?? ""} />
          <input type="hidden" name="tracking" value={filters.tracking ?? ""} />
          <input type="hidden" name="manufacturer" value={filters.manufacturer ?? ""} />
          <input type="hidden" name="sort" value={filters.sort ?? "name"} />
          <input type="hidden" name="direction" value={filters.direction ?? "asc"} />
        </form>

        <Sheet>
          <SheetTrigger render={<Button type="button" variant="outline" aria-label="Open filters" />}>
            <SlidersHorizontal data-icon="inline-start" />
            Filters
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-lg px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <SheetHeader className="px-0 pt-1">
              <SheetTitle>Filter parts</SheetTitle>
              <SheetDescription>Choose catalog filters, then apply them to the list.</SheetDescription>
            </SheetHeader>
            <form key={filterKey} action="/inventory" method="get" className="flex min-h-0 flex-1 flex-col">
              {preservedState(filters).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}
              <FieldGroup className="gap-4">
                <FilterFields filters={filters} manufacturers={manufacturers} idPrefix="catalog-mobile" />
              </FieldGroup>
              <SheetFooter className="sticky bottom-0 -mx-4 mt-5 grid grid-cols-2 gap-2 border-t border-border bg-popover px-4 pt-3 pb-0">
                <ButtonLink href={resetHref(filters)} variant="outline">Reset</ButtonLink>
                <Button type="submit">Apply filters</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Applied filters">
          {activeFilters.map((filter) => <Badge key={filter} variant="outline">{filter}</Badge>)}
          <ButtonLink href={clearAllHref(filters)} variant="link" size="sm" className="min-h-11">Clear all</ButtonLink>
        </div>
      )}
    </section>
  );
}
