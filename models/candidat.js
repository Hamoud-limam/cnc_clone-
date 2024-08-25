import mongoose from "mongoose";


const studentSchema = new mongoose.Schema({
    name: String,
    concour: String,
    email: String,
    NNI:String,
    carteUrl: String,   
    bacUrl: String  ,
    stautus: {type:String,default:"En cours"},
    time : {type:String,default:new Date()},
  });
  
  const candidat = mongoose.model('candidates', studentSchema);

  export default candidat