import axiosInstance from "./axiosInstance";

const setsApi = {
  // Get all sets
  getAll: () => axiosInstance.get("/sets"),

  // Get a single set
  getById: (id) => axiosInstance.get(`/sets/${id}`),

  // Get sets available to the logged-in student
  getStudentSets: () => axiosInstance.get("/sets/student/sets"),

  // Get sets belonging to the logged-in user
  getByAdmin: (page = 1, limit = 5, search = "") =>
    axiosInstance.get("/sets/admin", {
      params: {
        page,
        limit,
        search,
      },
    }),

  // Create a set
  // User ID is obtained from JWT on the backend.
  create: (payload) => axiosInstance.post("/sets", payload),

  // Update a set
  // Ownership is verified using the JWT user ID on the backend.
  update: (id, payload) =>
    axiosInstance.put(`/sets/${id}`, payload),

  // Delete a set
  // Ownership is verified using the JWT user ID on the backend.
  delete: (id) => axiosInstance.delete(`/sets/${id}`),
};

export default setsApi;