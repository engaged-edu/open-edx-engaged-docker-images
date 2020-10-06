exports.removeQueueHeadEventFactory = ({ getQueue, setQueue } = {}) => {
  return {
    removeQueueHeadEvent: ({ dlq } = {}) => {
      const queue = getQueue({ dlq }).slice(1);
      return setQueue({ queue, dlq });
    },
  };
};
