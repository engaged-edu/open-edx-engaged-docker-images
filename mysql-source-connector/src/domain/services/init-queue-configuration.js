const { APP_ERROR_CODE } = require('../../constants');

exports.initQueueConfigurationFactory = ({ lowDb, AppError } = {}) => {
  return {
    initQueueConfiguration: () => {
      try {
        return lowDb
          .defaults({
            'configuration': { nextPosition: 0, binlogName: '' },
            'queue': [],
            'dead-letter-queue': [],
          })
          .write();
      } catch (initQueueError) {
        throw new AppError({
          error: initQueueError,
          code: APP_ERROR_CODE.QUEUE_INIT_CONFIG,
        });
      }
    },
  };
};
