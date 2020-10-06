const { APP_ERROR_CODE } = require('../../constants');

exports.getQueueConfigurationFactory = ({ lowDb, AppError }) => {
  return {
    getQueueConfiguration: () => {
      try {
        return lowDb.get('configuration').value();
      } catch (getQueueConfigurationError) {
        throw new AppError({
          error: getQueueConfigurationError,
          code: APP_ERROR_CODE.QUEUE_GET_CONFIG,
        });
      }
    },
  };
};
