import user from "../Models/use.model.js";
import AppError from "../Utils/error.util.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import sendEmail from "../Utils/sendEmail.js";
import crypto from 'crypto';
// import user from "../Models/use.model.js";


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

    // file upload

    if (req.file) {
        console.log(req.file);
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                width: 250,
                height: 250,
                gravity: 'faces',
                crop: 'fill'
            });

            if (result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                // remove file from local server
                fs.rm(`uploads/${req.file.filename}`)
            }
        } catch (error) {
            new AppError(error || 'File not uploaded, please try again')
        }
    }



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
            success: true,
            message: 'User details',
            user
        })
    } catch (error) {
        return next(new AppError('Failed to fetch profile'), 500)
    }
};



// Logic for forgot password

const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError('Email is required'), 500);
    }

    const user = await user.findOne({ email });

    if (!user) {
        return next(new AppError('Email not registered'), 500);
    }

    const resetToken = await user.generatePasswordResetToken();

    await user.save();


    // Reset password email generation

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const subject = 'Reset Password';
    const message = `You can reset your password by clicking <a href=${resetPasswordURL} target='blank'>Reset your password</a> \n If the link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.`

    try {
        await sendEmail(email, subject, message); //function define in utility folder

        res.status(200).json({
            success: true,
            message: `Reset password token has been send to ${email} successfully`
        })
    } catch (error) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        await user.save();
        return next(new AppError('Internal server error,Cannot generate reset email'), 500);
    }

};



// Logic for reset password using link send by user email address

const resetPassword = async (req, res) => {
    const { resetToken } = req.params;

    const { password } = req.body;

    const forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    const user = await user.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return next(
            new AppError('Token is invalid or expired , Please try again', 500)
        )
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    user.save();


    res.status(200).json({
        success: true,
        message: 'password changed successfully!'
    })
}



// Logic for change user password if password is remembered by user

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;

    if (!oldPassword || newPassword) {
        return next(
            new AppError('All fields are mendatory', 500)
        )
    }

    const user_detail = await user.findById(id).select('password');

    if (!user_detail) {
        return next(
            new AppError('User does not exist', 500)
        )
    }

    const isPasswordValid = await user_detail.comparePassword(oldPassword);

    if (!isPasswordValid) {
        return next(
            new AppError('Old password not matched', 500)
        )
    }

    user_detail.password = newPassword;

    await user_detail.save();

    user_detail.password = undefined;

    res.status(200).json({
        success: true,
        message: 'Password changed successfully'
    })
}



// Logic for update user profile


const updateUser = async (req, res) => {
    const { fullName } = req.body;
    const { id } = req.user.id;

    const user_id = await user.findById(id);

    if (!user_id) {
        return next(
            new AppError('User does not exist', 500)
        )
    }

    if (req.fullName) {
        user_id.fullName = fullName;
    }

    if (req.file) {
        await cloudinary.v2.uploader.destroy(user_id.avatar.public_id);
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                width: 250,
                height: 250,
                gravity: 'faces',
                crop: 'fill'
            });

            if (result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                // remove file from local server
                fs.rm(`uploads/${req.file.filename}`)
            }
        } catch (error) {
            new AppError(error || 'File not uploaded, please try again')
        }
    }


    await user_id.save();

    res.status(200).json({
        success: true,
        message: 'User details updated successfully'
    })

}



export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser
}
