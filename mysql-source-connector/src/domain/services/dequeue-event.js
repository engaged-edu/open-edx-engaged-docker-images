const { EVENT_HANDLER_CONFIG, APP_ERROR_MESSAGE } = require('../../constants');

exports.dequeueEventFactory = ({
  AppError,
  getQueueHeadEvent,
  removeQueueHeadEvent,
  handleQueueEvent,
  addEventToQueue,
} = {}) => {
  return {
    dequeueEvent: async () => {
      const event = getQueueHeadEvent();
      if (!event || typeof event.table !== 'string' || !(event.table in EVENT_HANDLER_CONFIG)) {
        return;
      }
      const { eventAffectedRowUserField } = EVENT_HANDLER_CONFIG[event.table];
      try {
        await handleQueueEvent({ event, eventAffectedRowUserField });
      } catch (eventHandlerError) {
        const eventError = new AppError({
          message: APP_ERROR_MESSAGE.QUEUE.HANDLING_EVENT,
          error: eventHandlerError,
        }).flush();
        event.fail_reason = eventError.toObject();
        try {
          addEventToQueue({ event, dlq: true });
        } catch (dlqEventError) {
          throw new AppError({
            message: APP_ERROR_MESSAGE.QUEUE.ADD_TO_DLQ,
            error: dlqEventError,
          });
        }
      }
      removeQueueHeadEvent();
      return;
    },
  };
};
