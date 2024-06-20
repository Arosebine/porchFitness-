const mongoose = require('mongoose');


const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
    },
    expires: {
        type: Date,
    }
});

module.exports = mongoose.model('Token', tokenSchema);