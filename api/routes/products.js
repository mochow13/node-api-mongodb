const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer'); // for handling files
const Product = require('../models/products');

const storage = multer.diskStorage({ // cb is callback
    destination: (req, file, cb) => {
        cb(null,'./uploads/');
    },
    filename: (req,file,cb) => {
        cb(null,new Date().toISOString() + file.originalname);
    },
});
// filter out certain types
const fileFilter = (req,file,cb) => {
    // save only png files
    if(file.mimetype==='image/png') {
        cb(null,true); // store it and ignore error reports
    } else {
        cb(null,false); // don't store it and ignore error reports
    }
};

const upload = multer(
    {
        storage: storage, 
        limits: {
            fileSize: 1024*1024*5, // 5MB            
        },
        fileFilter: fileFilter,
    }); // configuring properties

// get all data
router.get('/', (req,res,next) => {
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
});

// post an entry
router.post('/', upload.single('productImage'), (req,res,next) => {
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

    // Not ensuring promise is met, so put it inside .then()
    // res.status(201).json({
    //     message: 'Handling POST in products',
    //     product: product,
    // });
});

// get an entry with 'productID'
router.get('/:productID',(req,res,next) => {
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
});

router.patch("/:productID", (req,res,next) => {
    const id = req.params.productID;
    const updateops = {};
    for(const ops of req.body) {
        updateops[ops.propName] = ops.value;
    }
    Product.updateOne({_id: id}, {$set: updateops})
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Product updated',
                request: {
                    type: 'GET',
                    url: `http://localhost:3000/products${id}`,
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
});

// delete an entry with 'productID'
router.delete('/:productID',(req,res,next) => {
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
});

module.exports = router;