import { Router } from "express";
import { changePassword, forgotPassword, getProfile, login, logout, register, resetPassword, updateUser } from "../Controllers/user.controller.js";
import { isLoggedIn } from "../Middleware/auth.middleware.js";
import upload from "../Middleware/multer.middleware.js";

const router = Router();


// Routers
router.post('/register',upload.single("avatar"), register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isLoggedIn , getProfile);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password',isLoggedIn,changePassword);
router.put('/update', isLoggedIn,upload.single("avatar"),updateUser)


export default router;

