const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/ecommerce')

const postmodel = mongoose.Schema({
    review : String,
    
    user :{
        type: mongoose.Schema.Types.ObjectId, ref:'user'
    },

    likes :{
        type: mongoose.Schema.Types.ObjectId, ref:'user'
    },
     Date : {
        type: Date,
        default :Date.now
    },
            photo:String

})

module.exports = mongoose.model('post', postmodel)