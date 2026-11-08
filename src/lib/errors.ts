/**
 * Errors the API layer maps to HTTP responses. Anything else is treated as an
 * unexpected 500 and its details are never sent to the client.
 */
export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "You need to sign in to continue.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * Also used when a record exists but belongs to another user, so a caller can
 * never tell someone else's record apart from one that does not exist.
 */
export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found.`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

/** The model call failed or returned something we could not use. */
export class AnalysisError extends AppError {
  constructor(message = "We couldn't read this document right now. Please try again.") {
    super(message, 502, "ANALYSIS_FAILED");
  }
}
