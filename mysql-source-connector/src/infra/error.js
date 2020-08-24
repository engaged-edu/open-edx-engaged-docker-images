const { ERROR_LEVEL, APP_ERROR_CODE, APP_ERROR_MESSAGE } = require('../constants');

/**
 * @param {{ logger: import('pino').Logger }} params
 */
exports.configAppError = ({ apm, logger } = {}) => {
  class AppError extends Error {
    constructor({ error, code = APP_ERROR_CODE.DEFAULT, level = ERROR_LEVEL.ERROR, labels = {}, context = {} } = {}) {
      const message = APP_ERROR_MESSAGE[code];
      if (error instanceof AppError) {
        error.labels = {
          ...labels,
          ...error.labels,
        };
        error.context = {
          ...context,
          ...error.context,
        };
        error.parents.push({ code, message });
        return error;
      }
      super(message);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
      this.code = code;
      this.level = level;
      this.labels = labels;
      this.context = context;
      this.parents = [];
      if (error instanceof Error) {
        this.error_origin = error;
      }
    }
    getOriginalErrorName() {
      return this.error_origin ? this.error_origin.name : undefined;
    }
    getOriginalErrorMessage() {
      return this.error_origin ? this.error_origin.message : undefined;
    }
    dump() {
      logger.error({
        level: this.level,
        error_name: this.name,
        error_message: this.message,
        error_parents: this.parents,
        error_origin_name: this.getOriginalErrorName(),
        error_origin_message: this.getOriginalErrorMessage(),
      });
      return this;
    }
    track() {
      const error = this.error_origin ? this.error_origin : this;
      apm.captureError(error, {
        message: this.message,
        custom: this.context,
        labels: {
          ...this.labels,
          error_code: this.code,
        },
      });
      return this;
    }
    flush() {
      return this.dump().track();
    }
    toObject() {
      return { ...this };
    }
  }
  return { AppError };
};
