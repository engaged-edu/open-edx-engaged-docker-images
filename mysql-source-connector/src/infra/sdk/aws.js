const AWS = require('aws-sdk');

/**
 * @param {{ ENV: import('../config').ENV }} param
 */
exports.configAWSSDK = ({ ENV } = {}) => {
  AWS.config.update({
    accessKeyId: ENV.AWS_ACCESS_KEY,
    secretAccessKey: ENV.AWS_SECRET_KEY,
    region: ENV.AWS_REGION,
  });
  return { aws: AWS };
};
