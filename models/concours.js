import mongoose  from 'mongoose'

const councoursSchema = new mongoose.Schema({
    concour: { type: String, required: true, },
    end: { type: String, required: true, }
});

const concours = new  mongoose.model('concours', councoursSchema);
export default concours