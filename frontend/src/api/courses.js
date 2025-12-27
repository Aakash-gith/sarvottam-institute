import API from './axios';

export const getCourses = async () => {
    const response = await API.get('/courses');
    return response.data;
};

export const getCourseById = async (id) => {
    const response = await API.get(`/courses/${id}`);
    return response.data;
}

export const enrollInCourse = async (courseId) => {
    const response = await API.post(`/courses/${courseId}/enroll`);
    return response.data;
}

export const getLiveClasses = async (courseId) => {
    const response = await API.get(`/live-classes/course/${courseId}`);
    return response.data;
}

export const joinLiveClass = async (classId) => {
    const response = await API.get(`/live-classes/${classId}/join`);
    return response.data;
}

export const getCourseProgress = async (courseId) => {
    const response = await API.get(`/courses/${courseId}/progress`);
    return response.data;
}

export const updateProgress = async (data) => {
    // data: { courseId, contentId, type, score? }
    const response = await API.post(`/courses/progress`, data);
    return response.data;
}
