const reservedSlugs = [
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "login",
  "register",
  "support",
  "help",
  "store",
  "stores",
];

export const createSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const isReservedSlug = (slug) => {
  return reservedSlugs.includes(slug);
};