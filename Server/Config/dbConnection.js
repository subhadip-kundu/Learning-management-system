import mongoose from "mongoose";

mongoose.set('strictQuery', false) // By desabling srtictQuery if some query is needed from database and it doesn't exist then it will only ignore the quary instead of giving error


const connectionToDB = async () => {

    try {
        const { connection } = await mongoose.connect(process.env.MONGO_URI);

        if (connection) {
            console.log(`Connected to MongoDB: ${connection.host}`);
        }
    } catch (error) {
        console.log('Getting error while trying to connect with the database');
        process.exit(1); // It will rollback everything if the database is not connected.
    }

}

export default connectionToDB;