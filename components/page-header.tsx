import type { ReactNode } from "react";

export function PageHeader({ title, description, actions, context }: {
  title: string;
  description?: string;
  actions?: ReactNode;
  context?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3"><h1 className="break-words [overflow-wrap:anywhere] font-heading text-[35px] font-normal leading-[1.08] tracking-[-0.025em] sm:text-[43px]">{title}</h1>{context ? <div className="text-sm text-muted-foreground">{context}</div> : null}</div>
        {description ? <p className="mt-2 [overflow-wrap:anywhere] max-w-2xl text-base text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 [&>*]:min-h-11">{actions}</div> : null}
    </header>
  );
}
