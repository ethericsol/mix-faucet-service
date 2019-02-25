const mongoose     = require('mongoose');
const Schema       = mongoose.Schema;

const DonationSchema   = new Schema({
    
    toAddr: String,
    time: Date,
    ip: String,
    amount: Number,
    txHash: String

});

module.exports = mongoose.model('Donation', DonationSchema);
