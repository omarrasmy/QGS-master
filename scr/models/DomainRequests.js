const mongoose= require('mongoose')
const UniqueValidator = require('mongoose-unique-validator')


const RequestSchema=new mongoose.Schema({
    Requested_domain:{
        type:String,
        unique:true,
        required:true
    },
   requester:{
       type:mongoose.Schema.Types.ObjectId,
       required:true,
       trim:true,
       ref:'Instructor'
   },
   votes:{
       type:Number,
       default:1
       

   },
   voters:[{
       type:String,
      

   }]

})
RequestSchema.plugin(UniqueValidator)

RequestSchema.methods.toJSON=function(){
    const RequestObject= this.toObject()
    // delete RequestObject._id
    delete RequestObject.__v
    delete RequestObject.requester._id
    return RequestObject
}

const Request= mongoose.model('Request',RequestSchema)
module.exports=Request
