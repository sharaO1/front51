export const CATEGORY_IDS: Record<string, string> = {
  Smartphones: "VMIUZ6I1GQNI",
  Laptops: "782UZ9PIL93T",
  Tablets: "0J8XM51VTZH6",
  Accessories: "F907ZKJ8VO8B",
  Footwear: "XLE7LQ3G6QW6",
  Clothing: "ZEVKZKZLYQ0T",
};

export const CATEGORY_NAMES_BY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_IDS).map(([name, id]) => [id, name]),
);

export function categoryNameToId(name: string | undefined | null): string | undefined {
  if (!name) return undefined;
  return CATEGORY_IDS[name] || undefined;
}

export function categoryIdToName(id: string | undefined | null): string | undefined {
  if (!id) return undefined;
  return CATEGORY_NAMES_BY_ID[id];
}
