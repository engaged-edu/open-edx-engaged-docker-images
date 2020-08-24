const { getQueueName } = require('../helpers/get-queue-name');
const { APP_ERROR_CODE } = require('../../constants');

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
          code: APP_ERROR_CODE.QUEUE_SET_ON_LOCAL_DB,
          error: setQueueError,
        });
      }
    },
  };
};
