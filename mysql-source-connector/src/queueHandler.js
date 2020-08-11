const Promise = require("bluebird");

const setImmediatePromise = () => {
    return new Promise((resolve) => {
        setImmediate(() => resolve());
    });
};

exports.queueHandlerFactory = ({
    student_courseenrollment,
    courseware_studentmodule,
}) => {
    //Objeto com os manipuladores especificos por tabela.
    const eventHandlers = {
        student_courseenrollment,
        courseware_studentmodule,
    };

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
            // Manipula o evento
            handleEvent(headEvent);
            // Pega a fila atualizada retirando o elemento manipulado (primeiro)
            const queue = db.get("queue").value().slice(1);
            // Atualiza no banco de dados local
            db.set("queue", queue).write();
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

    return { handler };
};
