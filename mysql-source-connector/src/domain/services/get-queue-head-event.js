exports.getQueueHeadEventFactory = ({ getQueue } = {}) => {
  return {
    getQueueHeadEvent: ({ dlq } = {}) => {
      return getQueue({ dlq })[0];
    },
  };
};
