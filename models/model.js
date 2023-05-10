const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        course_id: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        details: [
            {
                topic: String,
                length: String,
                s3_link: String
            }
        ],
        total_length: {
            type: String,
            required: true
        },
        price_id: {
            type: String,
            required: true
        }
    },
    { collection: 'course_catalog' }
);

const Course = mongoose.model('Course', courseSchema, 'course_catalog');

module.exports = Course;
