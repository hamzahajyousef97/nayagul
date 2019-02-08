const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Creams = require('../models/creams');
const creamRouter = express.Router();
creamRouter.use(bodyParser.json());

const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/creams');
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


creamRouter.route('/upload')
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


creamRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Creams.find(req.query)
    .then((cream) => {
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(cream);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Creams.create(req.body)
    .then((cream) => {
        console.log('cream created', cream);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(cream);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('Put operation not supporter on /cream');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Creams.remove({})
    .then((resp) => {
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


creamRouter.route('/:creamId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Creams.findById(req.params.creamId)
    .then((cream) => {
        console.log('cream created', cream);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(cream);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /cream/'+ req.params.creamId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Creams.findByIdAndUpdate(req.params.creamId, {
        $set: req.body
    }, { new: true})
    .then((Cream) => {
        console.log('cream created', Cream);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Cream);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Creams.findByIdAndRemove(req.params.creamId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

creamRouter.route('/:creamId/images')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Creams.findById(req.params.creamId)
    .then((cream) => {
        if (cream != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(cream.images);
        }
        else {
            err = new Error('cream ' + req.params.creamId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Creams.findById(req.params.creamId)
    .then((cream) => {
        if (cream != null) {
            req.body.author = req.user._id;
            cream.images.push(req.body);
            cream.save()
            .then((cream) => {
                Creams.findById(cream._id)
                .then((cream) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(cream);
                })
            }, (err) => next(err));
        }
        else {
            err = new Error('cream ' + req.params.creamId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /Creams/' + req.params.creamId + '/images');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Creams.findById(req.params.creamId)
    .then((cream) => {
        if (cream != null) {
            for (var i = (cream.images.length -1); i >= 0; i--) {
                cream.images.id(cream.images[i]._id).remove();
            }
            cream.save()
            .then((cream) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(cream);
            }, (err) => next(err));
        }
        else {
            err = new Error('cream ' + req.params.creamId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


creamRouter.route('/:creamId/images/:imageId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Creams.findById(req.params.creamId)
    .then((cream) => {
        if (cream != null && cream.images.id(req.params.imageId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(cream.images.id(req.params.imageId));
        }
        else if (cream == null) {
            err = new Error('cream ' + req.params.creamId + ' not found ');
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
    res.end('POST operation not supported on /Creams/' + req.params.creamId
        + '/images/' + req.params.imageId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Creams.findById(req.params.creamId)
    .then((cream) => {
        if (JSON.stringify(cream.images.id(req.params.imageId).author._id) == JSON.stringify(req.user._id)) {
            if (cream != null && cream.images.id(req.params.imageId) != null) {
                if (req.body.rating) {
                    cream.images.id(req.params.imageId).rating = req.body.rating;
                }
                if (req.body.image) {
                    cream.images.id(req.params.imageId).image = req.body.image;
                }
                cream.save()
                .then((cream) => {
                    Creams.findById(cream._id)
                    .then((cream) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(cream);
                    })
                }, (err) => next(err));
            }
            else if (cream == null) {
                err = new Error('cream ' + req.params.creamId + ' not found ');
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
    Creams.findById(req.params.creamId)
    .then((cream) => {
        if (cream != null && cream.images.id(req.params.imageId) != null) {
            cream.images.id(req.params.imageId).remove();
            cream.save()
            .then((cream) => {
                Creams.findById(cream._id)
                .then((cream) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(cream);
                })
            }, (err) => next(err));
        }
        else if (cream == null) {
            err = new Error('cream ' + req.params.creamId + ' not found ');
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



module.exports = creamRouter;