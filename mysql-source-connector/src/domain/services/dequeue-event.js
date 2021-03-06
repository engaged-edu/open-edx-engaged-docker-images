const { EVENT_HANDLER_CONFIG, APP_ERROR_CODE } = require('../../constants');

exports.dequeueEventFactory = ({
  AppError,
  getQueueHeadEvent,
  removeQueueHeadEvent,
  handleQueueEvent,
  addEventToQueue,
  apm,
} = {}) => {
  return {
    dequeueEvent: async () => {
      const event = getQueueHeadEvent();
      if (!event || typeof event.table !== 'string' || !(event.table in EVENT_HANDLER_CONFIG)) {
        return;
      }
      apm.startTransaction('dequeue-event', 'db', 'lowdb');
      const { eventAffectedRowUserField } = EVENT_HANDLER_CONFIG[event.table];
      try {
        await handleQueueEvent({ event, eventAffectedRowUserField });
      } catch (eventHandlerError) {
        const eventError = new AppError({
          code: APP_ERROR_CODE.QUEUE_HANDLING_EVENT,
          error: eventHandlerError,
          context: {
            mysql_trigger_event: event,
          },
        }).flush();
        event.fail_reason = eventError.toObject();
        try {
          addEventToQueue({ event, dlq: true });
        } catch (dlqEventError) {
          throw new AppError({
            code: APP_ERROR_CODE.QUEUE_ADD_TO_DLQ,
            error: dlqEventError,
            context: {
              mysql_trigger_event: event,
            },
          });
        }
      }
      removeQueueHeadEvent();
      apm.endTransaction(200);
      return;
    },
  };
};
