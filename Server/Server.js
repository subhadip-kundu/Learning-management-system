import { config } from 'dotenv';
config();

import app from './App.js'
import connectionToDB from './Config/dbConnection.js';


const PORT = process.env.PORT || 5010;

app.listen(PORT,async()=>{
    await connectionToDB();
    console.log(`Running at : http://localhost:${PORT}`);
});

