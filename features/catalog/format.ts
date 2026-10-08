export function categoryLabel(value: string) {
  if (["cpu", "gpu", "ram"].includes(value)) return value.toUpperCase();
  return value.split("_").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
}
