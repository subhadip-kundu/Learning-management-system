import { Router } from 'express';
import { addLectureToCourseById, createCourse, getAllCourses, getLecturesByCourseId, removeCourse, updateCourse } from '../Controllers/course.controller.js';
import { authorizedRoles, isLoggedIn } from '../Middleware/auth.middleware.js';
import upload from '../Middleware/multer.middleware.js';

const courseRoutes = Router();

courseRoutes
    .get('/', getAllCourses)
    .post('/', isLoggedIn, authorizedRoles('ADMIN'), upload.single('thumbnail'), createCourse);

courseRoutes
    .get('/:id', isLoggedIn, getLecturesByCourseId)
    .put('/:id', isLoggedIn, authorizedRoles('ADMIN'), updateCourse)
    .delete('/:id', isLoggedIn, authorizedRoles('ADMIN'), removeCourse)
    .post('/:id', isLoggedIn, authorizedRoles('ADMIN'),upload.single('lecture'), addLectureToCourseById);



export default courseRoutes;