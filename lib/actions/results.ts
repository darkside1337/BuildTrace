export type ActionFieldErrors = Record<string, string[]>;

export type ActionError = {
  message: string;
  code?: string;
};

/** Values returned from Server Actions must be safe to serialize to the client. */
export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: ActionError;
      fieldErrors?: ActionFieldErrors;
    };
