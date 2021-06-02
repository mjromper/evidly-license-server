const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const schema = new mongoose.Schema({
    issueDate: {
        type: Date,
        default: Date.now
    },
    key: {
        type: String,
        index : true
    },
    revoked: {
        type: Number
    },
    machine: {
        type: String 
    }
});


module.exports = mongoose.model('License', schema)