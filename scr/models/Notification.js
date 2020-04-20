const mongoose = require('mongoose')
const UniqueValidator = require('mongoose-unique-validator')
const jwt= require('jsonwebtoken')
const bcrypt=require('bcrypt')
const NotificationSchema = new mongoose.Schema({
    Sender_email:{
        required:true,
        type:String,
        trim:true,
    },
    Reciver_Email:{
        required:true,
        type:String,
        trim:true,
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
    ,
    Discription:{
        required:true,
        type:String
    },
    Seen:{
        type:Boolean,
        default:false
    },
    date:{
        default:Date.now(),
        type:Date
    },
    pushFlag:{
        default:false,
        type:Boolean
    }
    
})


const Notification=mongoose.model('Notification',NotificationSchema)
module.exports=Notification