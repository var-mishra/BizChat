import { useState, useEffect, useRef } from "react";
import { socket } from "../services/socket";
import Message from "./Message";

function ChatArea({ myUserId, selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // ✅ Reference for bottom of chat
  const messagesEndRef = useRef(null);

  // ✅ Scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ Trigger scroll whenever messages or typing state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  useEffect(() => {
    socket.on("message_edited", (updatedMsg) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === updatedMsg._id ? updatedMsg : msg))
      );
    });
    return () => socket.off("message_edited");
  }, []);

  useEffect(() => {
    socket.on("message_deleted", (updatedMsg) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === updatedMsg._id ? updatedMsg : msg))
      );
    });
    return () => socket.off("message_deleted");
  }, []);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => socket.off("receive_message");
  }, []);

  useEffect(() => {
    async function loadChat() {
      if (!selectedUser) return;
      const res = await fetch(
        `http://localhost:3000/api/messages/${myUserId}/${selectedUser}`
      );
      const data = await res.json();
      setMessages(data);
    }
    loadChat();
  }, [selectedUser, myUserId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, {
          type: "audio/webm",
        });

        const formData = new FormData();
        formData.append("file", audioBlob, `voice-${Date.now()}.webm`);

        const uploadRes = await fetch("http://localhost:3000/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        socket.emit("send_message", {
          receiverId: selectedUser,
          message: "",
          fileUrl: uploadData.fileUrl,
          fileType: "audio",
          fileName: "Voice Message",
        });
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    setIsRecording(false);
  };

  const sendMessage = async () => {
    if (!selectedUser) return;

    if (!input.trim() && !selectedFile) {
      return;
    }

    let fileUrl = "";
    let fileType = "text";

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      fileUrl = uploadData.fileUrl;

      if (selectedFile.type.startsWith("image/")) {
        fileType = "image";
      } else if (selectedFile.type.startsWith("audio/")) {
        fileType = "audio";
      } else if (selectedFile.type === "application/pdf") {
        fileType = "pdf";
      } else {
        fileType = "file";
      }
    }

    socket.emit("send_message", {
      receiverId: selectedUser,
      message: input,
      fileUrl,
      fileType,
      fileName: selectedFile?.name || "",
    });

    setInput("");
    setSelectedFile(null);
  };

  useEffect(() => {
    socket.on("typing", (sender) => {
      if (sender === selectedUser) {
        setTyping(`${sender} is typing...`);
      }
    });

    socket.on("stop_typing", () => {
      setTyping("");
    });

    return () => {
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [selectedUser]);

  let typingTimeout;
  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit("typing", {
      senderId: myUserId,
      receiverId: selectedUser,
    });

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
      socket.emit("stop_typing", {
        senderId: myUserId,
        receiverId: selectedUser,
      });
    }, 1500);
  };

  useEffect(() => {
    if (selectedUser) {
      socket.emit("mark_seen", {
        senderId: selectedUser,
        receiverId: myUserId,
      });
    }
  }, [selectedUser, myUserId]);

  useEffect(() => {
    socket.on("message_status", ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    });
    return () => socket.off("message_status");
  }, []);

  if (!selectedUser) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyText}>Select a user to start chatting</div>
      </div>
    );
  }

  return (
    <div style={styles.chatAreaContainer}>
      <div style={styles.header}>
        <div style={styles.headerAvatar}>
          {selectedUser.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={styles.headerName}>{selectedUser}</div>
          <div style={styles.headerStatus}>Active Chat</div>
        </div>
      </div>

      <div style={styles.messagesContainer}>
        {messages
          .filter(
            (msg) =>
              (msg.senderId === myUserId && msg.receiverId === selectedUser) ||
              (msg.senderId === selectedUser && msg.receiverId === myUserId)
          )
          .map((msg) => (
            <Message key={msg._id} msg={msg} myUserId={myUserId} />
          ))}

        {/* ✅ ADDED THIS: Target element for scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {typing && <div style={styles.typingIndicator}>{typing}</div>}

      <div style={styles.inputBar}>
        <input
          value={input}
          onChange={handleTyping}
          placeholder="Type a message..."
          style={styles.inputField}
        />

        <input
          type="file"
          id="file-upload"
          style={{ display: "none" }}
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
        <label htmlFor="file-upload" style={styles.fileButton}>
          {selectedFile ? `📁 ${selectedFile.name.slice(0, 12)}...` : "📎 Attach"}
        </label>
        {!isRecording ? (
          <button onClick={startRecording}>🎤</button>
        ) : (
          <button onClick={stopRecording}>⏹️</button>
        )}
        <button onClick={sendMessage} style={styles.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  chatAreaContainer: {
    width: "70%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f8fafc",
    height: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  emptyContainer: {
    width: "70%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    height: "100vh",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "16px",
    fontWeight: "500",
  },
  header: {
    padding: "16px 24px",
    borderBottom: "1px solid #e2e8f0",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  headerAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#e2e8f0",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "16px",
  },
  headerName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
  },
  headerStatus: {
    fontSize: "12px",
    color: "#22c55e",
    fontWeight: "500",
    marginTop: "2px",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    padding: "24px",
    gap: "12px",
  },
  typingIndicator: {
    fontStyle: "italic",
    margin: "0 24px 8px 24px",
    fontSize: "13px",
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: "6px 12px",
    borderRadius: "12px",
    alignSelf: "flex-start",
  },
  inputBar: {
    display: "flex",
    padding: "16px 24px",
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e2e8f0",
    gap: "12px",
    alignItems: "center",
  },
  inputField: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
  },
  fileButton: {
    padding: "10px 16px",
    borderRadius: "24px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    border: "1px solid #e2e8f0",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
  sendButton: {
    padding: "12px 24px",
    borderRadius: "24px",
    border: "none",
    backgroundColor: "#22c55e",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxSizing: "border-box",
  },
};

export default ChatArea;