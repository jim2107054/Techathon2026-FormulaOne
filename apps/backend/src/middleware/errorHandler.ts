import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../lib/HttpError";

export function requestLogger(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const startedAt = Date.now();

  response.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(
      `${request.method} ${request.originalUrl} -> ${response.statusCode} (${durationMs}ms)`,
    );
  });

  next();
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  const err = error instanceof Error ? error : new Error("Unknown error");
  console.error(err.message);
  if (err.stack) {
    console.error(err.stack);
  }

  response.status(500).json({ error: "Internal server error" });
}
