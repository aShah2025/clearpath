import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AppError } from "@/lib/errors";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    issues?: { path: string; message: string }[];
  };
};

export function errorResponse(
  status: number,
  code: string,
  message: string,
  issues?: ApiErrorBody["error"]["issues"],
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: { code, message, ...(issues && { issues }) } }, { status });
}

/**
 * Converts anything thrown in a route handler into a JSON error. Known errors
 * keep their message; unknown ones are logged and returned as a generic 500
 * so internal details never reach the client.
 */
export function handleRouteError(error: unknown, route: string): NextResponse<ApiErrorBody> {
  if (error instanceof AppError) {
    return errorResponse(error.status, error.code, error.message);
  }
  if (error instanceof z.ZodError) {
    return errorResponse(
      400,
      "INVALID_REQUEST",
      "The request is not valid.",
      error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    );
  }
  console.error(`[api] Unhandled error in ${route}`, error);
  return errorResponse(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
}

/**
 * Reads and validates a JSON body, rejecting oversized payloads before they
 * are parsed.
 */
export async function parseJsonBody<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
  maxBytes: number,
): Promise<z.infer<Schema>> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > maxBytes) {
    throw new AppError("The request is too large.", 413, "PAYLOAD_TOO_LARGE");
  }

  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > maxBytes) {
    throw new AppError("The request is too large.", 413, "PAYLOAD_TOO_LARGE");
  }

  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    throw new AppError("The request body must be valid JSON.", 400, "INVALID_JSON");
  }
  return schema.parse(json);
}
