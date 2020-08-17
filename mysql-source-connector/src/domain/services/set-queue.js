const { getQueueName } = require('../helpers/get-queue-name');

exports.setQueueFactory = ({ lowDb } = {}) => {
  return {
    setQueue: ({ queue, dlq = false } = {}) => {
      if (!Array.isArray(queue)) {
        throw new Error('Invalid queue type');
      }
      return lowDb.set(getQueueName({ dlq }), queue).write();
    },
  };
};
