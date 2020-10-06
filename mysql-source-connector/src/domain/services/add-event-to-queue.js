exports.addEventToQueueFactory = ({ getQueue, setQueue } = {}) => {
  return {
    addEventToQueue: ({ event, dlq } = {}) => {
      const queue = getQueue({ dlq });
      queue.push(event);
      return setQueue({ queue, dlq });
    },
  };
};
