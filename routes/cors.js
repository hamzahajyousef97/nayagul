const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['https://localhost:3443','http://localhost:4200','https://server.nayagul.com', 'https://nayagul-control-panel.firebaseapp.com', 'https://www.nayagul.com'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;

    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
