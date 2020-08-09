const Promise = require("bluebird");
const { saveDbState } = require("./utils/lowDb");
const student_courseenrollment = require("./handlers/student_courseenrollment");
const courseware_studentmodule = require("./handlers/courseware_studentmodule");

/**
 * Metodo que irá manipular a fila de eventos.
 *
 * @param {*} db Objeto do banco de dados.
 */
const handler = async (db) => {
    await setImmediatePromise();
    // Pega o evento que esta no inicio da fila (FIFO)
    const headEvent = db.get("queue").value()[0];
    // Valida se tem algum conteudo no evento
    if (headEvent) {
        await Promise.delay(500);
        // Manipula o evento
        handleEvent(headEvent);
        // Pega a fila atualizada retirando o elemento manipulado (primeiro)
        const queue = db.get("queue").value().slice(1);
        // Atualiza no banco de dados local
        db.set("queue", queue).write();
        const { nextPosition, binlogName } = headEvent;
        // Salvar a posição do log
        saveDbState(db, nextPosition, binlogName);
    }
};

/**
 * Metodo que manipula um evento do banco de dados.
 *
 * @param {*} event Evento do banco de dados
 */
const handleEvent = (event) => {
    // Valida se existe algum manipulador para aquela tabela que teve um evento
    if (eventHandlers[`${event.table}`]) {
        // Se existir, executa a ação especifica daquela tabela
        eventHandlers[`${event.table}`](event);
    } else {
        // Se nao, informa no log que nao tem manipulador para a tabela que teve o evento.
        console.log(
            new Date(),
            "queueHandler > handleEvent",
            `Nenhum handler informado para a tabela '${event.table}'`
        );
    }
};

//Objeto com os manipuladores especificos por tabela.
const eventHandlers = {
    student_courseenrollment,
    courseware_studentmodule,
};

const setImmediatePromise = () => {
    return new Promise((resolve) => {
        setImmediate(() => resolve());
    });
};

module.exports = (db) => handler(db);
