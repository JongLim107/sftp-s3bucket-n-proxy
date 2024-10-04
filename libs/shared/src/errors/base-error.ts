import { v4 as generateUUID } from "uuid";
import { ApiErrorType } from "./api-error-type";

export default class BaseError extends Error {
  public readonly id: string;

  public readonly status: number;

  public readonly type: ApiErrorType;

  public constructor(status: number, type: ApiErrorType, message: string | undefined, id = "") {
    super(message || "");
    this.id = id || generateUUID(); // fixme: should get id from request
    this.type = type;
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
    Object.defineProperty(this, "id", {
      writable: false,
    });
    Object.defineProperty(this, "message", {
      enumerable: true,
      writable: false,
    });
    Object.defineProperty(this, "status", {
      enumerable: false,
      writable: false,
    });
    Object.defineProperty(this, "type", {
      writable: false,
    });
  }
}
