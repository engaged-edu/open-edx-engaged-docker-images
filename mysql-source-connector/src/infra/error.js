const { ERROR_LEVEL } = require('../constants');

/**
 * @param {{ logger: import('pino').Logger }} params
 */
exports.configAppError = ({ logger } = {}) => {
  class AppError extends Error {
    constructor({ message, error, level = ERROR_LEVEL.ERROR } = {}) {
      if (error instanceof AppError) {
        error.parents.push({ message });
        return error;
      }
      super(message);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
      this.level = level;
      if (error instanceof Error) {
        this.error_origin = error;
      }
      this.parents = [];
    }
    getOriginalErrorName() {
      return this.error_origin ? this.error_origin.name : undefined;
    }
    getOriginalErrorMessage() {
      return this.error_origin ? this.error_origin.message : undefined;
    }
    dump() {
      logger({
        level: this.level,
        error_name: this.name,
        error_message: this.message,
        error_parents: this.parents,
        error_origin_name: this.getOriginalErrorName(),
        error_origin_message: this.getOriginalErrorMessage(),
      });
      return this;
    }
    flush() {
      this.dump();
      return this;
    }
  }
  return { AppError };
};
