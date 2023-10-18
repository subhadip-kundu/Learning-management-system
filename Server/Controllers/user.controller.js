import user from "../Models/use.model.js";
import AppError from "../Utils/error.util.js";


//Define cookieOptions
const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    httpOnly: true,
    secure: true
}



// Logic of regestration

const register = async (req, res, next) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
        return next(new AppError('All field are required', 400));
    }

    const userExists = await user.findOne({ email });

    if (userExists) {
        return next(new AppError('Email already exists', 400));
    }

    const user = await user.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: 'https://res.cloudinary.com/dmqbu70sd/image/upload/v1697633793/samples/man-portrait.jpg'
        }
    });

    if (!user) {
        return next(new AppError('User regestration failed,please try again', 400));
    }

    //TODO: file upload

    await user.save();

    user.password = undefined; // To make sure the original password is not revealed when try to fetch user password

    // If user registered successfully then no need to login , It login by default........
    // Created web token
    const token = await user.generateJWTToken();

    //Use cookie 
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
        success: true,
        message: 'User registeres successfully',
        user
    })

};



//Logic of Login

const login = async (req, res, next) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError('All fields are required'), 400);
        }

        const user = await user.findOne({
            email
        }).select(+password);

        if (!user || !user.comparePassword(password)) {
            return next(new AppError('Email or password does not match'), 400);
        }

        const token = await user.generateJWTToken();
        user.password = undefined;

        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'User loggedin successfully',
            user,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }

};



//Logic of Logout (The base logic of log out someone is delete the cookie againest it . So it will automatically logout user.)

const logout = (req, res) => {

    try {
        res.cookie('token', null, {
            secure: true,
            maxAge: 0,
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        });
    } catch (error) {
        return next(new AppError('Logout failed'), 500);
    }
};




// Logic for view logged user profile (The information about the logged user)

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await user.findOne(userId)

        res.status(200).json({
            success:true,
            message:'User details',
            user
        })
    } catch (error) {
        return next(new AppError('Failed to fetch profile'),500)
    }
};

export {
    register,
    login,
    logout,
    getProfile
}
