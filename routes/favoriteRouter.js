const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyAdmin, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('users')
            .populate('campsites.campsite')
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    req.body.forEach((campsites, index) => {
                        if (!req.body.campsites.includes(favorite))
                            favorite.campsites.push(favorite)
                    });
                    favorite.save()
                        .then(fav => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({ success: true, favorite: fav });
                        }).catch(err => next(err));
                } else {
                    Favorite.create({ user: req.user._id, campsites: req.body.map(campsite => campsite._id) })
                        .then(favorites => {
                            console.log('favorites created', favorites)
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        })
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then(favorites => {
                if (favorites) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                    res.json(favorites)
                } else {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('You do not have any favorites to delete!');
                }
            })
            .catch(err => next(err));
    });

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('favorite.user', 'favorite.campsites')
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (!favorite.campsites.includes(req.params.campsiteId)) {
                if (favorite.campsites.push(req.params.campsiteId))
                favorite.save()
                Favorite.create({
                    user: req.user._id,
                    campsites: [req.params.campsiteId]
                })
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403,
        res.end(`POST operation not supported on /favorites/${req.params.favoriteId}`)
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id})
        .then(favorite => {
            if (favorite) {
                favorite.campsites = favorite.campsites.filter(campsite => campsite._id.toString() !== req.params.campsiteId)
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            } else {
                res.setHeader('Content-Type', 'text/plain');
                res.end('There is no campsite to delete!');
            }
        })
        .catch(err => next(err));
    })

module.exports = favoriteRouter;