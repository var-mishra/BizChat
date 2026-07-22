import mongoose from 'mongoose'

const messageSchema= new mongoose.Schema({
    senderId:{
        type:String,
        required:true
    },
    receiverId:{
        type:String,
        required:true
    },
    message:{
        type:String,
    },
    status:{
        type:String,
        enum:["sent","delivered","seen"],
        default:"sent"
    },
    edited:{
        type:Boolean,
        default:false
    },
    fileUrl:{
        type:String,
        default:"",
    },
    fileType:{
        type:String,
        default:"text", 
    },
    fileName:{
        type:String,
        default:""
    },
    
isDeleted: {
  type: Boolean,
  default: false,
},

},{timestamps:true})

export const Message=mongoose.model("Message",messageSchema)