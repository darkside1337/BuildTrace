CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"shop_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_provider_check" CHECK ("shop_memberships"."provider_id" in ('github', 'google')),
	CONSTRAINT "memberships_role_check" CHECK ("shop_memberships"."role" in ('owner', 'staff'))
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"shop_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"manufacturer" text NOT NULL,
	"model" text NOT NULL,
	"sku" text NOT NULL,
	"manufacturer_part_number" text,
	"barcode" text,
	"tracking_mode" text NOT NULL,
	"reference_purchase_cost_cents" bigint,
	"reference_sale_price_cents" bigint,
	"low_stock_threshold" integer,
	"supplier_warranty_months" integer,
	"customer_warranty_months" integer,
	"specifications" text,
	"notes" text,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	"archived_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "products_category_check" CHECK ("products"."category" in ('cpu', 'gpu', 'motherboard', 'ram', 'storage', 'case', 'power_supply', 'cooling', 'accessory')),
	CONSTRAINT "products_tracking_check" CHECK ("products"."tracking_mode" in ('serialized', 'quantity')),
	CONSTRAINT "products_serial_required_check" CHECK ("products"."category" not in ('cpu', 'gpu', 'motherboard', 'storage') or "products"."tracking_mode" = 'serialized'),
	CONSTRAINT "products_purchase_cost_nonnegative" CHECK ("products"."reference_purchase_cost_cents" is null or "products"."reference_purchase_cost_cents" >= 0),
	CONSTRAINT "products_sale_price_nonnegative" CHECK ("products"."reference_sale_price_cents" is null or "products"."reference_sale_price_cents" >= 0),
	CONSTRAINT "products_low_stock_nonnegative" CHECK ("products"."low_stock_threshold" is null or "products"."low_stock_threshold" >= 0),
	CONSTRAINT "products_supplier_warranty_nonnegative" CHECK ("products"."supplier_warranty_months" is null or "products"."supplier_warranty_months" >= 0),
	CONSTRAINT "products_customer_warranty_nonnegative" CHECK ("products"."customer_warranty_months" is null or "products"."customer_warranty_months" >= 0),
	CONSTRAINT "products_archive_pair_check" CHECK (("products"."archived_at" is null) = ("products"."archived_by" is null))
);
--> statement-breakpoint
CREATE TABLE "shops" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_memberships" ADD CONSTRAINT "shop_memberships_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_archived_by_user_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_unique" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_provider_identity_unique" ON "shop_memberships" USING btree ("provider_id","provider_account_id");--> statement-breakpoint
CREATE INDEX "memberships_shop_id_idx" ON "shop_memberships" USING btree ("shop_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_shop_sku_unique" ON "products" USING btree ("shop_id","sku");--> statement-breakpoint
CREATE INDEX "products_shop_archived_idx" ON "products" USING btree ("shop_id","archived_at");--> statement-breakpoint
CREATE INDEX "products_shop_category_tracking_idx" ON "products" USING btree ("shop_id","category","tracking_mode");