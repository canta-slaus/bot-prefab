const { Schema, model } = require('mongoose');
const { PREFIX } = require('../config/config.json')

const guildSchema = Schema({
    _id: String,
    prefix: {
        default: PREFIX,
        type: String
    },
    disabledCommands: Array,
    commandPerms: {}
});

module.exports = model('guildSchema', guildSchema);