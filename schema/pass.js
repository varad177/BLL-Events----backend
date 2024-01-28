
import mongoose from 'mongoose';

const passSchema = new mongoose.Schema({
    logourl: {
        type: String,
        
    },
    public_url: {
        type: String,
      
    },
    heading: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
    mobno1: {
        type: Number,
        required: true,
    
    },
    mobno2: {
        type: Number,
       
    },
    editor: {
        type:[]
    },
    date:{
        type : String,
        require : true
    }
} , 
{
    timestamps: {
      createdAt: "createdAt",
    },
  });

export default mongoose.model("passModel", passSchema);

