import axiosInstance from "./axiosInstance";

const examScheduleApi = {
  // ==========================================
  // Exam Schedules CRUD (New API Endpoints)
  // ==========================================
  getAll: (page = 1, limit = 10, search = "", exam_status = "", exam_category = "", exam_type = "") =>
    axiosInstance.get("/exam-schedules", {
      params: { page, limit, search, exam_status, exam_category, exam_type },
    }),

  getById: (id) => axiosInstance.get(`/exam-schedules/${id}`),

  create: (payload) => axiosInstance.post("/exam-schedules", payload),

  update: (id, payload) => axiosInstance.put(`/exam-schedules/${id}`, payload),

  delete: (id) => axiosInstance.delete(`/exam-schedules/${id}`),

  export: (format = "csv", search = "", exam_status = "", exam_category = "", exam_type = "") =>
    axiosInstance.get("/exam-schedules/export", {
      params: { format, search, exam_status, exam_category, exam_type },
      responseType: "blob",
    }),

  // ==========================================
  // Related Data Fetching
  // ==========================================
  getLevels: () => axiosInstance.get("/levels"),

  getSets: () => axiosInstance.get("/sets"),

  // getStates: () => axiosInstance.get("/states"),

  getStates: (page = 1, limit = 100) =>
    axiosInstance.get(`/states?page=${page}&limit=${limit}`),

  // getDistricts: (stateId) => axiosInstance.get(`/districts?state_id=${stateId}`),
  getDistricts: (stateId) =>
    axiosInstance.get(
      `/states/state/${stateId}`
    ),

  getInstitutes: (districtId) => axiosInstance.get(`/institute`),

  getQuestionPapers: (level_ids = [], set_ids = []) => {
    const params = new URLSearchParams();
    if (level_ids.length > 0) params.append("level_ids", level_ids.join(","));
    if (set_ids.length > 0) params.append("set_ids", set_ids.join(","));

    return axiosInstance.get("/questions", { params });
  },

  // ==========================================
  // Legacy Endpoints (Keep for compatibility)
  // ==========================================
  getOldAll: () => axiosInstance.get("/exam-schedule"),

  getByadmin: (id) =>
    axiosInstance.get(`/exam-schedule/all/${id}`),

  // student exam schedule
  getstudnetupcomeingexam: (level, adminid) =>
    axiosInstance.get(`/exam-schedule/studentexam?level=${level}&createdby=${adminid}`),

  // is exam live
  getLiveExam: (level, adminid) =>
    axiosInstance.get(`/exam-schedule/live?level=${level}&createdby=${adminid}`),
};

export default examScheduleApi;

