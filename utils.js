const dotenv = require("dotenv")
dotenv.config()

function getConfig() {
    let env = process.env.NODE_ENV || 'prod';
    return require(`./config/${env}.json`);
}

module.exports = getConfig;