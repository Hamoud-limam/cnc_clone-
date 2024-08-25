import mongoose from "mongoose";

const db = mongoose.connect('mongodb://localhost:27017/CNC')

db.then(()=>{
    console.log('connected to db')
})
db.catch((err)=>{
    console.error(err)
})

export default db ;