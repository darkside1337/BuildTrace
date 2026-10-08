import Image from "next/image";

type BrandProps = {
  variant?: "horizontal" | "mark";
  className?: string;
};

const assets = {
  horizontal: {
    src: "/brand/buildtrace-trace-horizontal-navy.png",
    width: 2172,
    height: 724,
    alt: "BuildTrace",
  },
  mark: {
    src: "/brand/buildtrace-trace-mark-navy.png",
    width: 1254,
    height: 1254,
    alt: "",
  },
} as const;

export function Brand({ variant = "horizontal", className }: BrandProps) {
  const asset = assets[variant];

  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      className={className}
      loading="eager"
      fetchPriority="high"
      aria-hidden={variant === "mark" ? true : undefined}
    />
  );
}
