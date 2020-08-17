const { EVENT_HANDLER_CONFIG } = require('../../constants');

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
        const eventError = new AppError({ message: '', error: eventHandlerError }).flush();
        event.fail_reason = eventError.toObject();
        try {
          addEventToQueue({ event, dlq: true });
        } catch (dlqEventError) {
          // thorw
        }
      }
      removeQueueHeadEvent();
      return;
    },
  };
};
