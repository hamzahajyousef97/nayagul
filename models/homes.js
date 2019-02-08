const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const homeSchema = new Schema({
    homeFEN: {
        type: String,
        required: true
    },
    homeFTR: {
        type: String,
        required: true
    },
    homeFAR: {
        type: String,
        required: true
    },
    homeSEN: {
        type: String,
        required: true
    },
    homeSTR: {
        type: String,
        required: true
    },
    homeSAR: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

var Homes = mongoose.model('Homes', homeSchema);

module.exports = Homes;