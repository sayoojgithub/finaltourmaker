import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import adminRoute from './routes/adminRoute.js'
import authRoute from './routes/authRoute.js'
import salesExecutiveRoute from './routes/salesExecutiveRoute.js'
import companyRoute from './routes/companyRoute.js'
import purchaserRoute from './routes/purchaserRoute.js'
import salesManagerRoute from './routes/salesManagerRoute.js'
import marketingManagerRoute from "./routes/marketingManagerRoute.js"
import creativeStaffRoute from "./routes/creativeStaffRoute.js"
import digitalMarketerRoute from "./routes/digitalMarketerRoute.js"
import entryStaffRoute from "./routes/entryStaffRoute.js"
import frontOfficeRoute from "./routes/frontOfficerRoute.js"
dotenv.config()

const app = express()
const port = process.env.PORT || 8000

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true 
}


app.get('/',(req,res)=>{
    res.send("API IS WORKING")
})

mongoose.set('strictQuery',false)
const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('MongoDB database is connected')
    } catch (err) {
        console.log("MongoDB database is connection failed")
        
    }
}


// middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))
app.use('/api/v1/admin',adminRoute)
app.use('/api/v1/auth' ,authRoute)
app.use('/api/v1/salesExecutive',salesExecutiveRoute)
app.use('/api/v1/company',companyRoute)
app.use('/api/v1/purchaser',purchaserRoute)
app.use('/api/v1/salesManager',salesManagerRoute)
app.use('/api/v1/marketingManager',marketingManagerRoute)
app.use('/api/v1/creativeStaff',creativeStaffRoute)
app.use('/api/v1/digitalMarketer',digitalMarketerRoute)
app.use('/api/v1/entry',entryStaffRoute)
app.use('/api/v1/frontoffice',frontOfficeRoute)







app.listen(port, ()=>{
        connectDB();
    console.log("server is running on port" + port)
})