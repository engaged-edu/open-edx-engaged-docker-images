const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

exports.startLowDb = async ({ ENV }) => {
  const adapter = new FileSync(ENV.LOWDB_FILE_PATH);
  const lowDb = low(adapter);
  return { lowDb };
};
