/**
 * Metodo para salvar o estado de leitura do banco de dados (MySql).
 *
 * @param {*} db Objeto do banco de dados
 * @param {*} nextPosition Proxima posição para inciar a leitura no Log.
 * @param {*} binlogName Nome do arquivo de Log para leitura.
 */
const saveDbState = (db, nextPosition, binlogName) => {
    try {
        db.set("configuration", { nextPosition, binlogName }).write();
    } catch (error) {
        console.log(new Date(), "lowdb > saveDbState", error);
    }
};

/**
 * Metodo para salvar no banco local envios de eventos que falharam, para que possam ser reprocessados.
 *
 * @param {*} event Evento que falhou no envio.
 * @param {*} db Objeto do banco de dados
 */
const saveFailedEvents = (event, db) => {
    try {
        db.get("failedEvents").push({ event }).write();
    } catch (error) {
        console.log(new Date(), "lowdb > saveFailedEvents", error);
    }
};

module.exports = { saveDbState, saveFailedEvents };
