const SetModel = require("../models/SetModel");
const { getPaginationParams } = require("../utils/getPaginationParams");

exports.create = async (req, res) => {
  try {
    // Check if set already exists for this user
    const [[existing]] = await SetModel.findBySetNameAndUser(req.body.set_name, req.body.createdby);
    if (existing) {
      return res.status(400).json({ error: "Set already exists for this user" });
    }
    
    const [result] = await SetModel.create(req.body);
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  const [rows] = await SetModel.findAll();
  res.json(rows);
};

exports.getbyadminid = async (req, res) => {
  const { page, limit, search } =
    getPaginationParams(req);

  const result =
    await SetModel.findbyadminid(
      req.params.id,
      page,
      limit,
      search
    );

  res.json(result);
};

exports.getById = async (req, res) => {
  const [[row]] = await SetModel.findById(req.params.id);
  res.json(row);
};

exports.update = async (req, res) => {
  try {
    // Check if another set with same name exists for this user (excluding current one)
    const [existing] = await SetModel.findBySetNameAndUser(req.body.set_name, req.body.createdby);
    if (existing && existing.length > 0 && existing[0].id !== parseInt(req.params.id)) {
      return res.status(400).json({ error: "Set already exists for this user" });
    }
    
    await SetModel.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  await SetModel.remove(req.params.id);
  res.json({ success: true });
};

exports.getStudentSets = async (req, res) => {
  try {
    // console.log("req.user",req.user)
    const createdby = req.user.createdby;
    const level = req.user.level;

    console.log("created by",createdby , " and level ", level)

    const [rows] = await SetModel.getStudentSets(createdby, level);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};