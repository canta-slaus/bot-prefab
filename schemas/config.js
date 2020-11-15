const { Schema, model } = require('mongoose');
const { PREFIX } = require('../config/config.json')

const config = Schema({
    _id: String
}, { strict: false });

module.exports = model('config', config);