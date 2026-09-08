import api from "./api";

export const getProfile = () => api.get("/student/profile").then((r) => r.data);
export const getCounsellors = () => api.get("/student/counsellors").then((r) => r.data);
export const getAvailability = (params) => api.get("/student/availability", { params }).then((r) => r.data);
export const bookAppointment = (data) => api.post("/student/book", data).then((r) => r.data);
export const getAppointments = () => api.get("/student/appointments").then((r) => r.data);
export const cancelAppointment = (id, reason) => api.put(`/student/cancel/${id}`, { reason }).then((r) => r.data);

export const getAssessmentQuestions = () => api.get("/student/assessment/questions").then((r) => r.data);
export const submitAssessment = (responses) => api.post("/student/assessment", { responses }).then((r) => r.data);
export const getAssessmentHistory = () => api.get("/student/assessment-history").then((r) => r.data);

export const submitFeedback = (appointmentId, rating, comment) =>
  api.post("/student/feedback", { appointmentId, rating, comment }).then((r) => r.data);
export const getPendingFeedback = () => api.get("/student/pending-feedback").then((r) => r.data);

export const getUnreadNotifications = () => api.get("/student/notifications").then((r) => r.data);
export const dismissNotification = (id) => api.put(`/student/notifications/${id}/dismiss`).then((r) => r.data);
export const dismissCancellation = (id) => api.put(`/student/dismiss-cancellation/${id}`).then((r) => r.data);

// Q/A Wellness Info Services
export const getWellnessCategories = () => api.get("/wellness/categories").then((r) => r.data);
export const getWellnessQuestions = (category) => api.get(`/wellness/questions/${encodeURIComponent(category)}`).then((r) => r.data);
