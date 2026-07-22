import mongoose from 'mongoose'

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    avatar:{
        type:String,
        default:""
    },
    isOnline:{
        type:Boolean,
        default:false
    },
    lastSeen:{
        type:Date
    }

},{timestamps:true})
export const User=mongoose.model("User",userSchema);