const { Schema, model } = require('mongoose');
const def = require('../config/colors.json').default;

const userSchema = Schema({
    _id: String,
    language: {
        default: 'english',
        type: String
    },
    embedColor: {
        default: def,
        type: String
    }
});

module.exports = model('userSchema', userSchema);