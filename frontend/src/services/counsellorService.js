import api from "./api";

export const getProfile = () => api.get("/counsellor/profile").then((r) => r.data);
export const getDashboardSummary = () => api.get("/counsellor/dashboard").then((r) => r.data);

export const addAvailability = (data) => api.post("/counsellor/availability", data).then((r) => r.data);
export const listAvailability = () => api.get("/counsellor/availability").then((r) => r.data);
export const removeAvailability = (id) => api.delete(`/counsellor/availability/${id}`).then((r) => r.data);

export const getAppointments = () => api.get("/counsellor/appointments").then((r) => r.data);
export const updateAppointmentStatus = (id, status) =>
  api.put(`/counsellor/appointments/${id}/status`, { status }).then((r) => r.data);

export const listStudents = () => api.get("/counsellor/students").then((r) => r.data);
export const getStudentDetail = (id) => api.get(`/counsellor/student/${id}`).then((r) => r.data);
export const getStudentHistory = (id) => api.get(`/counsellor/student/${id}/history`).then((r) => r.data);
export const getStudentAssessments = (id) => api.get(`/counsellor/student/${id}/assessments`).then((r) => r.data);
