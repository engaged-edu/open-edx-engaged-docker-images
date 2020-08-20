const { APP_ERROR_MESSAGE } = require('../../constants');
const { getQueueName } = require('../helpers/get-queue-name');

exports.getQueueFactory = ({ lowDb, AppError } = {}) => {
  return {
    getQueue: ({ dlq = false } = {}) => {
      try {
        const queue = lowDb.get(getQueueName({ dlq })).value();
        if (!Array.isArray(queue)) {
          throw new Error('the queue fetched from the local db is not an array');
        }
        return queue;
      } catch (getQueueError) {
        throw new AppError({
          message: APP_ERROR_MESSAGE.QUEUE.GET_FROM_LOCAL_DB,
          error: getQueueError,
        }).flush();
      }
    },
  };
};
