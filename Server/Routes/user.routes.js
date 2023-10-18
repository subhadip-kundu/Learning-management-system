import { Router } from "express";
import { getProfile, login, logout, register } from "../Controllers/user.controller.js";
import { isLoggedIn } from "../Middleware/auth.middleware.js";

const router = Router();


// Register
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isLoggedIn , getProfile);


export default router;

