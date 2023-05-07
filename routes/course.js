const express = require('express')
const { query, validationResult } = require('express-validator');
const router = express.Router()
const dotenv = require("dotenv");
const env = process.env.NODE_ENV || 'prod';
const config = require(`../config/${env}.json`);
const CourseDb = require("../database/course-db");
dotenv.config()

router.get('/course-catalog', [
    query('user_id')
        .exists()
        .withMessage('user_id should not be empty')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const userId = req.query.user_id;
        const enrolled = CourseDb.getEnrolledCourses(userId);
        const available = CourseDb.getAvailableCourses();

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ enrolled, available });
    } catch (error) {
        console.log('Error while fetching course catalog', JSON.stringify(error));
        res.setHeader('Content-Type', 'application/json');
        res.status(error.status || 500).json({ status: error.status, message: error.message });
    }
});
module.exports=router;