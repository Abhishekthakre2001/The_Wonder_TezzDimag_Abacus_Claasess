import axiosInstance from "./axiosInstance";

// Create Question Paper
const create = (payload) => {
  return axiosInstance.post("/questions/import", payload);
};

// Get Question Papers
const getAll = (page = 1, limit = 10, search = "") => {
  return axiosInstance.get("/questions", {
    params: {
      page,
      limit,
      search,
    },
  });
};

// Get Questions of a Paper
const getQuestionsByPaper = (paperId, page = 1, limit = 10) => {
  return axiosInstance.get(`/questions/${paperId}/questions`, {
    params: {
      page,
      limit,
    },
  });
};

// Update Question
const updateQuestion = (id, payload) => {
  return axiosInstance.put(`/questions/question/${id}`, payload);
};

// Delete Question
const deleteQuestion = (id) => {
  return axiosInstance.delete(`/questions/question/${id}`);
};

// Update Question Paper
const update = (id, payload) => {
  return axiosInstance.put(`/questions/${id}`, payload);
};

// Delete Question Paper
const remove = (id) => {
  return axiosInstance.delete(`/questions/${id}`);
};

// Get full exam paper (questions) for a level + set — used on the student exam screen
// GET /exam-paper?level_id=37&set_id=16
const getExamPaper = (levelId, setId, paper_type) => {
  return axiosInstance.get("/exam-paper", {
    params: {
      level_id: levelId,
      set_id: setId,
      paper_type: paper_type,
    },
  });
};

const addQuestion = (paperId, payload) => {
  return axiosInstance.post(`/questions/${paperId}/question`, payload);
};

export default {
  addQuestion,
  create,
  getAll,
  getQuestionsByPaper,
  updateQuestion,
  deleteQuestion,
  update,
  remove,
  getExamPaper,
};
