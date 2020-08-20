const { getQueueName } = require('../helpers/get-queue-name');
const { APP_ERROR_MESSAGE } = require('../../constants');

exports.setQueueFactory = ({ lowDb, AppError } = {}) => {
  return {
    setQueue: ({ queue, dlq = false } = {}) => {
      try {
        if (!Array.isArray(queue)) {
          throw new Error('Invalid queue type');
        }
        return lowDb.set(getQueueName({ dlq }), queue).write();
      } catch (setQueueError) {
        throw new AppError({
          message: APP_ERROR_MESSAGE.QUEUE.SET_ON_LOCAL_DB,
          error: setQueueError,
        }).flush();
      }
    },
  };
};
