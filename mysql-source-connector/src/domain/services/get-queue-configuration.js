exports.getQueueConfigurationFactory = ({ lowDb }) => {
  return {
    getQueueConfiguration: () => {
      return lowDb.get('configuration').value();
    },
  };
};
