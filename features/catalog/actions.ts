"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AccessError, requireShopContext } from "@/lib/auth/context";
import { archiveProduct, createProduct, updateProduct } from "@/features/catalog/mutations";
import { catalogFormSchema, productIdSchema } from "@/features/catalog/schemas";
import type { SaveResult } from "@/features/catalog/types";

function parseForm(formData: FormData) {
  return catalogFormSchema.safeParse(Object.fromEntries(formData));
}

function accessFailure(error: unknown): SaveResult | null {
  if (error instanceof AccessError) {
    return { ok: false, message: "Sign in with an authorized shop account to continue." };
  }
  return null;
}

export async function createProductAction(
  _previous: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  let result: SaveResult;
  try {
    const context = await requireShopContext();
    const parsed = parseForm(formData);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Correct the highlighted fields.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      };
    }
    result = await createProduct(context, parsed.data);
  } catch (error) {
    const denied = accessFailure(error);
    if (denied) return denied;
    return {
      ok: false,
      message: "Saving could not be confirmed. Check the catalog before retrying.",
    };
  }
  if (result.ok) revalidatePath("/inventory");
  return result;
}

export async function updateProductAction(
  productId: string,
  _previous: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  const id = productIdSchema.safeParse(productId);
  if (!id.success) return { ok: false, message: "This part could not be found." };

  let result: SaveResult;
  try {
    const context = await requireShopContext();
    const parsed = parseForm(formData);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Correct the highlighted fields.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      };
    }
    result = await updateProduct(context, id.data, parsed.data);
  } catch (error) {
    const denied = accessFailure(error);
    if (denied) return denied;
    return {
      ok: false,
      message: "Saving could not be confirmed. Check the part before retrying.",
    };
  }
  if (result.ok) {
    revalidatePath("/inventory");
    revalidatePath(`/inventory/${id.data}`);
  }
  return result;
}

export async function archiveProductAction(
  productId: string,
  previous: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  void previous;
  void formData;
  const id = productIdSchema.safeParse(productId);
  if (!id.success) return { ok: false, message: "This part could not be found." };

  try {
    const context = await requireShopContext();
    const archived = await archiveProduct(context, id.data);
    if (!archived) return { ok: false, message: "This active part could not be found." };
  } catch (error) {
    const denied = accessFailure(error);
    if (denied) return denied;
    return { ok: false, message: "Archiving could not be confirmed. Reload before retrying." };
  }
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id.data}`);
  return { ok: true, productId: id.data, message: "Part archived." };
}
