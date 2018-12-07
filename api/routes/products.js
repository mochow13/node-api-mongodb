const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer'); // for handling files
const Product = require('../models/products');
const Auth = require('../middlewares/auth');
const ProductController = require('../controllers/products');

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

const upload = multer({
        storage: storage, 
        limits: {
            fileSize: 1024*1024*5, // 5MB            
        },
        fileFilter: fileFilter,
    }); // configuring properties

// get all data
router.get('/', ProductController.getAllProducts);
// post an entry
router.post('/', Auth, upload.single('productImage'), ProductController.postProduct);
// get an entry with 'productID'
router.get('/:productID', ProductController.getProductDetails);
// delete an entry with 'productID'
router.delete('/:productID',Auth, ProductController.deleteProduct);

module.exports = router;