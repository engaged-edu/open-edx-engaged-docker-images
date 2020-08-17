exports.handleMySQLEventFactory = ({ addEventToQueue, updateQueueConfiguration } = {}) => {
  return {
    handleMySQLEvent: (event) => {
      addEventToQueue({ event });
      const { nextPosition, binlogName } = event;
      updateQueueConfiguration({ nextPosition, binlogName });
      return;
    },
  };
};
