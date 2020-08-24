const joi = require('@hapi/joi');
const { APP_ERROR_CODE } = require('../../constants');

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
        joi.assert(
          res,
          joi
            .object({
              FailedEntryCount: joi.number().valid(0).required(),
              Entries: joi
                .array()
                .length(1)
                .items(
                  joi
                    .object({
                      EventId: joi.string().uuid().required(),
                    })
                    .unknown()
                    .required(),
                )
                .required(),
            })
            .unknown()
            .required(),
        );
        return { eventId: res.Entries[0].EventId };
      } catch (emitToEventBridgeError) {
        throw new AppError({
          code: APP_ERROR_CODE.EVENT_EMIT_TO_EVENTBRIDGE,
          error: emitToEventBridgeError,
        });
      }
    },
  };
};
