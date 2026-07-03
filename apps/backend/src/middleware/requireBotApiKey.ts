import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";
import { HttpError } from "../lib/HttpError";

export function requireBotApiKey(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const apiKey = request.header("x-api-key");

  if (!apiKey || apiKey !== env.BOT_API_KEY) {
    next(new HttpError(401, "Unauthorized"));
    return;
  }

  next();
}
