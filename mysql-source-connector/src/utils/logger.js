const rfs = require("rotating-file-stream");
const path = require("path");
const { Console } = require("console");

/**
 * Metodo que cria a instancia do logger para arquivo.
 */
const startLog = () => {
    try {
        const pad = (num) => (num > 9 ? "" : "0") + num;
        const generator = (time, index) => {
            var pathToFile = path.join(
                __dirname,
                "..",
                "data",
                "logs",
                "node-watcher.log"
            );
            if (!time) return pathToFile;

            var month = time.getFullYear() + "" + pad(time.getMonth() + 1);
            var day = pad(time.getDate());
            var hour = pad(time.getHours());
            var minute = pad(time.getMinutes());

            pathToFile = path.join(
                __dirname,
                "data",
                month,
                `${day}_${month}-${hour}_${minute}-${index}.log`
            );

            console.log(pathToFile);

            return pathToFile;
        };
        const stream = rfs.createStream(generator, {
            size: "10M",
            interval: "1d",
        });
        const logger = new Console({ stdout: stream, stderr: stream });
        return logger;
    } catch (error) {
        console.log(new Date(), error);
    }
};

module.exports = startLog;
