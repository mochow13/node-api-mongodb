const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/orders');
const Product = require('../models/products');

router.get('/',(req,res,next) => {
    Order.find()
        .select('product quantity _id')
        .populate('product', 'name')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                        }
                    };
                }),
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err,
            })
        });
});

router.post('/',(req,res,next) => {
    Product.findById(req.body.productID) // do we have a product with productID?
        .then(product => { // yes
            if(!product) {
                return res.status(404).json({
                    message: "Not found",
                });
            }
            console.log("found a product with id: ", req.body.productID);
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productID,
            });
            return order.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'Order stored',
                orderDescription: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity,
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'Product not found',
                error: err,
            });
        })
});

// The string ("orderID") should match req.params.orderID
router.get("/:orderID", (req,res,next) => {
    console.log(req.params.orderID);
    Order.findById(req.params.orderID)
        .populate('product')
        .exec()
        .then(order => {
            if(!order) {
                return res.status(404).json({
                    message: "Order not found :(",
                });
            }
            res.status(200).json({
                order: order,
                request: {
                    type: "GET",
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err,
            });
        });
});

router.delete("/:orderID", (req,res,next) => {
    Order.remove({_id: req.params.orderID})
        .exec()
        .then(order => {
            res.status(200).json({
                order: order,
                message: 'Deleted order',
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err,
            });
        });
});

module.exports = router;