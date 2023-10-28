import Course from "../Models/course.model.js";
import AppError from "../Utils/error.util.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises'

// Logic for getting all the courses

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



//Logic for getting lectures detail using specific course id

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
            new AppError(error.message, 500)
        )
    }
}



// Logic for creating course

const createCourse = async (req, res, next) => {
    const { title, description, category, createdBy } = req.body;

    if (!title || !description || !category || !createdBy) {
        return next(
            new AppError('All fields are required', 400)
        )
    }

    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail: {
            public_id: 'Dummy',
            secure_url: 'Dummy'
        }
    });

    if (!course) {
        return next(
            new AppError('Course coud not created, please try again', 500)
        )
    }

    if (req.file) {

        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            });

            if (result) {
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
            }

            fs.rm(`uploads/${req.file.filename}`);

            await course.save();

            res.status(200).josn({
                success: true,
                message: 'Course created successfully',
                course,
            })
        } catch (error) {
            return next(
                new AppError(error.message, 500)
            )
        }
    }
}



// Logic for updating course

const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params; // req.params use to fetch veriable from the URL
        // Find a document in the "Course" collection by its unique ID (typically _id).
        const course = await Course.findByIdAndUpdate(
            id, // ID of the document to update
            {
                $set: req.body // Update data from the request body
            },
            {
                runValidators: true // Enable validation of the updated data
            }
        )


        if (!course) {
            return next(
                new AppError('Course with user id not exist', 500)
            )
        }

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course
        });
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }

}


// logic for remove course 

const removeCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if (!course) {
            return next(
                new AppError('Course with this id not exist', 500)
            )
        }

        await Course.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        })

    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
}

const addLectureToCourseById = async (req, res, next) => {
    const { title, description } = req.body;
    const { id } = req.params;

    if (!title || !description) {
        return next(
            new AppError('All fields are required', 400)
        )
    }

    const course = await Course.findById(id);

    if (!course) {
        return next(
            new AppError('Course with given id is not exist', 500)
        )
    }

    const lectureData = {
        title,
        description,
        lecture:{}
    };

    if (req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            });

            if (result) {
                lectureData.lecture.public_id = result.public_id;
                lectureData.lecture.secure_url = result.secure_url;
            }

            fs.rm(`uploads/${req.file.filename}`);

            await course.save();

            res.status(200).josn({
                success: true,
                message: 'Course created successfully',
                course,
            })
        } catch (error) {
            return next(
                new AppError(error.message, 500)
            )
        }
    }

    course.lectures.push(lectureData);

    course.numbersOfLectures = course.lectures.length;

    await course.save();

    res.status(200).json({
        success: true,
        message: 'Lecture successfully added to the course',
        course
    })
}
export {
    getAllCourses,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById
}