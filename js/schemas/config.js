const { Schema, model } = require('mongoose');

const config = Schema({
    _id: String
}, { strict: false });

module.exports = model('config', config);