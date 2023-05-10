const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
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
    },
    price: {
        type: String,
        required: true
    }
}, {collection: 'course_catalog'});

const Course = mongoose.model('Course', courseSchema, 'course_catalog');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    dob: {
        type: Date,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    progress: [{
        course_id: {
            type: String,
            ref: 'Course',
            required: true
        },
        topic: {
            type: String,
            required: true
        },
        seen_length: {
            type: String,
            required: true
        }
    }],
    courseAccess: [{
        course_id: {
            type: String,
            ref: 'Course',
            required: true
        }
    }],
    order_history: [{
        course_id: {
            type: String,
            ref: 'Course',
            required: true
        },
        txn_id: {
            type: String,
            required: true
        },
        order_date_time: {
            type: Date,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['SUCCESS', 'FAILED', 'Other'],
            required: true
        }
    }]
}, {collection: 'users'});

const User = mongoose.model('User', userSchema, 'users');

module.exports = {
    User,
    Course
};
