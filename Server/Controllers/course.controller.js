import Course from "../Models/course.model.js";
import AppError from "../Utils/error.util.js";

const getAllCourses = async function (req, res, next) {

    try {
        const courses = await Course.find({}).select('-lectures');

        res.status(200).json({
            success: true,
            message: 'All courses',
            courses
        });
    } catch (error) {
        return next(new AppError('Can not fetch the courses.', 400));
    }
}

const getLecturesByCourseId = async function (req, res, next) {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);

        if (!course) {
            return next(
                new AppError('Invalid course id', 400)
            )
        }

        res.status(200).json({
            success: true,
            message: 'Course lectures fetched successfully',
            lectures: course.lectures
        });
    } catch (error) {
        return next(
            new AppError(e.message, 500)
        )
    }
}

export {
    getAllCourses,
    getLecturesByCourseId
}