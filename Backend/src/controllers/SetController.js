const SetModel = require("../models/SetModel");
const {
  getPaginationParams,
} = require("../utils/getPaginationParams");

/**
 * Create a new set for the authenticated user.
 */
exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { set_name } = req.body;

    if (!set_name?.trim()) {
      return res.status(400).json({
        error: "Set name is required",
      });
    }

    const name = set_name.trim().toUpperCase();

    // Check whether this set already exists for the logged-in user.
    const [existingRows] =
      await SetModel.findBySetNameAndUser(name, userId);

    if (existingRows.length > 0) {
      return res.status(400).json({
        error: "Set already exists for this user",
      });
    }

    // createdby comes from the JWT, not from req.body.
    const [result] = await SetModel.create(name, userId);

    return res.status(201).json({
      success: true,
      message: "Set created successfully",
      data: {
        id: result.insertId,
        set_name: name,
      },
    });
  } catch (error) {
    console.error("Create set error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all sets.
 *
 * This returns only sets belonging to the authenticated user.
 */
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await SetModel.findAllByUser(userId);

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get all sets error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get paginated sets for the authenticated user.
 */
exports.getByAdmin = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      page,
      limit,
      search,
    } = getPaginationParams(req);

    const result = await SetModel.findAllByUser(
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
    console.error("Get user sets error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get a single set belonging to the authenticated user.
 */
exports.getById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [rows] = await SetModel.findByIdAndUser(id, userId);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Set not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get set by ID error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update a set belonging to the authenticated user.
 */
exports.update = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { set_name } = req.body;

    if (!set_name?.trim()) {
      return res.status(400).json({
        error: "Set name is required",
      });
    }

    const name = set_name.trim().toUpperCase();

    // Make sure the set belongs to the logged-in user.
    const [currentRows] =
      await SetModel.findByIdAndUser(id, userId);

    if (currentRows.length === 0) {
      return res.status(404).json({
        error: "Set not found",
      });
    }

    // Check for duplicate set name for the same user.
    const [existingRows] =
      await SetModel.findBySetNameAndUser(name, userId);

    const duplicate = existingRows.find(
      (row) => row.id !== Number(id)
    );

    if (duplicate) {
      return res.status(400).json({
        error: "Set already exists for this user",
      });
    }

    await SetModel.update(id, userId, name);

    return res.status(200).json({
      success: true,
      message: "Set updated successfully",
    });
  } catch (error) {
    console.error("Update set error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete a set belonging to the authenticated user.
 */
exports.remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await SetModel.remove(id, userId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Set not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Set deleted successfully",
    });
  } catch (error) {
    console.error("Delete set error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get sets available to the authenticated student.
 *
 * createdby and level are taken from the JWT.
 */
exports.getStudentSets = async (req, res) => {
  try {
    const createdby = req.user.createdby;
    const level = req.user.level;

    const [rows] = await SetModel.getStudentSets(
      createdby,
      level
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get student sets error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};