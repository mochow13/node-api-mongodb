const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // unique does not ensure that each email will be unique 
    // into the database, but does performance optimization when we do findOne
    email: {
        type: String, 
        required: true, 
        unique: true,
        // regular expression to match emails! :3
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    password: {type: String, required: true,},
});

module.exports = mongoose.model('User', userSchema);