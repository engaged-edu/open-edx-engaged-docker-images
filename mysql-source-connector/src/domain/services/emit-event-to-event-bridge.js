/**
 * @param {{ ENV: import('../../infra/config').ENV, eventBridge: import('aws-sdk').EventBridge }}
 */
exports.emitEventToEventBridgeFactory = ({ ENV, eventBridge }) => {
  return {
    emitEventToEventBridge: async ({ event, eventType }) => {
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
    },
  };
};
