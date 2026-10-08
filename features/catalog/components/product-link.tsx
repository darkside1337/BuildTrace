"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
export function ProductLink({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();
  const selected = pathname === href || pathname === `${href}/edit`;
  return <Link href={href} scroll={false} aria-expanded={selected} aria-current={selected ? "page" : undefined} {...props} />;
}
