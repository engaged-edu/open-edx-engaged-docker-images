const MySQLEvents = require("@rodrigogs/mysql-events");
const { saveDbState } = require("../utils/lowDb");

const trigger = (db) => ({
    name: "openedx",
    expression: "*",
    statement: MySQLEvents.STATEMENTS.ALL,
    onEvent: async (event) => {
        try {
            console.log(new Date(), "main > trigger > Evento: ", event);
            // Salva o evento na fila no banco local.
            db.get("queue").push(event).write();
        } catch (error) {
            console.log(new Date(), "main > trigger > ", error);
        }
    },
});

module.exports = (db) => trigger(db);
