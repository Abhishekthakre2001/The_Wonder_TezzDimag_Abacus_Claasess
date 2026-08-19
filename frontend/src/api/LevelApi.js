import axiosInstance from "./axiosInstance";

const levelApi = {
  getAll: () => axiosInstance.get("/levels"),
  // getbyadminid: (adminid) => axiosInstance.get(`/levels/admin?adminid=${adminid}`),
  getbyadminid: (
    page = 1,
    limit = 5,
    search = ""
  ) =>
    axiosInstance.get(
      `/levels/admin?page=${page}&limit=${limit}&search=${search}`
    ),
  create: (payload) => axiosInstance.post("/levels/save", payload),
  update: (id, payload) => axiosInstance.put(`/levels/${id}`, payload),
  delete: (id) => axiosInstance.delete(`/levels/${id}`),
};

export default levelApi;
