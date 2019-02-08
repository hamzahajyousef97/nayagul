const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Abouts = require('../models/abouts');
const aboutRouter = express.Router();
aboutRouter.use(bodyParser.json());


aboutRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Abouts.find(req.query)
    .then((about) => {
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(about);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Abouts.create(req.body)
    .then((about) => {
        console.log('About created', about);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(about);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('Put operation not supporter on /About');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Abouts.remove({})
    .then((resp) => {
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


aboutRouter.route('/:aboutId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Abouts.findById(req.params.aboutId)
    .then((about) => {
        console.log('About created', about);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(about);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /About/'+ req.params.aboutId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Abouts.findByIdAndUpdate(req.params.aboutId, {
        $set: req.body
    }, { new: true})
    .then((About) => {
        console.log('About created', About);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(About);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Abouts.findByIdAndRemove(req.params.aboutId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});



module.exports = aboutRouter;

