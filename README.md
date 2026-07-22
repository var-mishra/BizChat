# BizChat 💬

A full-stack real-time messaging platform built using React, Node.js, Express.js, MongoDB, Socket.IO, and Cloudinary.

BizChat enables instant communication with support for text messaging, image sharing, document sharing, video sharing, voice messages, online presence tracking, unread message counts, message reactions, and secure JWT-based authentication.

---

## 🚀 Features

### 🔐 Authentication & Security

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Password Hashing using bcrypt
- Secure API Access

### 💬 Real-Time Messaging

- One-to-One Chat
- Instant Message Delivery using Socket.IO
- Auto Scroll to Latest Message
- Conversation Sorting
- Unread Message Count

### 👤 User Presence

- Online Status
- Offline Status
- Last Seen Tracking

### ✨ Message Management

- Send Messages
- Edit Messages
- Delete Messages
- Message Delivery Status
- Seen Status
- Emoji Reactions

### 🖼️ Media Sharing

#### Images

- Upload Images
- Image Preview
- Full Image View

#### Documents

- PDF Sharing
- DOC Sharing
- DOCX Sharing
- XLS Sharing
- XLSX Sharing
- ZIP Sharing

#### Videos

- Video Upload
- Video Playback in Chat

#### Voice Notes

- Record Voice Messages
- Upload Audio Files
- Playback Audio Messages

### ☁️ Cloud Storage

- Cloudinary Integration
- Cloud-Based Media Hosting
- Image Storage
- Document Storage
- Video Storage
- Audio Storage

---

## 🛠️ Tech Stack

### Frontend

- React.js
- JavaScript
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express.js
- Socket.IO

### Database

- MongoDB
- Mongoose

### Authentication

- JWT (JSON Web Token)
- bcrypt

### Cloud Storage

- Cloudinary

### File Uploads

- Multer
- Multer Storage Cloudinary

---

## 📂 Project Structure

```text
BizChat
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   ├── context
│   ├── services
│   └── socket
│
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── routes
│   │   ├── models
│   │   ├── middleware
│   │   ├── db
│   │   ├── socket
│   │   └── utils
│   │
│   ├── cloudinary.js
│   ├── index.js
│   └── .env
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/var-mishra/bizchat.git
```

```bash
cd bizchat
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=3000

MONGODB_URI=YOUR_MONGODB_URI

SECRET_KEY=YOUR_SECRET_KEY

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

Run backend:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

Run frontend:

```bash
npm run dev
```

---

## 🌐 Environment Variables

### Backend

```env
PORT=
MONGODB_URI=
SECRET_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 📸 Supported File Types

### Images

```text
jpg
jpeg
png
gif
webp
```

### Documents

```text
pdf
doc
docx
xls
xlsx
zip
```

### Videos

```text
mp4
mov
webm
```

### Audio

```text
webm
mp3
wav
ogg
m4a
```

---

## 🔄 Application Workflow

```text
User Login
     ↓
Socket Authentication
     ↓
Real-Time Connection Established
     ↓
Send Message / Media
     ↓
Store in MongoDB
     ↓
Store Media in Cloudinary
     ↓
Real-Time Delivery
     ↓
Seen / Delivered Updates
```

---

## 🎯 Key Functionalities

### Real-Time Communication

Users can exchange messages instantly through Socket.IO-powered communication.

### Media Sharing

Supports image, file, video, and audio sharing through Cloudinary integration.

### Voice Notes

Users can record and send voice messages directly from the browser.

### Presence Tracking

Tracks user online status and last seen information.

### Conversation Management

Provides unread message counts and recently active conversation ordering.

### Message Interactions

Users can edit messages, delete messages, and react using emojis.

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing with bcrypt
- Secure Environment Variables
- Protected Backend Routes
- Socket Authentication
- Cloud-Based Media Storage

---

## 📈 Future Enhancements

- Phone Number OTP Authentication
- AI Chat Assistant
- Group Chat
- Typing Indicator
- Reply to Messages
- Push Notifications
- Dark Mode
- User Profiles

---

## 👨‍💻 Author

**Varun Mishra**

Junior Associate Software Engineer

### Skills

- React.js
- Node.js
- Express.js
- MongoDB
- Socket.IO
- Cloudinary
- .NET
- REST APIs

---

## ⭐ Support

If you found this project useful, consider giving it a star on GitHub.

---

## 📜 License

This project is licensed under the MIT License.