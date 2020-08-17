const { QUEUE_NAME, DEAD_LETTER_QUEUE_NAME } = require('../../constants');

exports.getQueueName = ({ dlq } = {}) => {
  return dlq ? DEAD_LETTER_QUEUE_NAME : QUEUE_NAME;
};
