const AWS = require("aws-sdk");
const { saveFailedEvents } = require("./lowDb");

class CustomEventBridge {
    constructor({ region, accessKeyId, secretAccessKey }) {
        AWS.config.update({ region, accessKeyId, secretAccessKey });
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

module.exports = (
    credentials = { region: "", accessKeyId: "", secretAccessKey: "" }
) => new CustomEventBridge(credentials);
