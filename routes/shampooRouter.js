const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Shampoos = require('../models/shampoos');
const shampooRouter = express.Router();
shampooRouter.use(bodyParser.json());

const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/shampoos');
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


shampooRouter.route('/upload')
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


shampooRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Shampoos.find(req.query)
    .then((shampoo) => {
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(shampoo);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Shampoos.create(req.body)
    .then((shampoo) => {
        console.log('shampoo created', shampoo);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(shampoo);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('Put operation not supporter on /shampoo');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Shampoos.remove({})
    .then((resp) => {
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


shampooRouter.route('/:shampooId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Shampoos.findById(req.params.shampooId)
    .then((shampoo) => {
        console.log('shampoo created', shampoo);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(shampoo);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /shampoo/'+ req.params.shampooId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Shampoos.findByIdAndUpdate(req.params.shampooId, {
        $set: req.body
    }, { new: true})
    .then((Shampoo) => {
        console.log('Shampoo created', Shampoo);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Shampoo);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Shampoos.findByIdAndRemove(req.params.shampooId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

shampooRouter.route('/:shampooId/images')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Shampoos.findById(req.params.shampooId)
    .then((shampoo) => {
        if (shampoo != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(shampoo.images);
        }
        else {
            err = new Error('shampoo ' + req.params.shampooId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Shampoos.findById(req.params.shampooId)
    .then((shampoo) => {
        if (shampoo != null) {
            req.body.author = req.user._id;
            shampoo.images.push(req.body);
            shampoo.save()
            .then((shampoo) => {
                Shampoos.findById(shampoo._id)
                .then((shampoo) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(shampoo);
                })
            }, (err) => next(err));
        }
        else {
            err = new Error('shampoo ' + req.params.shampooId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /Shampoos/' + req.params.shampooId + '/images');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Shampoos.findById(req.params.shampooId)
    .then((shampoo) => {
        if (shampoo != null) {
            for (var i = (shampoo.images.length -1); i >= 0; i--) {
                shampoo.images.id(shampoo.images[i]._id).remove();
            }
            shampoo.save()
            .then((shampoo) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(shampoo);
            }, (err) => next(err));
        }
        else {
            err = new Error('shampoo ' + req.params.shampooId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


shampooRouter.route('/:shampooId/images/:imageId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Shampoos.findById(req.params.shampooId)
    .populate('images.author')
    .then((shampoo) => {
        if (shampoo != null && shampoo.images.id(req.params.imageId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(shampoo.images.id(req.params.imageId));
        }
        else if (shampoo == null) {
            err = new Error('shampoo ' + req.params.shampooId + ' not found ');
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
    res.end('POST operation not supported on /Shampoos/' + req.params.shampooId
        + '/images/' + req.params.imageId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Shampoos.findById(req.params.shampooId)
    .populate('images.author')
    .then((shampoo) => {
        if (JSON.stringify(shampoo.images.id(req.params.imageId).author._id) == JSON.stringify(req.user._id)) {
            if (shampoo != null && shampoo.images.id(req.params.imageId) != null) {
                if (req.body.rating) {
                    shampoo.images.id(req.params.imageId).rating = req.body.rating;
                }
                if (req.body.image) {
                    shampoo.images.id(req.params.imageId).image = req.body.image;
                }
                shampoo.save()
                .then((shampoo) => {
                    Shampoos.findById(shampoo._id)
                    .populate('images.author')
                    .then((shampoo) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(shampoo);
                    })
                }, (err) => next(err));
            }
            else if (shampoo == null) {
                err = new Error('shampoo ' + req.params.shampooId + ' not found ');
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
    Shampoos.findById(req.params.shampooId)
    .then((shampoo) => {
        if (shampoo != null && shampoo.images.id(req.params.imageId) != null) {
            shampoo.images.id(req.params.imageId).remove();
            shampoo.save()
            .then((shampoo) => {
                Shampoos.findById(shampoo._id)
                .populate('images.author')
                .then((shampoo) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(shampoo);
                })
            }, (err) => next(err));
        }
        else if (shampoo == null) {
            err = new Error('shampoo ' + req.params.shampooId + ' not found ');
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



module.exports = shampooRouter;