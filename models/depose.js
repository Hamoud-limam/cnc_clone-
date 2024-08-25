import mongoose, { Types }  from 'mongoose'

const deposeSchema = new mongoose.Schema({
    info:{type:String,required:true},
    NNI:{type:String,required:true}
});

const depose = new  mongoose.model('candidates', deposeSchema);
export default depose