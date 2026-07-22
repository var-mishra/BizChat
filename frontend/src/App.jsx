import { useState, useEffect } from "react";
import { socket } from "./services/socket";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import Login from "./components/Login";

function App() {
  const [myUserId, setMyUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // ✅ AUTO LOGIN
  useEffect(() => {
    const savedUser = localStorage.getItem("userId");

    if (savedUser) {
      setMyUserId(savedUser);
      socket.emit("join", savedUser);
    }
  }, []);

  // ✅ WHEN LOGIN HAPPENS
  useEffect(() => {
    if (myUserId) {
      socket.emit("join", myUserId);
    }
  }, [myUserId]);
useEffect(() => {
  console.log("APP selectedUser:", selectedUser);
}, [selectedUser]);
  // ✅ SHOW LOGIN IF NOT LOGGED IN
  if (!myUserId) {
    return <Login setMyUserId={setMyUserId} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        myUserId={myUserId}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />
      <ChatArea myUserId={myUserId} selectedUser={selectedUser} />
    </div>
  );
}

export default App;