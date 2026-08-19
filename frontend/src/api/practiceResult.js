import axiosInstance from "./axiosInstance";

const practiceResultApi = {
  // Start Practice Exam
  startPracticeExam: (data) =>
    axiosInstance.post("/practice-result/start", data),

  // Save Answer
  saveAnswer: (data) =>
    axiosInstance.post("/practice-result/save-answer", data),

  // Submit Practice Exam
  submitPracticeExam: (data) =>
    axiosInstance.post("/practice-result/submit", data),

  // Get Practice Result
  getPracticeResult: (resultId) =>
    axiosInstance.get(`/practice-result/${resultId}`),
};

export default practiceResultApi;
