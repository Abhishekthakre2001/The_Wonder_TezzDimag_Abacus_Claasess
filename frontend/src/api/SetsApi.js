// src/api/userApi.js
import axiosInstance from "./axiosInstance";

const setsApi = {
  getAll: () => axiosInstance.get("/sets"),
  getbyid: (id) => axiosInstance.get(`/sets/${id}`),
  getStudentSets: () => axiosInstance.get("/sets/student/sets"),
  // getbyadminid: (id) => axiosInstance.get(`/sets/admin/${id}`),
  getbyadminid: (id, page = 1, limit = 5, search = "") =>
    axiosInstance.get(
      `/sets/admin/${id}?page=${page}&limit=${limit}&search=${search}`,
    ),
  create: (payload) => axiosInstance.post("/sets", payload),
  update: (id, payload) => axiosInstance.put(`/sets/${id}`, payload),
  delete: (id) => axiosInstance.delete(`/sets/${id}`),
};

export default setsApi;
