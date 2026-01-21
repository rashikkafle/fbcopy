const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce')

const usermodel = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    Date : {
        type: Date,
        default :Date.now
    },
    profilepic :{
        type: String,
        default:'sunlight.JPG'
    },
        
        post :[{
            type: mongoose.Schema.Types.ObjectId , ref :'post'
        }],


})

module.exports =mongoose.model('user', usermodel)