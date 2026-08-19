import api from "./api";

export const studentRegister = (data) => api.post("/auth/student/register", data).then((r) => r.data);
export const studentLogin = (data) => api.post("/auth/student/login", data).then((r) => r.data);

export const counsellorRegister = (data) => api.post("/auth/counsellor/register", data).then((r) => r.data);
export const counsellorLogin = (data) => api.post("/auth/counsellor/login", data).then((r) => r.data);
