import express, { Router } from 'express'
import { getUser } from '../controllers/user.controller.js'

const router=express.Router();

router.get("/users",getUser);
export default router;