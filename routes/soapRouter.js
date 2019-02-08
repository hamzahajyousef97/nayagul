const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Soaps = require('../models/soaps');
const soapRouter = express.Router();
soapRouter.use(bodyParser.json());

const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/soaps');
    },

    filename: (req, file, cb) => {
        cb(null, Math.random() + file.originalname)
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFileFilter});


soapRouter.route('/upload')
.options(cors.cors, (req, res) => { res.sendStatus(200); })
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file.filename);
});


soapRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Soaps.find(req.query)
    .then((soap) => {
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(soap);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Soaps.create(req.body)
    .then((soap) => {
        console.log('Soap created', soap);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(soap);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('Put operation not supporter on /Soap');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Soaps.remove({})
    .then((resp) => {
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


soapRouter.route('/:soapId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Soaps.findById(req.params.soapId)
    .then((soap) => {
        console.log('Soap created', soap);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(soap);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /Soap/'+ req.params.soapId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Soaps.findByIdAndUpdate(req.params.soapId, {
        $set: req.body
    }, { new: true})
    .then((Soap) => {
        console.log('Soap created', Soap);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Soap);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Soaps.findByIdAndRemove(req.params.soapId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

soapRouter.route('/:soapId/images')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Soaps.findById(req.params.soapId)
    .then((soap) => {
        if (soap != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(soap.images);
        }
        else {
            err = new Error('soap ' + req.params.soapId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Soaps.findById(req.params.soapId)
    .then((soap) => {
        if (soap != null) {
            req.body.author = req.user._id;
            soap.images.push(req.body);
            soap.save()
            .then((soap) => {
                Soaps.findById(soap._id)
                .then((soap) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(soap);
                })
            }, (err) => next(err));
        }
        else {
            err = new Error('soap ' + req.params.soapId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /Soaps/' + req.params.soapId + '/images');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Soaps.findById(req.params.soapId)
    .then((soap) => {
        if (soap != null) {
            for (var i = (soap.images.length -1); i >= 0; i--) {
                soap.images.id(soap.images[i]._id).remove();
            }
            soap.save()
            .then((soap) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(soap);
            }, (err) => next(err));
        }
        else {
            err = new Error('soap ' + req.params.soapId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


soapRouter.route('/:soapId/images/:imageId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Soaps.findById(req.params.soapId)
    .then((soap) => {
        if (soap != null && soap.images.id(req.params.imageId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(soap.images.id(req.params.imageId));
        }
        else if (soap == null) {
            err = new Error('soap ' + req.params.soapId + ' not found ');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Image ' + req.params.imageId + ' not found ');
            err.status = 404;
            return next(err);  
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /Soaps/' + req.params.soapId
        + '/images/' + req.params.imageId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Soaps.findById(req.params.soapId)
    .then((soap) => {
        if (JSON.stringify(soap.images.id(req.params.imageId).author._id) == JSON.stringify(req.user._id)) {
            if (soap != null && soap.images.id(req.params.imageId) != null) {
                if (req.body.rating) {
                    soap.images.id(req.params.imageId).rating = req.body.rating;
                }
                if (req.body.image) {
                    soap.images.id(req.params.imageId).image = req.body.image;
                }
                soap.save()
                .then((soap) => {
                    Soaps.findById(soap._id)
                    .then((soap) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(soap);
                    })
                }, (err) => next(err));
            }
            else if (soap == null) {
                err = new Error('soap ' + req.params.soapId + ' not found ');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Image ' + req.params.imageId + ' not found ');
                err.status = 404;
                return next(err);  
            }
        }
        else {
            var err = new Error('You are not authorized to update this image!');
            err.status = 403;
            next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Soaps.findById(req.params.soapId)
    .then((soap) => {
        if (soap != null && soap.images.id(req.params.imageId) != null) {
            soap.images.id(req.params.imageId).remove();
            soap.save()
            .then((soap) => {
                Soaps.findById(soap._id)
                .then((soap) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(soap);
                })
            }, (err) => next(err));
        }
        else if (soap == null) {
            err = new Error('soap ' + req.params.soapId + ' not found ');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Image ' + req.params.imageId + ' not found ');
            err.status = 404;
            return next(err);  
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});



module.exports = soapRouter;