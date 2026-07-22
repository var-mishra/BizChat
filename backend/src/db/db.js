import mongoose, { connect } from 'mongoose'
import express from 'express'

const connectDb=async(req,res)=>{
    await mongoose.connect("mongodb+srv://varun_db:varun123@chat.qslcvjw.mongodb.net/?appName=Chat").then(
        console.log("Db is connected")
    )
}
export default connectDb