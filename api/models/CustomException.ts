import { Status } from "./Status";


interface ICustomException {
  title: string;
  message: string;
  stack?: string;
  status?: Status;
}

export default class CustomException extends Error {
  title: string;
  status: Status;
  override stack?: string;

  constructor({
    title,
    message,
    stack,
    status = Status.internalServerError,
  }: ICustomException) {
    super(message);
    this.title = title;
    this.message = message;
    this.stack = stack;
    this.status = status;

    // Mantener el nombre correcto para debugging
    this.name = this.constructor.name;

    // Corregir el prototipo para extender de Error en TS
    Object.setPrototypeOf(this, CustomException.prototype);
  }

  toJSON() {
    return {
      title: this.title,
      message: this.message,
      stack: this.stack,
    };
  }

  toJsonString(): string {
    return JSON.stringify(this.toJSON());
  }
}
