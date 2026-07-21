const UserService = require("../services/UserServices");
const UserModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const { getPaginationParams } = require("../utils/getPaginationParams");
const formatExcelData = require("../utils/formatExcelData");
const exportToExcel = require("../utils/excelExport");
const ExamResultModel = require("../models/ExamResultModel");

exports.createUser = async (req, res) => {
  const result = await UserService.createUser(req.body);
  res.status(201).json({ success: true, id: result.insertId });
};

exports.getUsers = async (req, res) => {
  const users = await UserService.getUsers();
  res.json(users);
};

exports.getUserById = async (req, res) => {
  const user = await UserService.getUserById(req.params.id);
  res.json(user);
};

exports.getUserByadminId = async (req, res) => {
  const { page, limit, search } = getPaginationParams(req);
  const { individual_registration } = req.query;
  const result = await UserService.getUserByadminId(
    req.params.id,
    page,
    limit,
    search,
    individual_registration,
  );

  res.json(result);
};

exports.getAdminsBySuperAdminId = async (req, res) => {
  const { page, limit, search } = getPaginationParams(req);
  console.log("req.params.id", req.params.id);
  const result = await UserService.getAdminBySuperAdminId(
    req.params.id,
    page,
    limit,
    search,
  );

  res.json(result);
};
exports.getResultUserByadminId = async (req, res) => {
  const user = await UserService.getResultUserByadminId(req.params.id);
  res.json(user);
};

exports.updateUser = async (req, res) => {
  console.log("req.body", req.body);
  await UserService.updateUser(req.params.id, req.body);
  res.json({ success: true });
};

exports.deleteUser = async (req, res) => {
  await UserService.deleteUser(req.params.id);
  res.json({ success: true });
};

exports.loginUser = async (req, res) => {
  try {
    let { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password required",
      });
    }

    // ✅ ONLY trim spaces
    username = username.trim();

    const user = await UserService.loginUser(username, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    if (user.status !== 1) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive or locked",
      });
    }

    // ⏳ subscription check (unchanged)
    if (user.subscription_end_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiryDate = new Date(user.subscription_end_date);
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        return res.status(403).json({
          success: false,
          message: "Subscription expired. Please contact admin.",
        });
      }
    }

    // ==========================
    // ACCESS TOKEN (15 MIN)
    // ==========================
    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        level:user.level,
        usertype: user.usertype,
        createdby: user.createdby,
        student_category : user.student_category,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: "15m",
      },
    );

    // ==========================
    // REFRESH TOKEN (30 MIN)
    // ==========================
    const refreshToken = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "30m",
      },
    );

    const refreshTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

    // save token in DB
    await UserService.saveRefreshToken(
      user.id,
      refreshToken,
      refreshTokenExpiry,
    );

    delete user.password;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // true in production https
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production https
      sameSite: "strict",
      maxAge: 30 * 60 * 1000, // 30 min
    });

    res.cookie("refreshTokenExpiry", refreshTokenExpiry.toISOString(), {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 30 * 60 * 1000,
    });
    res.json({
      success: true,
      message: "Logged in Successfully",
      accessToken,
      refreshToken,
      refreshTokenExpiry,
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await UserService.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify token matches DB
    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        usertype: user.usertype,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: "15m",
      },
    );

    res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Refresh token expired",
    });
  }
};

exports.exportUserByAdminId = async (req, res) => {
  try {
    const { id } = req.params;

    const users = await UserModel.findAll({
      where: {
        createdby: id,
      },
      raw: true,
    });

    const columns = [
      {
        key: "name",
        label: "Student Name",
      },
      {
        key: "class",
        label: "Class",
      },
      {
        key: "address",
        label: "Address",
      },
      {
        key: "mobilenumber",
        label: "Mobile Number",
      },
      {
        key: "dob",
        label: "Date of Birth",
      },
      {
        key: "subscription_end_date",
        label: "Subscription End Date",
      },
      {
        key: "level",
        label: "Level",
      },
      {
        key: "username",
        label: "Username",
      },
      {
        key: "password",
        label: "Password",
      },
    ];

    const excelData = formatExcelData(
      users.map((user) => ({
        ...user,
        dob: user.dob ? new Date(user.dob).toLocaleDateString("en-IN") : "",
        subscription_end_date: user.subscription_end_date
          ? new Date(user.subscription_end_date).toLocaleDateString("en-IN")
          : "",
      })),
      columns,
    );

    const buffer = exportToExcel({
      data: excelData,
      sheetName: "Students",
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="students.xlsx"',
    );

    return res.send(buffer);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.exportTestResultData = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await ExamResultModel.findExamResultByAdminId(
      id,
      1,
      999999,
      "",
    );

    const data = result.data || [];

    const formattedData = formatExcelData(
      data.map((item) => ({
        ...item,
        date: item.date ? new Date(item.date).toLocaleDateString("en-IN") : "",
      })),
      [
        {
          key: "name",
          label: "Student Name",
        },
        {
          key: "username",
          label: "Username",
        },
        {
          key: "mobilenumber",
          label: "Mobile Number",
        },
        {
          key: "learning_center_name",
          label: "Learning Center",
        },
        {
          key: "exam_name",
          label: "Exam Name",
        },
        {
          key: "exam_level",
          label: "Exam Level",
        },
        {
          key: "paper_set",
          label: "Paper Set",
        },
        {
          key: "total_question",
          label: "Total Questions",
        },
        {
          key: "total_solve",
          label: "Total Solved",
        },
        {
          key: "total_unsolve",
          label: "Total Unsolved",
        },
        {
          key: "total_correct",
          label: "Total Correct",
        },
        {
          key: "exam_time",
          label: "Exam Time",
        },
        {
          key: "time_taken",
          label: "Time Taken",
        },
        {
          key: "status",
          label: "Status",
        },
        {
          key: "date",
          label: "Date",
        },
      ],
    );

    const buffer = exportToExcel({
      data: formattedData,
      sheetName: "Exam Results",
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="exam-results.xlsx"',
    );

    return res.send(buffer);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
