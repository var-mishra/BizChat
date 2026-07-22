import { Message } from "../models/message.model.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const users = {};
const lastSeen = {};

const setupSocket = (io) => {

  // ✅ AUTH MIDDLEWARE
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      console.log("TOKEN:", token);
      console.log("SECRET_KEY:", process.env.SECRET_KEY);

      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY
      );

      console.log("DECODED:", decoded);

      socket.userId = decoded.userId;

      next();
    } catch (err) {
      console.log("JWT ERROR:", err.message);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;

    console.log("✅ Authenticated user:", userId);

    // ✅ MAP USER
    users[userId] = socket.id;

    // ✅ update DB
    await User.findOneAndUpdate(
      { username: userId },
      { isOnline: true }
    );

    delete lastSeen[userId];

    io.emit("online_users", {
      online: Object.keys(users),
      lastSeen,
    });

    // ======================================================
    // ✅ SEND MESSAGE
    // ======================================================
    socket.on("send_message", async ({ receiverId, message, fileUrl, fileType ,fileName}) => {
      console.log("🔥 SEND_MESSAGE EVENT HIT");
      try {
        const senderId = userId; // ✅ FIXED

console.log({
  receiverId,
  message,
  fileUrl,
  fileType,
  fileName,
});

        const savedMessage = await Message.create({
          senderId,
          receiverId,
          message,
          fileUrl,
          fileType,
          fileName,
          status: "sent",

        });

        const receiverSocketId = users[receiverId];

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", {
            ...savedMessage._doc,
            status: "delivered",
          });

          await Message.findByIdAndUpdate(savedMessage._id, {
            status: "delivered",
          });

          socket.emit("message_status", {
            messageId: savedMessage._id,
            status: "delivered",
          });
        }

        socket.emit("receive_message", {
          ...savedMessage._doc,
          status: "sent",
        });

      } catch (err) {
        console.error("❌ send_message error:", err.message);
      }
    });

    // ======================================================
    // ✅ MARK SEEN
    // ======================================================
    socket.on("mark_seen", async ({ senderId }) => {
      try {
        await Message.updateMany(
          {
            senderId,
            receiverId: userId,
            status: { $ne: "seen" },
          },
          { status: "seen" }
        );

        const senderSocketId = users[senderId];

        if (senderSocketId) {
          io.to(senderSocketId).emit("messages_seen");
        }

      } catch (err) {
        console.error("❌ mark_seen error:", err.message);
      }
    });

    // ======================================================
    // ✅ EDIT MESSAGE
    // ======================================================
    socket.on("edit_message", async ({ messageId, newText }) => {
      try {
        const updated = await Message.findByIdAndUpdate(
          messageId,
          {
            message: newText,
            edited: true,
          },
          { new: true }
        );

        io.emit("message_edited", updated);

      } catch (err) {
        console.error("❌ edit error:", err.message);
      }
    });

    // ======================================================
    // ✅ DELETE MESSAGE
    // ======================================================
    socket.on("delete_message", async ({ messageId }) => {
      try {
        const updated = await Message.findByIdAndUpdate(
          messageId,
          {
            isDeleted: true,
            message: "This message was deleted",
          },
          { new: true }
        );

        io.emit("message_deleted", updated);

      } catch (err) {
        console.error("❌ delete error:", err.message);
      }
    });

    // ======================================================
    // ✅ DISCONNECT
    // ======================================================
    socket.on("disconnect", async () => {
      for (let id in users) {
        if (users[id] === socket.id) {

          lastSeen[id] = new Date();

          await User.findOneAndUpdate(
            { username: id },
            {
              isOnline: false,
              lastSeen: new Date(),
            }
          );

          delete users[id];
        }
      }

      io.emit("online_users", {
        online: Object.keys(users),
        lastSeen,
      });
    });

  });
};

export default setupSocket;