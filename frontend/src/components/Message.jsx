import { socket } from "../services/socket";
import { useState } from "react";

function Message({ msg, myUserId }) {
  const isSender = msg.senderId === myUserId;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.message);
  const [showReactions, setShowReactions] = useState(false);

  const dateObj = msg.createdAt ? new Date(msg.createdAt) : new Date();
  const time = dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const renderTicks = () => {
    if (!isSender) return null;
    if (msg.status === "sent") return <span style={styles.tick}>✓</span>;
    if (msg.status === "delivered") return <span style={styles.tick}>✓✓</span>;
    if (msg.status === "seen") return <span style={{ ...styles.tick, color: "#53bdeb" }}>✓✓</span>;
  };

  const isDocument = msg.fileType === "file" || msg.fileType === "pdf";

  return (
    <div
      style={{
        ...styles.messageRow,
        alignItems: isSender ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          ...styles.bubble,
          backgroundColor: msg.isDeleted
            ? "#f0f2f5"
            : isSender
              ? "#dcf8c6" // Classic WhatsApp Green
              : "#ffffff",
          borderRadius: isSender ? "12px 0px 12px 12px" : "0px 12px 12px 12px",
        }}
      >
        {/* EMOJI PICKER */}
        {showReactions && !msg.isDeleted && (
          <div style={styles.emojiPicker}>
            {["👍", "😂", "❤️", "😮", "😢"].map((emoji) => (
              <span
                key={emoji}
                style={styles.pickerEmoji}
                onClick={() => {
                  socket.emit("add_reaction", {
                    messageId: msg._id,
                    userId: myUserId,
                    emoji,
                  });
                  setShowReactions(false);
                }}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}

        {/* MESSAGE CONTENT */}
        {msg.isDeleted ? (
          <div style={styles.deletedText}>
            🚫 This message was deleted
          </div>
        ) : isEditing ? (
          <div style={styles.editForm}>
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
              style={styles.editInput}
            />
            <div style={styles.editActionsRow}>
              <button
                onClick={() => {
                  if (!editText.trim()) return;
                  socket.emit("edit_message", {
                    messageId: msg._id,
                    newText: editText,
                  });
                  setIsEditing(false);
                }}
                style={styles.saveBtn}
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.contentWrapper}>
            {/* ✅ Show Image */}
            {msg.fileType === "image" && msg.fileUrl && (
              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={msg.fileUrl}
                  alt="shared image"
                  style={styles.fullImage}
                />
              </a>
            )}
            
            {/* ✅ AUDIO PLAYER (Fixed playback & styled audio UI) */}
            {msg.fileType === "audio" && msg.fileUrl && (
              <div style={styles.audioPlayerCard}>
                <span style={styles.audioIcon}>🎙️</span>
                <audio
                  src={msg.fileUrl}
                  controls
                  style={styles.audioElement}
                >
                  Your browser does not support audio.
                </audio>
              </div>
            )}

            {/* ✅ Show PDF / Document Attachment Card */}
            {isDocument && msg.fileUrl && (
              <a
                href={msg.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.documentCard}
              >
                <span style={{ fontSize: "22px" }}>📄</span>
                <div style={styles.docDetails}>
                  <span style={styles.docName}>
                    {msg.fileName || "View Document"}
                  </span>
                  <span style={styles.docSubtext}>Click to open / download</span>
                </div>
              </a>
            )}
            

            {/* ✅ Show Text Message */}
            {msg.message && (
              <div style={styles.messageText}>
                {msg.message}
                {msg.edited && (
                  <span style={styles.editedTag}>
                    {" "}(edited)
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* TIME + TICKS */}
        <div style={styles.metaContainer}>
          <span style={styles.timeText}>{time}</span>
          {renderTicks()}
        </div>

        {/* ACTION BUTTONS (Edit, Delete, React) */}
        {isSender && !msg.isDeleted && !isEditing && (
          <div style={styles.actionBar}>
            <span
              onClick={() => setShowReactions((prev) => !prev)}
              style={styles.actionLink}
              title="React"
            >
              😊
            </span>
            <button
              onClick={() => {
                setIsEditing(true);
                setEditText(msg.message);
              }}
              style={styles.actionLink}
            >
              Edit
            </button>
            <button
              onClick={() => {
                socket.emit("delete_message", {
                  messageId: msg._id,
                });
              }}
              style={{ ...styles.actionLink, color: "#ea0038" }}
            >
              Delete
            </button>
          </div>
        )}

        {/* SHOW REACTIONS */}
        {msg.reactions && msg.reactions.length > 0 && !msg.isDeleted && (
          <div style={styles.reactionsBadgeList}>
            {msg.reactions.map((r, i) => (
              <span key={i} style={styles.reactionMiniBadge}>
                {r.emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  messageRow: {
    display: "flex",
    flexDirection: "column",
    margin: "8px 24px",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
  },
  bubble: {
    position: "relative",
    padding: "10px 12px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    fontSize: "14.2px",
    lineHeight: "19px",
    color: "#111b21",
    maxWidth: "65%",
    minWidth: "140px",
    display: "flex",
    flexDirection: "column",
  },
  contentWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  fullImage: {
    width: "100%",
    maxHeight: "350px",
    objectFit: "contain",
    borderRadius: "8px",
    display: "block",
    cursor: "pointer",
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  /* ✅ AUDIO STYLES */
  audioPlayerCard: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 10px",
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: "12px",
    marginBottom: "5px",
    border: "1px solid rgba(0, 0, 0, 0.08)",
  },
  audioIcon: {
    fontSize: "18px",
  },
  audioElement: {
    width: "220px",
    height: "36px",
    outline: "none",
  },
  documentCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: "8px",
    textDecoration: "none",
    border: "1px solid rgba(0,0,0,0.08)",
    transition: "background-color 0.2s",
  },
  docDetails: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  docName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e293b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "180px",
  },
  docSubtext: {
    fontSize: "11px",
    color: "#00a884",
    fontWeight: "500",
  },
  messageText: {
    color: "#111b21",
    wordBreak: "break-word",
  },
  deletedText: {
    fontStyle: "italic",
    fontSize: "13.5px",
    color: "#667781",
  },
  editedTag: {
    fontSize: "11px",
    color: "#667781",
    marginLeft: "5px",
  },
  metaContainer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "4px",
    marginTop: "6px",
  },
  timeText: {
    fontSize: "11px",
    color: "#667781",
  },
  tick: {
    fontSize: "15px",
    color: "#8696a0",
    lineHeight: "1",
  },
  actionBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "10px",
    paddingTop: "8px",
    borderTop: "1px solid rgba(0,0,0,0.08)",
  },
  actionLink: {
    fontSize: "12px",
    color: "#54656f",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0",
    fontWeight: "600",
  },
  emojiPicker: {
    position: "absolute",
    bottom: "105%",
    left: "0",
    background: "white",
    border: "1px solid #ccc",
    borderRadius: "20px",
    padding: "5px 10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    display: "flex",
    gap: "8px",
    zIndex: 999,
  },
  pickerEmoji: {
    cursor: "pointer",
    fontSize: "18px",
  },
  reactionsBadgeList: {
    display: "flex",
    gap: "4px",
    marginTop: "6px",
    background: "rgba(255,255,255,0.6)",
    padding: "4px 8px",
    borderRadius: "12px",
    alignSelf: "flex-start",
    border: "1px solid rgba(0,0,0,0.05)",
  },
  reactionMiniBadge: {
    fontSize: "12px",
  },
  editForm: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "200px",
  },
  editInput: {
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "13px",
    outline: "none",
  },
  editActionsRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
  saveBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#00a884",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#667781",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Message;