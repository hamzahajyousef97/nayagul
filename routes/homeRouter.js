const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Homes = require('../models/homes');
const homeRouter = express.Router();
homeRouter.use(bodyParser.json());


homeRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Homes.find(req.query)
    .then((home) => {
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(home);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Homes.create(req.body)
    .then((home) => {
        console.log('Home created', home);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(home);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('Put operation not supporter on /Home');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Homes.remove({})
    .then((resp) => {
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


homeRouter.route('/:homeId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Homes.findById(req.params.homeId)
    .then((home) => {
        console.log('Home created', home);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(home);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /Home/'+ req.params.homeId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Homes.findByIdAndUpdate(req.params.homeId, {
        $set: req.body
    }, { new: true})
    .then((Home) => {
        console.log('Home created', Home);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Home);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Homes.findByIdAndRemove(req.params.homeId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});



module.exports = homeRouter;

