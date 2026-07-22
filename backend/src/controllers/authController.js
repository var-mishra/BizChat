import express, { json } from 'express'
import mongoose from 'mongoose'
import {User} from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const userRegister=async(req,res)=>{
    const {username,email,password,avatar}=req.body;
    const existingUser=await User.findOne({email});
    if(existingUser){
        return res.status(500).json({
            messgae:"User already exist"
        })
    }
    const hashedpassword=await bcrypt.hash(password,10);
    const user=await User.create({
        username,
        email,
        password:hashedpassword,
        
    })
    res.status(201).json({
        message:"Registration successfull",
        user
    })
}
export const loginUser=async(req,res)=>{
    const {email,password}=req.body
    const user=await User.findOne({email})
    if(!user){
        return res.status(400).json({
            message:"Invalid Credentials",
            
        })
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
        return res.status(400).json({
            message:"Invalid Credentials"
        })
    }
    console.log("SECRET:", process.env.SECRET_KEY);
   const token = jwt.sign(
  {
    userId: user.username,
  },
  process.env.SECRET_KEY,
  {
    expiresIn: "7d",
  }
);

res.status(200).json({
    message:"User login successfull",
    user,
    token
})
}
export const logout=async(req,res)=>{
    const {userId}=req.body
    
try {
    await User.findOneAndUpdate(
      { username: userId },
      {
        isOnline: false,
        lastSeen: new Date(),
      }
    );

    res.json({ message: "Logged out" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}