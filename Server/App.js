import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoutes from './Routes/user.routes.js';
import errorMiddleware from './Middleware/error.middleware.js';

// const cook

const app = express();


//Middleware

app.use(express.json());

app.use(express.urlencoded({ extended: true })); // The extended option allows to choose between parsing the URL-encoded data with the querystring library (when false) or the qs library (when true).

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));

app.use(cookieParser());

app.use(morgan('dev'));  //To log which type of request are comming


//Routes to check the server is up or not
app.use('/ping', function (req, res) {
    res.send('Pong');
});

//Other routes

app.use('/api/v1/user', userRoutes);


// Any random url which is not defined

app.all('*', (req, res) => {
    res.status(404).send('OOPS!! 404 Page not found');
})

// If any error occur it will return to the client
app.use(errorMiddleware);

export default app;

