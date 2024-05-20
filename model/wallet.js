const mongoose= require('mongoose')

const walletSchema= new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    balance:{
        type:Number,
        required:true
    },

    created:{
        type:Date,
        required:true,
        default:Date.now
    }
})

module.exports= mongoose.model('Wallet',walletSchema);