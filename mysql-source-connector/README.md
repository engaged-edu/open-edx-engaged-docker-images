IoC

/src
    /bootstrap
    /domain
        /models
        /services
        /use-cases
    /infra
        config.js
        logger.js
        /db
            mysql.js

BBD - https://cucumber.io/
TDD - 

const mysql = require('mysql')
const mongodb = require('mongodb')

fetch() {
    const ids = mongodb.find();
    const users = mysql.query(`SELECT * FROM ${ids.toString()}`);
}

fetchFactory({ mysql, mongodb }) {
    return {
        fetch() {
            const ids = mongodb.find();
            const users = mysql.query(`SELECT * FROM ${ids.toString()}`);
        }
    }
}

fetchFactory({ mysql: {
    query: (queryStr) => {
        throw new 
    }
}})

https://github.com/jeffijoe/awilix

require('queue-handler')
queue_handler
queue-handler
