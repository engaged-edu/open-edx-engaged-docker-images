require("dotenv").config();
const mysql = require("mysql");
const MySQLEvents = require("@rodrigogs/mysql-events");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");
const adapter = new FileSync(path.join(__dirname, "data", "db.json"));
const db = low(adapter);
// Triggers customizadas
const main = require("./triggers/main");
const handler = require("./queueHandler");
const startLog = require("./utils/logger");

console.log(process.env.NODE_ENV);

const program = async () => {
    // Configuração default da lib de eventos do banco de dados.
    let zongJiConfig = {
        startAtEnd: false,
        excludedSchemas: {
            mysql: true,
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
    // INicializa conexão com o mysql do edX
    const connection = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_USER_PASSWORD,
    });
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
