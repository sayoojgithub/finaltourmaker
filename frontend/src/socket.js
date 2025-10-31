// // // // src/socket.js
// import { io } from "socket.io-client";
// import Cookies from "js-cookie"; // to read the JWT cookie if not httpOnly; yours is httpOnly so we'll pass it from /auth/me flow

// let socket = null;

// export function initSocket(token) {
//   console.log(token,"frontofficertoken")
//   if (socket) return socket;
//   socket = io("http://localhost:5000", { withCredentials: true });
//   socket.on("connect", () => {
//     // send token to associate this socket with the user
//     token && socket.emit("auth", token);
//     console.log("token poyinonn nokkan ")
//   });
//   return socket;
// }

// export function getSocket() {
//   return socket;
// }
// src/socket.js




import { io } from "socket.io-client";

let socket = null; 

export function initSocket(token) {
  console.log(token, "frontofficertoken");
  if (!socket) {
    socket = io("http://localhost:5000", { withCredentials: true }); 

    socket.on("connect", () => {
      if (token) socket.emit("auth", token);
      console.log("token poyinonn nokkan");
    });

    socket.on("connect_error", (err) => {
      console.warn("[SOCKET] connect_error:", err.message);
    });
  } else {
    // If the socket already exists and is connected, send auth immediately
    if (socket.connected && token) {
      socket.emit("auth", token);
      console.log("auth sent on existing connection");
    }
  }

  return socket;
}


