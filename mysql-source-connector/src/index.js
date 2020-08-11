require("dotenv").config();
const mysql = require("mysql");
const MySQLEvents = require("@rodrigogs/mysql-events");
const { startLowDb } = require("./utils/lowDb");
// Triggers customizadas
const main = require("./triggers/main");
// handler da fila.
const handler = require("./queueHandler");
// Logger
const startLog = require("./utils/logger");
// COnexao com mysql
const connection = require("../utils/MySql");

const program = async () => {
    // Inicia o banco de dados local
    const db = startLowDb();
    // Configuração default da lib de eventos do banco de dados.
    let zongJiConfig = {
        startAtEnd: false,
        includeSchema: {
            openedx: ["student_courseenrollment", "courseware_studentmodule"],
        },
    };
    // Resgata os valores de configuração no banco de dados local.
    const config = db.get("configuration").value();
    // Valida se ja foi inicializado os valores.
    if (
        !config ||
        config.binlogName === undefined ||
        config.nextPosition === undefined
    ) {
        db.defaults({
            configuration: { nextPosition: 0, binlogName: "" },
            queue: [],
        }).write();
    } else {
        // Caso ja tenha sido, atualiza o objeto de configuração para que inicie na ultima parte do log.
        zongJiConfig = {
            ...zongJiConfig,
            binlogName: config.binlogName,
            binlogNextPos: config.nextPosition,
        };
    }
    // Configurações da instancia
    const instance = new MySQLEvents(connection, zongJiConfig);
    // Inicializa a instancia.
    await instance.start();
    // Adiciona triggers customizadas.
    instance.addTrigger(main(db));
    // Inicia loop de manipulação da lista de eventos.
    startLoop();
    // Eventos do banco.
    instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, (err) =>
        console.error(new Date(), "MySQLEvents.EVENTS.CONNECTION_ERROR", err)
    );
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, (err) =>
        console.error(new Date(), "MySQLEvents.EVENTS.ZONGJI_ERROR", err)
    );
};

/**
 * Metodo que inicia o loop infinito que fica manipulando a fila de eventos local.
 */
const startLoop = async () => {
    for (;;) {
        await handler(db);
    }
};

if (process.env.NODE_ENV === "production") {
    const logger = startLog();
    console = logger;
}

program()
    .then(() =>
        console.log(new Date(), "Aguardando eventos do banco de dados.")
    )
    .catch((err) => console.error(new Date(), "program", err));
