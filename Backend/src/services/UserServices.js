const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");

const UserService = {
  createUser: async (data) => {
    // if (data.password) {
    //   data.password = await bcrypt.hash(data.password.trim(), 10);
    // }
    return UserModel.create(data);
  },

  getUsers: () => UserModel.findAll(),

  getUserById: (id) => UserModel.findById(id),

  // getUserByadminId: (id) => UserModel.findByadminId(id),
  getUserByadminId: (id, page, limit, search, individual_registration, student_category) =>
    UserModel.findByadminId(id, page, limit, search, individual_registration, student_category),
  getAdminBySuperAdminId: (id, page, limit, search) =>
    UserModel.findBySuperAdminId(id, page, limit, search),

  getResultUserByadminId: (id) => UserModel.ResultfindByadminId(id),

  updateUser: (id, data) => UserModel.update(id, data),

  deleteUser: (id) => UserModel.remove(id),

  loginUser: async (username, password) => {
    const user = await UserModel.findByUsername(username);
    if (!user) return null;

    // ✅ PLAIN TEXT comparison
    const isMatch = password.trim() === user.password.trim();
    // const isMatch = await bcrypt.compare(password.trim(), user.password);

    if (!isMatch) {
      return null;
    }

    return user;
  },

  saveRefreshToken: async (userId, refreshToken, refreshTokenExpiry) => {
    return UserModel.saveRefreshToken(userId, refreshToken, refreshTokenExpiry);
  },
  findByRefreshToken: async (refreshToken) => {
    return UserModel.findByRefreshToken(refreshToken);
  },

  clearRefreshToken: async (userId) => {
    return UserModel.clearRefreshToken(userId);
  },
};

module.exports = UserService;
