import { useEffect, useState } from "react";
import { socket } from "../services/socket";

function Sidebar({ myUserId, selectedUser, setSelectedUser }) {
  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastSeen, setLastSeen] = useState({});

  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  // FETCH USERS
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`);
      const data = await res.json();
      setUsers(data.filter((user) => user.username !== myUserId));
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ FETCH CONVERSATIONS
  const fetchConversations = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/messages/conversations/${myUserId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    console.log("Selected User Changed:", selectedUser);
  }, [selectedUser]);

  useEffect(() => {
    if (myUserId) fetchConversations();
  }, [myUserId]);

  useEffect(() => {
    const handler = () => fetchConversations();
    socket.on("receive_message", handler);
    return () => socket.off("receive_message", handler);
  }, [myUserId]);

  useEffect(() => {
    socket.on("online_users", (data) => {
      setOnlineUsers(data.online || []);
      setLastSeen(data.lastSeen || {});
    });

    return () => socket.off("online_users");
  }, []);

  // ✅ LOGOUT
  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ userId: myUserId }),
      });

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("selectedUser");

      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div style={styles.sidebarContainer}>
      {/* HEADER ACTION */}
      <div style={styles.topActionSection}>
        <button
          onClick={() => {
            fetchUsers();
            setShowUsers(!showUsers);
          }}
          style={styles.newChatButton}
        >
          ➕ New Chat
        </button>

        {showUsers && (
          <div style={styles.dropdownModal}>
            <input
              type="text"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.modalSearchInput}
            />

            <div style={styles.modalUserList}>
              {users
                .filter((user) =>
                  user.username.toLowerCase().includes(search.toLowerCase())
                )
                .map((user) => (
                  <div
                    key={user._id}
                    onClick={() => {
                      setSelectedUser(user.username);
                      localStorage.setItem("selectedUser", user.username);
                      setShowUsers(false);
                    }}
                    style={styles.modalUserRow}
                  >
                    <span style={styles.modalUsername}>{user.username}</span>
                    {user.isOnline && (
                      <span style={styles.onlineBadgeText}>● online</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <h3 style={styles.sectionTitle}>Chats</h3>

      {/* CONVERSATIONS LIST CONTAINER */}
      <div style={styles.conversationsScrollContainer}>
        {conversations.length === 0 && (
          <p style={styles.emptyText}>No chats yet</p>
        )}

        {conversations.map((conv) => {
          const otherUser =
            conv.senderId === myUserId ? conv.receiverId : conv.senderId;

          const isOnline = onlineUsers.includes(otherUser);

          const statusText = isOnline
            ? "● online"
            : lastSeen[otherUser]
            ? `last seen ${new Date(lastSeen[otherUser]).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "offline";

          const isSelected = selectedUser === otherUser;

          return (
            <div
              key={conv._id}
              onClick={async () => {
                setSelectedUser(otherUser);
                localStorage.setItem("selectedUser", otherUser);

                await fetch(`${import.meta.env.VITE_API_URL}/api/messages/mark-seen`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({
                  senderId: otherUser,
                  receiverId: myUserId,
                }),
              });

              fetchConversations();
            }}
            style={{
              ...styles.conversationItem,
              backgroundColor: isSelected ? "#f1f5f9" : "transparent",
              borderLeft: isSelected ? "4px solid #22c55e" : "4px solid transparent",
            }}
          >
            <div style={styles.itemLeftSection}>
              <div style={styles.avatar}>
                {otherUser.charAt(0).toUpperCase()}
              </div>
              <div style={styles.textMetadata}>
                <div style={styles.usernameRow}>
                  <span style={styles.usernameText}>{otherUser}</span>
                  <span
                    style={{
                      ...styles.statusText,
                      color: isOnline ? "#22c55e" : "#94a3b8",
                    }}
                  >
                    {statusText}
                  </span>
                </div>
                <div style={styles.messagePreview}>{conv.message}</div>
              </div>
            </div>

            {conv.unreadCount > 0 && (
              <div style={styles.unreadCounter}>{conv.unreadCount}</div>
            )}
          </div>
        );
      })}
      </div>

      {/* FOOTER LOGOUT */}
      <div style={styles.footerSection}>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </div>
  );
}

// Sidebar modular UI system layout
const styles = {
  sidebarContainer: {
    width: "30%",
    borderRight: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  topActionSection: {
    padding: "16px",
    position: "relative",
    borderBottom: "1px solid #f1f5f9",
  },
  newChatButton: {
    padding: "12px",
    width: "100%",
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  dropdownModal: {
    position: "absolute",
    top: "70px",
    left: "16px",
    right: "16px",
    zIndex: 10,
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px",
    background: "white",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  },
  modalSearchInput: {
    width: "100%",
    marginBottom: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#f8fafc",
  },
  modalUserList: {
    maxHeight: "200px",
    overflowY: "auto",
  },
  modalUserRow: {
    padding: "10px",
    cursor: "pointer",
    borderRadius: "6px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "background 0.2s",
  },
  modalUsername: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155",
  },
  onlineBadgeText: {
    color: "#22c55e",
    fontSize: "12px",
    fontWeight: "500",
  },
  sectionTitle: {
    margin: "16px 16px 8px 16px",
    fontSize: "16px",
    fontWeight: "700",
    color: "#475569",
  },
  conversationsScrollContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "0 8px",
  },
  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    fontSize: "14px",
    marginTop: "20px",
  },
  conversationItem: {
    padding: "12px",
    cursor: "pointer",
    marginBottom: "4px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "background-color 0.2s",
  },
  itemLeftSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    overflow: "hidden",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#e2e8f0",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "15px",
    flexShrink: 0,
  },
  textMetadata: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",
  },
  usernameRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "8px",
  },
  usernameText: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#1e293b",
  },
  statusText: {
    fontSize: "11px",
    whiteSpace: "nowrap",
  },
  messagePreview: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  unreadCounter: {
    background: "#22c55e",
    color: "white",
    borderRadius: "10px",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: "700",
    marginLeft: "8px",
  },
  footerSection: {
    padding: "16px",
    borderTop: "1px solid #f1f5f9",
  },
  logoutButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    transition: "background-color 0.2s",
  },
};

export default Sidebar;