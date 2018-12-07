const mongoose = require('mongoose');
const salt_rounds = 10;
const User = require('../models/users');
const bcrypt = require('bcrypt'); // hash the password!
const jwt = require('jsonwebtoken'); // route protection and login

exports.userSignup = (req,res,next) => {
    console.log(req.body);
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        console.log(user);
        if(user.length > 0) {
            return res.status(409).json({
                message: 'Email already exists! -__-',
            });
        } else {
            bcrypt.hash(req.body.password, salt_rounds, (err,hash) => {
                if(err) {
                    console.log(err);
                    res.status(500).json({
                        error: err,
                    });
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash,
                    });
                    user.save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'User created successfully',
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err,
                        });
                    });
                }
            });
        }
    });
};

exports.userLogin = (req,res,next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length === 0) {
            return res.status(401).json({
                message: 'Unauthorized user information.',
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err,result) => {
            if(err) {
                return res.status(401).json({
                    message: 'Unauthorized user information.',
                });
            }
            // result will be either true or false from bcrypt.compare
            if(result) {
                const token = jwt.sign(
                    {
                        email: user[0].email,
                        userid: user[0]._id,
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: "1h",
                    }
                );
                return res.status(200).json({
                    message: 'Auth successful',
                    token: token,
                });
            }
            return res.status(401).json({
                message: 'Unauthorized user information.',
            });
        });
    })
    .catch(err => {
        res.status(200).json({
            error: err,
        });
    });
};