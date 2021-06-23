const { Schema, model } = require('mongoose');

const userSchema = Schema({
    _id: String,
    language: {
        default: 'english',
        type: String
    },
    embedColor: {
        default: 'default',
        type: String
    }
});

module.exports = model('userSchema', userSchema);