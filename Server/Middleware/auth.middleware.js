import AppError from "../Utils/error.util.js";

const isLoggedIn = async (req,res,next) =>{
    const { token } = req.cookies;

    if(!token){
        return next(new AppError('Unauthenticated, please log in again',400));
    }

    const userDetails = await JsonWebTokenError.verify(token,process.env.JWT_SECRET);

    res.user = userDetails;

    next();  //It must call next() to pass control to the next middleware function
}


const authorizedRoles = (...roles) => async(req,res,next) =>{
    const currentUserRole = req.user.role;
    if(!roles.includes(currentUserRole)){
        return next(
            new AppError('You do not have permission to access this route',403)
        )
    }
    next() //It must call next() to pass control to the next middleware function
}


export {
    isLoggedIn,
    authorizedRoles
}