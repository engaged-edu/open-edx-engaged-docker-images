const assert = require('assert');
const { addEventToQueueFactory } = require('./add-event-to-queue');

describe('[service] add event to queue', () => {
  it('Should append an event on a queue', () => {
    const { addEventToQueue } = addEventToQueueFactory({
      getQueue: () => [],
      setQueue: ({ queue } = {}) => queue,
    });
    const event = { myKey: 'myValue' };
    const queue = addEventToQueue({ event });
    assert.deepStrictEqual(queue, [event]);
    return;
  });
});
