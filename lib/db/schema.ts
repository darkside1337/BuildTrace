import {
  boolean,
  bigint,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const authUser = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const authSession = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
}, (table) => [index("session_user_id_idx").on(table.userId)]);

export const authAccount = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("account_provider_account_unique").on(table.providerId, table.accountId),
  index("account_user_id_idx").on(table.userId),
]);

export const authVerification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

export const shops = pgTable("shops", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const memberships = pgTable("shop_memberships", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  shopId: text("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  providerId: text("provider_id").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  role: text("role", { enum: ["owner", "staff"] }).notNull().default("owner"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("memberships_provider_identity_unique").on(table.providerId, table.providerAccountId),
  index("memberships_shop_id_idx").on(table.shopId),
  check("memberships_provider_check", sql`${table.providerId} in ('github', 'google')`),
  check("memberships_role_check", sql`${table.role} in ('owner', 'staff')`),
]);

export const products = pgTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  shopId: text("shop_id").notNull().references(() => shops.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  category: text("category", {
    enum: ["cpu", "gpu", "motherboard", "ram", "storage", "case", "power_supply", "cooling", "accessory"],
  }).notNull(),
  manufacturer: text("manufacturer").notNull(),
  model: text("model").notNull(),
  sku: text("sku").notNull(),
  manufacturerPartNumber: text("manufacturer_part_number"),
  barcode: text("barcode"),
  trackingMode: text("tracking_mode", { enum: ["serialized", "quantity"] }).notNull(),
  referencePurchaseCostCents: bigint("reference_purchase_cost_cents", { mode: "number" }),
  referenceSalePriceCents: bigint("reference_sale_price_cents", { mode: "number" }),
  lowStockThreshold: integer("low_stock_threshold"),
  supplierWarrantyMonths: integer("supplier_warranty_months"),
  customerWarrantyMonths: integer("customer_warranty_months"),
  specifications: text("specifications"),
  notes: text("notes"),
  createdBy: text("created_by").notNull().references(() => authUser.id, { onDelete: "restrict" }),
  updatedBy: text("updated_by").notNull().references(() => authUser.id, { onDelete: "restrict" }),
  archivedBy: text("archived_by").references(() => authUser.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  archivedAt: timestamp("archived_at"),
}, (table) => [
  uniqueIndex("products_shop_sku_unique").on(table.shopId, table.sku),
  index("products_shop_archived_idx").on(table.shopId, table.archivedAt),
  index("products_shop_category_tracking_idx").on(table.shopId, table.category, table.trackingMode),
  check("products_category_check", sql`${table.category} in ('cpu', 'gpu', 'motherboard', 'ram', 'storage', 'case', 'power_supply', 'cooling', 'accessory')`),
  check("products_tracking_check", sql`${table.trackingMode} in ('serialized', 'quantity')`),
  check("products_serial_required_check", sql`${table.category} not in ('cpu', 'gpu', 'motherboard', 'storage') or ${table.trackingMode} = 'serialized'`),
  check("products_purchase_cost_nonnegative", sql`${table.referencePurchaseCostCents} is null or ${table.referencePurchaseCostCents} >= 0`),
  check("products_sale_price_nonnegative", sql`${table.referenceSalePriceCents} is null or ${table.referenceSalePriceCents} >= 0`),
  check("products_low_stock_nonnegative", sql`${table.lowStockThreshold} is null or ${table.lowStockThreshold} >= 0`),
  check("products_supplier_warranty_nonnegative", sql`${table.supplierWarrantyMonths} is null or ${table.supplierWarrantyMonths} >= 0`),
  check("products_customer_warranty_nonnegative", sql`${table.customerWarrantyMonths} is null or ${table.customerWarrantyMonths} >= 0`),
  check("products_archive_pair_check", sql`(${table.archivedAt} is null) = (${table.archivedBy} is null)`),
]);

export const schema = {
  user: authUser,
  session: authSession,
  account: authAccount,
  verification: authVerification,
  shops,
  memberships,
  products,
};
