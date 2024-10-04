import BaseError from "./base-error";
import { ApiErrorType } from "./api-error-type";

export class AuthorizationError extends BaseError {
  public constructor(message = "Internal Server Error", id = "") {
    super(401, ApiErrorType.authorization, message, id);
  }
}
