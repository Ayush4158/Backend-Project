// require('dotenv').config({path: './env'})
import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import {app} from './app.js'

dotenv.config({
  path: './env'
})

connectDB()
.then(() => {
  app.on("error", (error)=>{
    console.log("Error: ", error)
    throw error
  })
  app.listen(process.env.PORT || 7000, () => {
    console.log(`Server is react on http://localhost:${process.env.PORT}`)
  })
})
.catch((error) => {
  console.log("MONGO db connextion failed ## ", error)
})








//How to connect with database (but this is a bad practice the right one is in the db folder)

// import express from 'express'
// import mongoose from "mongoose";
// import {DB_NAME} from './constants'
// const app = express()
// ;(async ()=>{
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    // app.on("error", (error)=>{
    //   console.log("Error: ", error)
    //   throw error
    // })

//     app.listen(process.env.PORT, () => {
//       console.log(`server is ready on port http://localhost:${process.env.PORT}`)
//     })
//   } catch (error) {
//     console.log("connect db Error = ", error)
//     throw err
//   }
// })()