import express from 'express'
import {getMessages,getConversation,markSeen, editMessage, deleteMessage} from '../controllers/message.controller.js'

const router=express.Router();
router.get("/conversations/:userId", getConversation);
router.get("/:user1/:user2",getMessages)
router.post("/mark-seen", markSeen);
router.post("/edit",editMessage);
router.post("/delete", deleteMessage)
export default router;
