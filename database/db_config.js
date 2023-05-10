const mongoose = require('mongoose');
const dotenv = require("dotenv");
const env = process.env.NODE_ENV || 'prod';
const config = require(`../config/${env}.json`);
dotenv.config()
const mongoString = config.CONNECTION_STRING;
const initializeDatabase = () => {
    mongoose.connect(mongoString);
    const database = mongoose.connection;

    database.on('error', (error) => {
        console.log(error)
    })

    database.once('connected', () => {
        console.log('You successfully connected to MongoDB!');
    })
}
module.exports = initializeDatabase;