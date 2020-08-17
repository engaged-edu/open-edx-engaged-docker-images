const AWS = require('aws-sdk');

/**
 * @param {{ ENV: import('../config').ENV }} param
 */
exports.configAWSSDK = ({ ENV } = {}) => {
  AWS.config.update({
    accessKeyId: ENV.ENGAGED_AWS_ACCESS_KEY,
    secretAccessKey: ENV.ENGAGED_AWS_SECRET_KEY,
  });
  return { aws: AWS };
};
