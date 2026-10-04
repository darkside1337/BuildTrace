export type SaveResult =
  | { ok: true; productId: string; message?: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };
