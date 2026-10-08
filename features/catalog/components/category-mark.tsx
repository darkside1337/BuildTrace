import { Cpu, Gpu, CircuitBoard, MemoryStick, HardDrive, PcCase, Plug, Fan, Cable } from "lucide-react";
import { cn } from "cn";
import type { categories } from "@/features/catalog/schemas";

const icons = { cpu: Cpu, gpu: Gpu, motherboard: CircuitBoard, ram: MemoryStick, storage: HardDrive, case: PcCase, power_supply: Plug, cooling: Fan, accessory: Cable };
export function CategoryMark({ category, large = false }: { category: typeof categories[number]; large?: boolean }) {
  const Icon = icons[category];
  return <span aria-hidden="true" className={cn("grid shrink-0 place-items-center border border-rule-strong bg-muted text-primary", large ? "size-28" : "size-12")}><Icon strokeWidth={1.25} className={large ? "size-16" : "size-8"} /></span>;
}
