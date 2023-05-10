const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const dotenv = require("dotenv");
const env = process.env.NODE_ENV || 'prod';
const config = require(`../config/${env}.json`);
const CourseDb = require("../database/course_db");
dotenv.config()

// Middleware for request validations
const validateRequest = [
    body('course_id').notEmpty().withMessage('Course ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('details').isArray({ min: 1 }).withMessage('Details must be an array with at least one element'),
    body('total_length').notEmpty().withMessage('Total length is required'),
    body('price_id').notEmpty().withMessage('Price ID is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Middleware for validating ID parameter
const validateId = [
    param('id').notEmpty().withMessage('ID parameter is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Create a new course
router.post('/courses', validateRequest, CourseDb.createCourse);

// Read all courses
router.get('/courses', CourseDb.getAllCourses);

// Read a course by ID
router.get('/courses/:id', validateId, CourseDb.getCourseById);

// Update a course by ID
router.patch('/courses/:id', validateId, validateRequest, CourseDb.updateCourseById);

// Delete a course by ID
router.delete('/courses/:id', validateId, CourseDb.deleteCourseById);

module.exports = router;