const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const aboutSchema = new Schema({
    aboutEN: {
        type: String,
        required: true
    },
    aboutTR: {
        type: String,
        required: true
    },
    aboutAR: {
        type: String,
        required: true
    },
},{
    timestamps: true
});

var Abouts = mongoose.model('Abouts', aboutSchema);

module.exports = Abouts;