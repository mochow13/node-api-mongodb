const Product = require('../models/products');
const mongoose = require('mongoose');

exports.getAllProducts = (req,res,next) => {
    Product.find()
        .select("name price _id productImage") // send only these three fields
        .exec()
        .then(docs => {
            const response = { // send something meaningful
                count: docs.length,
                product: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc._id,
                        request: { // metadata :P
                            type: 'GET', // we allow GET
                            url: `http://localhost:3000/products/${doc._id}`,
                        }
                    };
                }),
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
};

exports.postProduct = (req,res,next) => {
    // 'product_image' is the name of the field for the image in the object
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path,
    });
    // promise
    product
        .save()
        .then(result => {
            console.log(result); 
            res.status(201).json({
                message: 'Entry added',
                product: result,
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
};

exports.getProductDetails = (req,res,next) => {
    const id = req.params.productID;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            // console.log('From db: ', doc);
            // doc can be null when a valid id is given but it does not exist
            if(doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products',
                    }
                }); // promise is met
            } else {
                res.status(404).json({message: "No entry available"});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
};

exports.deleteProduct = (req,res,next) => {
    const id = req.params.productID;
    Product.deleteOne({_id: id})
        .exec()
        .then(result => {
            console.log('Deletion done!');
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
};