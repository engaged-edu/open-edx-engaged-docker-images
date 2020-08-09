const AWS = require("aws-sdk");
const { saveFailedEvents } = require("./lowDb");

class CustomEventBridge {
    constructor() {
        AWS.config.update({
            region: process.env.REGION,
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
        });
        this.eventbridge = new AWS.EventBridge();
    }

    async putEvents(event) {
        try {
            const res = await this.eventbridge
                .putEvents({
                    Entries: [event],
                })
                .promise();
            if (res.FailedEntryCount && res.FailedEntryCount > 0) {
                saveFailedEvents(event);
            }
            return res;
        } catch (error) {
            console.log(new Date(), "CustomEventBridge > putEvents", error);
            saveFailedEvents(event);
        }
    }
}

module.exports = new CustomEventBridge();
