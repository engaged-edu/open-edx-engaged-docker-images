const pino = require('pino')();

/**
 * Metodo que cria a instancia do logger para arquivo.
 */
exports.startLog = ({ ENV } = {}) => {
  const logger = pino.child({ e: ENV.NODE_ENV, b: ENV.BOOTSTRAP_MODE, s: ENV.ENGAGED_SERVER_IDENTIFIER });
  return { logger };
};
