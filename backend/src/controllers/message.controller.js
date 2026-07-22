import { Message } from "../models/message.model.js";

export const getMessages=async(req,res)=>{
    const {user1,user2}=req.params
    try{
        const messages=await Message.find(
        {$or: [
            {senderId:user1,receiverId:user2},
            {senderId:user2,receiverId:user1}
        ]}
        ).sort({createdAt:1});
        res.json(messages)
    }catch(err){
        res.status(500).json(
            {
                message:err.message
            }
        )
    }
}
export const getConversation = async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ createdAt: -1 });

    const conversations = {};

    for (let msg of messages) {
      const otherUser =
        msg.senderId === userId
          ? msg.receiverId
          : msg.senderId;

      if (!conversations[otherUser]) {
        conversations[otherUser] = {
          ...msg._doc,
          unreadCount: 0, // ✅ add this
        };
      }

      // ✅ COUNT UNREAD
      if (
        msg.receiverId === userId &&
        msg.senderId === otherUser &&
        msg.status !== "seen"
      ) {
        conversations[otherUser].unreadCount += 1;
      }
    }

    res.json(Object.values(conversations));

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const markSeen = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    await Message.updateMany(
      {
        senderId,
        receiverId,
        status: { $ne: "seen" },
      },
      { status: "seen" }
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const editMessage=async(req,res)=>{
    const {messageId,newText}=req.body
    try{
        const messages=Message.findByIdAndUpdate(messageId,{
            message:newText,
            edited:true
        },{new:true})
        res.json(updated);
    }
    catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
export const deleteMessage = async (req, res) => {
  const { messageId } = req.body;

  try {
    const updated = await Message.findByIdAndUpdate(
      messageId,
      {
        isDeleted: true,
        message: "This message was deleted",
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};