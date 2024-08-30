import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()


const db = mongoose.connect(process.env.DB_url) 

db.then(()=>{
    console.log('connected to db')
})
db.catch((err)=>{
    console.error(err)
})

export default db ;
