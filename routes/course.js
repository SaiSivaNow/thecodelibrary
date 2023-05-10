const express = require('express');
const passport = require('passport');
const { body, query, validationResult } = require('express-validator');
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
    body('price').notEmpty().withMessage('Price is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateCourseId = [
    query('course_id').notEmpty().withMessage('course_id parameter is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

router.post('/', passport.authenticate('jwt', {session: false}), validateRequest, CourseDb.createCourse);
router.get('/', passport.authenticate('jwt', {session: false}), CourseDb.getAllCourses);
router.get('/courseById', passport.authenticate('jwt', {session: false}), validateCourseId, CourseDb.getCourseById);
router.patch('/updateCourse', passport.authenticate('jwt', {session: false}), validateCourseId, validateRequest, CourseDb.updateCourseById);
router.delete('/deleteCourse', passport.authenticate('jwt', {session: false}), validateCourseId, CourseDb.deleteCourseById);

module.exports = router;