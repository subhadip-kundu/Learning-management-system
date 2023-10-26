import { config } from 'dotenv';
config();

import app from './App.js'
import connectionToDB from './Config/dbConnection.js';
import cloudinary from 'cloudinary';


const PORT = process.env.PORT || 5010;


// cloudinary configaration

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.YOUR_CLOUDENARY_API_SECRET,
});


app.listen(PORT,async()=>{
    await connectionToDB();
    console.log(`Running at : http://localhost:${PORT}`);
});

