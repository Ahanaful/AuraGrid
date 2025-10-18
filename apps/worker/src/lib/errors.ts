import { ZodError } from "zod";
import type { Context } from "hono";

export function jsonError(c: Context, error: unknown, status = 500) {
  if (error instanceof ZodError) {
    return c.json(
      {
        error: "Invalid payload",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      400,
    );
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return c.json({ error: message }, status);
}
