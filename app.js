const express = require('express');
const app = express();
const morgan = require('morgan'); // for logging requestes in the console
const bodyParser = require('body-parser'); // for parsing body of the incoming requests
const mongoose = require('mongoose'); // db

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');

require('dotenv').config()

mongoose.connect(
    `mongodb://${process.env.MLAB_USER}:${process.env.MLAB_PW}@ds151402.mlab.com:51402/simple-rest-api`,
    {
        useNewUrlParser: true
    });

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if(req.method==='OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next(); // if not 'OPTIONS', proceed
});

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);

// error handling
app.use((req,res,next) => {
    const error = new Error('Not found');
    error.status = 404 ;
    next(error); // pass the error to next
});

app.use((error,req,res,next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        }
    });
});

module.exports = app;