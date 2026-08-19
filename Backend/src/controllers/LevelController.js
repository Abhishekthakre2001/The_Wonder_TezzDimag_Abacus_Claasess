const LevelModel = require("../models/LevelModel");
const {
  getPaginationParams,
} = require("../utils/getPaginationParams");

exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { level, level_name } = req.body;

    if (!level || !level_name) {
      return res.status(400).json({
        error: "level and level_name are required",
      });
    }

    // Check if level already exists for this user
    const [existingRows] = await LevelModel.findByLevelAndUser(
      level,
      userId
    );

    if (existingRows.length > 0) {
      return res.status(400).json({
        error: "Level already exists for this user",
      });
    }

    const [result] = await LevelModel.create({
      level,
      level_name,
    }, userId);

    return res.status(201).json({
      success: true,
      message: "Level created successfully",
      data: {
        id: result.insertId,
        level,
        level_name,
      },
    });
  } catch (error) {
    console.error("Create level error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const [rows] = await LevelModel.findAll();

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get all levels error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [rows] = await LevelModel.findByIdAndUser(id, userId);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Level not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get level by ID error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.getAllByAdmin = async (req, res) => {
  try {
    const { page, limit, search } = getPaginationParams(req);
    const userId = req.user.id;

    const result = await LevelModel.findAllByAdmin(
      userId,
      page,
      limit,
      search
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get admin levels error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { level, level_name } = req.body;

    if (!level || !level_name) {
      return res.status(400).json({
        error: "level and level_name are required",
      });
    }

    // Check if level belongs to current user
    const [currentRows] = await LevelModel.findByIdAndUser(
      id,
      userId
    );

    if (currentRows.length === 0) {
      return res.status(404).json({
        error: "Level not found",
      });
    }

    // Check duplicate level for this user
    const [existingRows] = await LevelModel.findByLevelAndUser(
      level,
      userId
    );

    const duplicate = existingRows.find(
      (item) => item.id !== Number(id)
    );

    if (duplicate) {
      return res.status(400).json({
        error: "Level already exists for this user",
      });
    }

    await LevelModel.update(id, userId, {
      level,
      level_name,
    });

    return res.status(200).json({
      success: true,
      message: "Level updated successfully",
    });
  } catch (error) {
    console.error("Update level error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await LevelModel.remove(id, userId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Level not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Level deleted successfully",
    });
  } catch (error) {
    console.error("Delete level error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};