const mongoose     = require('mongoose');
const Schema       = mongoose.Schema;

const ErrorSchema   = new Schema({
    
    toAddr: String,
    time: Date,
    ip: String,
    errorMessage: String

});

module.exports = mongoose.model('Error', ErrorSchema);