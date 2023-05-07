const course = require('../database/course.json');
const getEnrolledCourses = (userId) => {
    try {
        return course.enrolled;
    } catch (error) {
        throw error;
    }
};

const getAvailableCourses = () => {
    try {
        return course.available;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getEnrolledCourses,
    getAvailableCourses,
};