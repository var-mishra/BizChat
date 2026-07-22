import express from "express";
import cors from "cors";
import messageRoutes from '../src/routes/message.route.js'
import authroute from "../src/routes/authroute.js";
import userroute from "../src/routes/userroute.js";
import uploadRoutes from "../src/routes/uploads.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authroute);
app.use("/api/messages",messageRoutes)
app.use("/uploads",express.static("uploads"));
app.use("/api",uploadRoutes)
app.use("/api/",userroute)
app.get("/", (req, res) => {
  res.send("BizChat API running 🚀");
});

export default app;