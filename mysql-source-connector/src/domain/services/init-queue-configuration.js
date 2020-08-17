exports.initQueueConfigurationFactory = ({ lowDb } = {}) => {
  return {
    initQueueConfiguration: () => {
      return lowDb
        .defaults({
          configuration: { nextPosition: 0, binlogName: '' },
          queue: [],
        })
        .write();
    },
  };
};
