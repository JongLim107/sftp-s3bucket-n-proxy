import BaseError from "./base-error";
import { ApiErrorType } from "./api-error-type";

export class TechnicalError extends BaseError {
  public constructor(message = "Internal Server Error", id = "") {
    super(500, ApiErrorType.technical, message, id);
  }
}
