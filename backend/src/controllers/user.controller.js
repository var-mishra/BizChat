import express from 'express';
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

export const getUser=async(req,res)=>{
    try{
        const users=await User.find(
            {},{
                password:0,
            }
        );
        res.json(users);
    }catch(err){
        res.status(400).json({
            message:err.message,
        })
    }
}