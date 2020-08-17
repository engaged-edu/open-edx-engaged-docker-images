exports.handleQueueEventFactory = ({ fetchUsersFromOpenEdx, emitEventToEventBridge }) => {
  return {
    handleQueueEvent: async ({ event, eventAffectedRowUserField } = {}) => {
      if (!event || !Array.isArray(event.affectedRows) || event.affectedRows.length === 0) {
        throw new Error('Invalid event');
      }

      // Percorrer lista de affectedrows do evento, pegando o id do aluno em cada after e adicionando em um array
      const usersId = event.affectedRows
        .map((affectedRow) => {
          let user_id = undefined;
          if (affectedRow.after[eventAffectedRowUserField]) {
            user_id = affectedRow.after[eventAffectedRowUserField];
          } else if (affectedRow.before[eventAffectedRowUserField]) {
            user_id = affectedRow.before[eventAffectedRowUserField];
          }
          affectedRow.user = user_id;
          return user_id;
        })
        .filter((value) => !!value);

      const users = await fetchUsersFromOpenEdx({ usersId }).reduce((users, user) => {
        if (!user || typeof user.id !== 'number') {
          throw new Error('Fetched user without id');
        }
        users[user.id] = user;
        return users;
      }, {});

      // Distribui em cada affectedrow seu aluno correspondente
      event.affectedRows.forEach((affectedRow) => {
        if (!affectedRow.user) {
          return;
        }
        if (affectedRow.user in users) {
          affectedRow.user = users[affectedRow.user];
        }
      });

      const { eventId } = await emitEventToEventBridge({
        event,
        eventType: event.table,
      });

      return { eventId };
    },
  };
};
