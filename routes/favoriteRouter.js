const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');

const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get((req,res,next) => {
    Favorite.find({user: req.user._id.toString()})
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
    Favorite.find({user: req.user._id.toString()})
    .then((document) => {
        if(document.length !== 0){
            console.log(document)
            var dishesID = document[0].dishes;
            console.log(dishesID)
            for(var i = 0; i < req.body.length ; i++){
                if(dishesID.indexOf(req.body[i]) === -1){
                    console.log(req.body[i])
                    dishesID.push(req.body[i]);
                }
            }
            document[0].dishes = dishesID;
            document[0].save()
            .then((favorite) => {
                Favorite.findById(favorite._id)
                .populate('favorite.user')
                .populate('favorite.dishes')
                .then((favorite) => {
                    console.log('favorite Created ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }, (err) => next(err))
            .catch((err) => next(err));
        }else{
            var favorite = new Favorite({
                dishes: req.body,
                user: req.user._id
            });
            favorite.save()
            .then((favorite) => {
                Favorite.findById(favorite._id)
                .populate('favorite.user')
                .populate('favorite.dishes')
                .then((favorite) => {
                    console.log('favorite Created ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    });
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
    Favorite.find({user: req.user._id.toString()})
    Favorite.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
})


favoriteRouter.route('/:dishId')
.post(authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
    Favorite.find({user: req.user._id.toString()})
    .then((documents) => {
        if(documents.length !== 0){
            var dishesID = documents[0].dishes;
            var indexDish = dishesID.indexOf(req.params.dishId);
            if(indexDish === -1) dishesID.push(req.params.dishId);
            documents[0].dishes = dishesID;
            documents[0].save()
            .then((favorite) => {
                Favorite.findById(favorite._id)
                .populate('favorite.user')
                .populate('favorite.dishes')
                .then((favorite) => {
                    console.log('dish deleted ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }, (err) => next(err))
            .catch((err) => next(err));
        }else{
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    })
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorite.find({user: req.user._id.toString()})
    .then((documents) => {
        if(documents.length !== 0){
            var dishesID = documents[0].dishes;
            var indexDish = dishesID.indexOf(req.params.dishId);
            dishesID.splice(indexDish,1);
            documents[0].dishes = dishesID;
            documents[0].save()
            .then((favorite) => {
                Favorite.findById(favorite._id)
                .populate('favorite.user')
                .populate('favorite.dishes')
                .then((favorite) => {
                    console.log('dish deleted ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }, (err) => next(err))
            .catch((err) => next(err));
        }else{
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    })
    .catch((err) => next(err));
});

module.exports = favoriteRouter;