/**
 * @param {{ aws: import('aws-sdk') }} params
 */
exports.configAWSEventBridge = ({ ENV, aws }) => {
  const eventBridge = new aws.EventBridge();
  eventBridge.config.update({ region: ENV.ENGAGED_AWS_EVENTBRIDGE_BUS_REGION });
  return { eventBridge };
};
