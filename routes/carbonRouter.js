const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Carbons = require('../models/carbons');
const carbonRouter = express.Router();
carbonRouter.use(bodyParser.json());

const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/carbons');
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


carbonRouter.route('/upload')
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


carbonRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Carbons.find(req.query)
    .then((carbon) => {
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(carbon);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Carbons.create(req.body)
    .then((carbon) => {
        console.log('carbon created', carbon);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(carbon);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('Put operation not supporter on /carbon');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Carbons.remove({})
    .then((resp) => {
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


carbonRouter.route('/:carbonId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Carbons.findById(req.params.carbonId)
    .then((carbon) => {
        console.log('carbon created', carbon);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(carbon);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /carbon/'+ req.params.carbonId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Carbons.findByIdAndUpdate(req.params.carbonId, {
        $set: req.body
    }, { new: true})
    .then((Carbon) => {
        console.log('carbon created', Carbon);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Carbon);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Carbons.findByIdAndRemove(req.params.carbonId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

carbonRouter.route('/:carbonId/images')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Carbons.findById(req.params.carbonId)
    .then((carbon) => {
        if (carbon != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(carbon.images);
        }
        else {
            err = new Error('carbon ' + req.params.carbonId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Carbons.findById(req.params.carbonId)
    .then((carbon) => {
        if (carbon != null) {
            req.body.author = req.user._id;
            carbon.images.push(req.body);
            carbon.save()
            .then((carbon) => {
                Carbons.findById(carbon._id)
                .then((carbon) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(carbon);
                })
            }, (err) => next(err));
        }
        else {
            err = new Error('carbon ' + req.params.carbonId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /Carbons/' + req.params.carbonId + '/images');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Carbons.findById(req.params.carbonId)
    .then((carbon) => {
        if (carbon != null) {
            for (var i = (carbon.images.length -1); i >= 0; i--) {
                carbon.images.id(carbon.images[i]._id).remove();
            }
            carbon.save()
            .then((carbon) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(carbon);
            }, (err) => next(err));
        }
        else {
            err = new Error('carbon ' + req.params.carbonId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


carbonRouter.route('/:carbonId/images/:imageId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Carbons.findById(req.params.carbonId)
    .then((carbon) => {
        if (carbon != null && carbon.images.id(req.params.imageId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(carbon.images.id(req.params.imageId));
        }
        else if (carbon == null) {
            err = new Error('carbon ' + req.params.carbonId + ' not found ');
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
    res.end('POST operation not supported on /Carbons/' + req.params.carbonId
        + '/images/' + req.params.imageId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Carbons.findById(req.params.carbonId)
    .then((carbon) => {
        if (JSON.stringify(carbon.images.id(req.params.imageId).author._id) == JSON.stringify(req.user._id)) {
            if (carbon != null && carbon.images.id(req.params.imageId) != null) {
                if (req.body.rating) {
                    carbon.images.id(req.params.imageId).rating = req.body.rating;
                }
                if (req.body.image) {
                    carbon.images.id(req.params.imageId).image = req.body.image;
                }
                carbon.save()
                .then((carbon) => {
                    Carbons.findById(carbon._id)
                    .then((carbon) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(carbon);
                    })
                }, (err) => next(err));
            }
            else if (carbon == null) {
                err = new Error('carbon ' + req.params.carbonId + ' not found ');
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
    Carbons.findById(req.params.carbonId)
    .then((carbon) => {
        if (carbon != null && carbon.images.id(req.params.imageId) != null) {
            carbon.images.id(req.params.imageId).remove();
            carbon.save()
            .then((carbon) => {
                Carbons.findById(carbon._id)
                .then((carbon) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(carbon);
                })
            }, (err) => next(err));
        }
        else if (carbon == null) {
            err = new Error('carbon ' + req.params.carbonId + ' not found ');
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



module.exports = carbonRouter;