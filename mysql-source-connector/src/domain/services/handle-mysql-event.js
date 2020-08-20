exports.handleMySQLEventFactory = ({ addEventToQueue, updateQueueConfiguration, statement, ENV, expression } = {}) => {
  return {
    handleMySQLEvent: () => ({
      name: ENV.OPEN_EDX_MYSQL_DATABASE,
      expression,
      statement,
      onEvent: (event) => {
        addEventToQueue({ event });
        const { nextPosition, binlogName } = event;
        updateQueueConfiguration({ nextPosition, binlogName });
        return;
      },
    }),
  };
};
