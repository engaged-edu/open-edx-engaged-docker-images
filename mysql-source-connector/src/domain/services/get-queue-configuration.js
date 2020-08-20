const { APP_ERROR_MESSAGE } = require('../../constants');

exports.getQueueConfigurationFactory = ({ lowDb, AppError }) => {
  return {
    getQueueConfiguration: () => {
      try {
        return lowDb.get('configuration').value();
      } catch (getQueueConfigurationError) {
        throw new AppError({
          error: getQueueConfigurationError,
          message: APP_ERROR_MESSAGE.QUEUE.GET_CONFIG,
        });
      }
    },
  };
};
