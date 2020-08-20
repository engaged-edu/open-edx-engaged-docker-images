const { APP_ERROR_MESSAGE } = require('../../constants');

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
        throw new AppError({ message: APP_ERROR_MESSAGE.QUEUE.INIT_CONFIG, error: initQueueError });
      }
    },
  };
};
