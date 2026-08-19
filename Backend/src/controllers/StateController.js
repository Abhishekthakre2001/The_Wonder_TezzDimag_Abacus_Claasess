const StateModel = require("../models/StateModel");

exports.create = async (req, res) => {
  try {
    const [result] = await StateModel.create(req.body);
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ PAGINATION + SEARCH
exports.getAll = async (req, res) => {
  try {
    const { page, limit, search } = req.query;

    const result = await StateModel.findAllPaginated(
      page || 1,
      limit || 10,
      search || ""
    );

    const formattedData = (result.data || [])
      .map((state) => ({
        ...state,
        name: state.name
          ? state.name.charAt(0).toUpperCase() +
          state.name.slice(1).toLowerCase()
          : state.name,
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );

    res.json({
      ...result,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


exports.getById = async (req, res) => {
  const [[row]] = await StateModel.findById(req.params.id);
  res.json(row);
};

exports.getDistrictByState = async (req, res) => {
  const data = await StateModel.getDistrictByState(req.params.id);
  res.json(data);
};

exports.update = async (req, res) => {
  try {
    await StateModel.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  await StateModel.remove(req.params.id);
  res.json({ success: true });
};

// ✅ EXPORT API
exports.exportData = async (req, res) => {
  try {
    const { search, format } = req.query;

    const data = await StateModel.exportAll(search || "");

    // JSON export
    if (!format || format === "json") {
      return res.json(data);
    }

    // CSV export
    if (format === "csv") {
      const fields = Object.keys(data[0] || {});
      const csv = [
        fields.join(","),
        ...data.map((row) =>
          fields.map((f) => `"${row[f] ?? ""}"`).join(",")
        ),
      ].join("\n");

      res.header("Content-Type", "text/csv");
      return res.attachment("states.csv").send(csv);
    }

    res.status(400).json({ error: "Invalid format" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};