import AppError from "../Utils/error.util.js";

const isLoggedIn = async (req,res,next) =>{
    const { token } = req.cookies;

    if(!token){
        return next(new AppError('Unauthenticated, please log in again',400));
    }

    const userDetails = await JsonWebTokenError.verify(token,process.env.JWT_SECRET);

    res.user = userDetails;

    next();
}


export {
    isLoggedIn
}