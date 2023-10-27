import { Router } from 'express';
import { getAllCourses, getLecturesByCourseId } from '../Controllers/course.controller.js';
import { isLoggedIn } from '../Middleware/auth.middleware.js';

const courseRoutes = Router();

courseRoutes.get('/', getAllCourses);

courseRoutes.get('/:id', isLoggedIn, getLecturesByCourseId);

export default courseRoutes;