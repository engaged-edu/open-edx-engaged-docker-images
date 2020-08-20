/**
 * @param {{ aws: import('aws-sdk') }} params
 */
exports.configAWSEventBridge = ({ aws }) => {
  const eventBridge = new aws.EventBridge();
  return { eventBridge };
};
