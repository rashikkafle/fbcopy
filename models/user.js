const mongoose = require('mongoose')




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