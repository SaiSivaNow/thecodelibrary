const Course = require('../models/model').Course;
const User = require('../models/model').User;

const createCourse = async (req, res) => {
    try {
        const {course_id, title, details, total_length, price_id, price} = req.body;

        const newCourse = new Course({
            course_id,
            title,
            details,
            total_length,
            price_id,
            price
        });

        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
};

const getAllCourses = async (req, res) => {
    try {
        const userId = req.query.userId;
        const user = userId ? await User.findOne({email: userId}) : null;

        if (userId && !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const enrolledCourseIds = user ? user.courseAccess.map((access) => access.course_id) : [];

        const enrolledCourses = await Course.find({ course_id: { $in: enrolledCourseIds } });
        const availableCourses = await Course.find({ course_id: { $nin: enrolledCourseIds } });

        const response = {
            enrolledCourses: enrolledCourses.map((course) => ({
                course_id: course.course_id,
                title: course.title,
                details: course.details,
                price: course.price
            })),
            availableCourses: availableCourses.map((course) => ({
                course_id: course.course_id,
                title: course.title,
                details: course.details,
                price: course.price
            })),
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch enrolled courses' });
    }
};

const getCourseById = async (req, res) => {
    try {
        const field = req.query.course_id;
        const course = await Course.findOne({course_id: field});
        if (!course) {
            res.status(404).json({message: 'Course not found'});
            return;
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const updateCourseById = async (req, res) => {
    try {
        const course = await Course.findOneAndUpdate(
            { course_id: req.query.course_id },
            req.body,
            { new: true }
        );
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCourseById = async (req, res) => {
    try {
        const course = await Course.findOneAndDelete({ course_id: req.query.course_id });
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourseById,
    deleteCourseById
};
