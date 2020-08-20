const { APP_ERROR_MESSAGE } = require('../../constants');

/**
 * @param {{ ENV: import('../../infra/config').ENV, eventBridge: import('aws-sdk').EventBridge }}
 */
exports.emitEventToEventBridgeFactory = ({ ENV, eventBridge, AppError }) => {
  return {
    emitEventToEventBridge: async ({ event, eventType }) => {
      try {
        const eventToSend = {
          EventBusName: ENV.ENGAGED_AWS_EVENTBRIDGE_BUS_NAME,
          Source: ENV.ENGAGED_AWS_EVENTBRIDGE_PRODUCER_NAME,
          Time: new Date(),
          DetailType: eventType,
          Detail: JSON.stringify({
            ...event,
            server_identifier: ENV.ENGAGED_SERVER_IDENTIFIER,
          }),
        };
        const res = await eventBridge.putEvents({ Entries: [eventToSend] }).promise();
        if (
          !res ||
          res.FailedEntryCount !== 0 ||
          !Array.isArray(res.Entries) ||
          res.Entries.length !== 1 ||
          typeof res.Entries[0].EventId !== 'string'
        ) {
          throw new Error('failed to emit event to event bridge');
        }
        return { eventId: res.Entries[0].EventId };
      } catch (emitToEventBridgeError) {
        throw new AppError({
          message: APP_ERROR_MESSAGE.EVENT.EMIT_TO_EVENTBRIDGE,
          error: emitToEventBridgeError,
        }).flush();
      }
    },
  };
};
