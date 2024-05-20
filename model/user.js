const mongoose= require('mongoose')

const userSchema= mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    pass:{
        type:String,
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    otp:{
        type: String,
        default: null
    },
    referalcode: {
        type: Number,
        default: function(){
            return Math.floor(100000 + Math.random() * 700000).toString();
         },
         unique:true
    },
    created:{
        type:Date,
        required:true,
        default:Date.now
    }
})

module.exports= mongoose.model('user',userSchema)