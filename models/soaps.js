const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const imageSchema = new Schema({
    image: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

const soapSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    nameEN: {
        type: String,
        required: true
    },
    nameTR: {
        type: String,
        required: true
    },
    nameAR: {
        type: String,
        required: true
    },
    descriptionEN: {
        type: String,
        required: true
    },
    descriptionTR: {
        type: String,
        required: true
    },
    descriptionAR: {
        type: String,
        required: true
    },
    htuAR: {
        type: String,
        required: true
    },
    htuEN: {
        type: String,
        required: true
    },
    htuTR: {
        type: String,
        required: true
    },
    compositionAR: {
        type: String,
        required: true
    },
    compositionEN: {
        type: String,
        required: true
    },
    compositionTR: {
        type: String,
        required: true
    },
    imageI: {
        type: String,
        required: true
    },
    imageII: {
        type: String,
        required: true
    },
    imageIII: {
        type: String,
        required: true
    },
    imageIIII: {
        type: String,
        required: true
    },
    images: [imageSchema]
},{
    timestamps: true
});

var Soaps = mongoose.model('Soaps', soapSchema);

module.exports = Soaps;