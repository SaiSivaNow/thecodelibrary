const Course = require('../models/model');

const createCourse = async (req, res) => {
    try {
        const {course_id, title, details, total_length, price_id} = req.body;

        const newCourse = new Course({
            course_id,
            title,
            details,
            total_length,
            price_id
        });

        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
};

const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
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
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        );
        if (!course) {
            res.status(404).json({message: 'Course not found'});
            return;
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const deleteCourseById = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            res.status(404).json({message: 'Course not found'});
            return;
        }
        res.json({message: 'Course deleted successfully'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

module.exports = {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourseById,
    deleteCourseById
};
