// import express from "express"
// import cookieParser from "cookie-parser"
// import cors from "cors"
// import mongoose from "mongoose"
// import dotenv from "dotenv"
// import adminRoute from './routes/adminRoute.js'
// import authRoute from './routes/authRoute.js'
// import salesExecutiveRoute from './routes/salesExecutiveRoute.js'
// import companyRoute from './routes/companyRoute.js'
// import purchaserRoute from './routes/purchaserRoute.js'
// import salesManagerRoute from './routes/salesManagerRoute.js'
// import marketingManagerRoute from "./routes/marketingManagerRoute.js"
// import creativeStaffRoute from "./routes/creativeStaffRoute.js"
// import digitalMarketerRoute from "./routes/digitalMarketerRoute.js"
// import entryStaffRoute from "./routes/entryStaffRoute.js"
// import frontOfficeRoute from "./routes/frontOfficerRoute.js"
// import frontOfficerManagerRoute from "./routes/frontOfficerManagerRoute.js"


// dotenv.config()

// const app = express()
// const port = process.env.PORT || 8000

// const corsOptions = {
//     origin: "http://localhost:5173",
//     credentials: true 
// }


// app.get('/',(req,res)=>{
//     res.send("API IS WORKING")
// })

// mongoose.set('strictQuery',false)
// const connectDB = async()=>{
//     try {
//         await mongoose.connect(process.env.MONGO_URL, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         })
//         console.log('MongoDB database is connected')
//     } catch (err) {
//         console.log("MongoDB database is connection failed")
        
//     }
// }


// // middleware
// app.use(express.json())
// app.use(cookieParser())
// app.use(cors(corsOptions))
// app.use('/api/v1/admin',adminRoute)
// app.use('/api/v1/auth' ,authRoute)
// app.use('/api/v1/salesExecutive',salesExecutiveRoute)
// app.use('/api/v1/company',companyRoute)
// app.use('/api/v1/purchaser',purchaserRoute)
// app.use('/api/v1/salesManager',salesManagerRoute)
// app.use('/api/v1/marketingManager',marketingManagerRoute)
// app.use('/api/v1/creativeStaff',creativeStaffRoute)
// app.use('/api/v1/digitalMarketer',digitalMarketerRoute)
// app.use('/api/v1/entry',entryStaffRoute)
// app.use('/api/v1/frontoffice',frontOfficeRoute)
// app.use('/api/v1/frontOfficerManager',frontOfficerManagerRoute)







// app.listen(port, ()=>{
//         connectDB();
//     console.log("server is running on port" + port)
// })
 //index.js





// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import mongoose from "mongoose";
// import dotenv from "dotenv";

// // routes...
// import adminRoute from './routes/adminRoute.js'
// import authRoute from './routes/authRoute.js'
// import salesExecutiveRoute from './routes/salesExecutiveRoute.js'
// import companyRoute from './routes/companyRoute.js'
// import purchaserRoute from './routes/purchaserRoute.js'
// import salesManagerRoute from './routes/salesManagerRoute.js'
// import marketingManagerRoute from "./routes/marketingManagerRoute.js"
// import creativeStaffRoute from "./routes/creativeStaffRoute.js"
// import digitalMarketerRoute from "./routes/digitalMarketerRoute.js"
// import entryStaffRoute from "./routes/entryStaffRoute.js"
// import frontOfficeRoute from "./routes/frontOfficerRoute.js"
// import frontOfficerManagerRoute from "./routes/frontOfficerManagerRoute.js"

// import FrontOfficer from "./models/frontOfficerModel.js"; // 👈 needed in cron
// import jwt from "jsonwebtoken";
// import cron from "node-cron";

// dotenv.config();

// const app = express();
// const server = http.createServer(app);

// // 🔐 Allow your Vite dev origin
// const corsOptions = { origin: "http://localhost:5173", credentials: true };
// const io = new Server(server, {
//   cors: corsOptions,
// });

// app.set("io", io); // make io available to routes/controllers if needed

// // Track sockets by userId (frontofficers)
// const onlineSockets = new Map(); // userId -> socket.id

// io.on("connection", (socket) => {
//   // client should send token immediately after connecting
//   socket.on("auth", (token) => {
//     console.log("mapping nadakkinda mwonee")
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       console.log(decoded,"decoded")
//       const { _id, role } = decoded || {};
//       console.log(_id,role,"id and role")
//       if (role === "frontofficer") {
//         onlineSockets.set(_id, socket.id);
//         socket.join(`user:${_id}`);
//         console.log(onlineSockets,"mapping matram pora ethum indavanam")
//       }
//     } catch (_) {}
    
//   });
 

//   socket.on("disconnect", () => {
//     // remove from map if present
//     for (const [uid, sid] of onlineSockets.entries()) {
//       if (sid === socket.id) {
//         onlineSockets.delete(uid);
//         break;
//       }
//     }
//   });
// });


// app.get('/', (req, res) => {
//   res.send("API IS WORKING")
// });

// mongoose.set('strictQuery', false);
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('MongoDB database is connected')
//   } catch (err) {
//     console.log("MongoDB database is connection failed")
//   }
// };

// // middleware
// app.use(express.json());
// app.use(cookieParser());
// app.use(cors(corsOptions));

// // routes
// app.use('/api/v1/admin', adminRoute);
// app.use('/api/v1/auth', authRoute);
// app.use('/api/v1/salesExecutive', salesExecutiveRoute);
// app.use('/api/v1/company', companyRoute);
// app.use('/api/v1/purchaser', purchaserRoute);
// app.use('/api/v1/salesManager', salesManagerRoute);
// app.use('/api/v1/marketingManager', marketingManagerRoute);
// app.use('/api/v1/creativeStaff', creativeStaffRoute);
// app.use('/api/v1/digitalMarketer', digitalMarketerRoute);
// app.use('/api/v1/entry', entryStaffRoute);
// app.use('/api/v1/frontoffice', frontOfficeRoute);
// app.use('/api/v1/frontOfficerManager', frontOfficerManagerRoute);

// /* ---------------- CRON: force logout idle frontofficers ----------------
//    Rule: if (now - max(lastActivityAt, lastClientCreatedAt, lastLoginAt)) >= 30min
//          AND isOnline === true AND status === 'Active'
//          -> set status 'Inactive', isOnline false, forceLoggedOutAt now, sessionVersion++
//          -> emit socket 'force-logout' to client (instant redirect)
// ------------------------------------------------------------------------- */
// cron.schedule("*/2 * * * *", async () => { // every 2 minutes
//   const now = new Date();
//   const THIRTY_MIN = 2 * 60 * 1000;

//   // find candidates
//   const candidates = await FrontOfficer.find({
//     status: "Active",
//     isOnline: true,
//   }).select("_id  lastClientCreatedAt lastLoginAt sessionVersion");
// console.log(candidates,"candidates")
//   const updates = [];
//   for (const fo of candidates) {
//     const t = Math.max(
//       new Date(fo.lastClientCreatedAt || 0).getTime(),
//       new Date(fo.lastLoginAt || 0).getTime()
//     );
//     if (!t) continue;

//     if (now.getTime() - t >= THIRTY_MIN) {
//       console.log("haiii")
//       // mark inactive & bump session version
//       updates.push(FrontOfficer.findByIdAndUpdate(
//         fo._id,
//         {
//           $set: {
//             status: "Inactive",
//             isOnline: false,
//             forceLoggedOutAt: now,
//           },
//           $inc: { sessionVersion: 1 },
//         },
//         { new: true }
//       ));

//       // push event
//       const sid = onlineSockets.get(String(fo._id));
//       console.log(sid,"sid")
//       if (sid) {
//         io.to(sid).emit("force-logout", { reason: "INACTIVITY_30_MIN" });
//       }
//     }
//   }
//   if (updates.length) await Promise.all(updates);
// });

// const port = process.env.PORT || 8000; 
// server.listen(port, () => {
//   connectDB();
//   console.log("server is running on port " + port);
// });

//index.js 


import express from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// routes...

import adminRoute from "./routes/adminRoute.js";
import authRoute from "./routes/authRoute.js";
import salesExecutiveRoute from "./routes/salesExecutiveRoute.js";
import companyRoute from "./routes/companyRoute.js";
import purchaserRoute from "./routes/purchaserRoute.js";
import salesManagerRoute from "./routes/salesManagerRoute.js";
import marketingManagerRoute from "./routes/marketingManagerRoute.js";
import creativeStaffRoute from "./routes/creativeStaffRoute.js";
import digitalMarketerRoute from "./routes/digitalMarketerRoute.js";
import entryStaffRoute from "./routes/entryStaffRoute.js";
import frontOfficeRoute from "./routes/frontOfficerRoute.js";
import frontOfficerManagerRoute from "./routes/frontOfficerManagerRoute.js";
import executiveRoute from "./routes/executiveRoute.js"
import uploadRoute from "./routes/uploadRoute.js";
import paymentRoute from "./routes/paymentRoute.js";

import FrontOfficer from "./models/frontOfficerModel.js"; // 👈 needed in cron
import jwt from "jsonwebtoken";
import cron from "node-cron";
import path from 'path';
import { fileURLToPath } from "url";

//For ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename); // Fixed: removed asterisks

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🔐 Allow your Vite dev origin
    const corsOptions = { origin: "http://localhost:5173", credentials: true };
//  const corsOptions = { origin: "http://192.168.31.89:5173", credentials: true };
const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io); // make io available to routes/controllers if needed

// Track sockets by userId (frontofficers)
// Now supports MULTIPLE sockets per user: userId -> Set<socket.id>
const onlineSockets = new Map();

io.on("connection", (socket) => {
  // client should send token immediately after connecting
  socket.on("auth", (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { _id, role } = decoded || {};
      if (role === "frontofficer" && _id) {
        const uid = String(_id);

        // ensure a Set exists for this user
        if (!onlineSockets.has(uid)) onlineSockets.set(uid, new Set());
        onlineSockets.get(uid).add(socket.id);

        // join a per-user room so we can emit to ALL devices/tabs
        socket.join(`user:${uid}`);
      }
    } catch (_) {
      // optional: disconnect unauthenticated sockets
      // socket.disconnect(true);
    }
  });
  console.log(onlineSockets,"online sockets")

  socket.on("disconnect", () => {
    // Remove only THIS socket from the user's Set; keep others if any
    for (const [uid, sids] of onlineSockets.entries()) {
      if (sids.has(socket.id)) {
        sids.delete(socket.id);
        if (sids.size === 0) onlineSockets.delete(uid);
        break;
      }
    }
  });
});

// app.get("/", (req, res) => {
//   res.send("API IS WORKING");
// }); 

mongoose.set("strictQuery", false);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB database is connected");
  } catch (err) {
    console.log("MongoDB database is connection failed");
  }
};




// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
app.use(cookieParser());
app.use(cors(corsOptions));

// routes
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/salesExecutive", salesExecutiveRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/purchaser", purchaserRoute);
app.use("/api/v1/salesManager", salesManagerRoute);
app.use("/api/v1/marketingManager", marketingManagerRoute);
app.use("/api/v1/creativeStaff", creativeStaffRoute);
app.use("/api/v1/digitalMarketer", digitalMarketerRoute);
app.use("/api/v1/entry", entryStaffRoute);
app.use("/api/v1/frontoffice", frontOfficeRoute);
app.use("/api/v1/frontOfficerManager", frontOfficerManagerRoute);
app.use("/api/v1/executive",executiveRoute)
app.use("/api/v1/upload", uploadRoute);
app.use("/api/v1/payments", paymentRoute);

/* ---------------- CRON: force logout idle frontofficers ----------------
   Rule: if (now - max(lastActivityAt, lastClientCreatedAt, lastLoginAt)) >= 30min
         AND isOnline === true AND status === 'Active'
         -> set status 'Inactive', isOnline false, forceLoggedOutAt now, sessionVersion++
         -> emit socket 'force-logout' to client (instant redirect)
------------------------------------------------------------------------- */
cron.schedule("*/2 * * * *", async () => {
  // every 2 minutes
  const now = new Date();
  const THIRTY_MIN = 60 * 60 * 1000; // ✅ real 30 minutes

  // find candidates
  const candidates = await FrontOfficer.find({
    // status: "Active",
    isOnline: true,
  }).select("_id lastClientCreatedAt lastLoginAt sessionVersion");
  console.log(candidates,"candidates")
  const updates = [];
  for (const fo of candidates) { 
    const t = Math.max(
      new Date(fo.lastClientCreatedAt || 0).getTime(),
      new Date(fo.lastLoginAt || 0).getTime()
    );
    if (!t) continue;

    if (now.getTime() - t >= THIRTY_MIN) {
      // mark inactive & bump session version
      updates.push(
        FrontOfficer.findByIdAndUpdate(
          fo._id,
          {
            $set: {
              // status: "Inactive",
              isOnline: false,
              forceLoggedOutAt: now,
            },
            $inc: { sessionVersion: 1 },
          },
          { new: true }
        )
      );

      // ✅ Emit to the per-user ROOM so ALL devices/tabs get force-logout
      const room = `user:${String(fo._id)}`;
      io.to(room).emit("force-logout", { reason: "INACTIVITY_30_MIN" });
    }
  }
  if (updates.length) await Promise.all(updates);
});
if (process.env.NODE_ENV === 'production') {
    const parentDir = path.join(_dirname, '..'); // project root (../)
    const distPath = path.join(parentDir, 'frontend', 'dist');
    app.use(express.static(distPath));
    
    // Fixed: Use wildcard (*) instead of regex pattern for Express 5.x
    // app.get('*', (req, res) => {
    //     res.sendFile(path.join(distPath, 'index.html'));
    // });
} else {
    app.get('/', (req, res) => res.send('Server is Ready'));
}


const port = process.env.PORT || 8000;
server.listen(port, () => {
  connectDB();
  console.log("server is running on port " + port);
});
// server.listen(port,'0.0.0.0', () => {
//   connectDB();
//   console.log("server is running on port " + port);
// });