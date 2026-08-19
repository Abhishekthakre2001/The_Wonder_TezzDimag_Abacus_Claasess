// controllers/DistrictController.js
const DistrictModel = require("../models/DistrictModel");

exports.create = async (req, res) => {
    try {
        const [result] = await DistrictModel.create(req.body);
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const toTitleCase = (value) => {
    if (!value) return value;

    return value
        .toLowerCase()
        .split(" ")
        .map((word) =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
};

exports.getAll = async (req, res) => {
    try {
        const { page, limit, search } = req.query;

        const result = await DistrictModel.findAllPaginated(
            page || 1,
            limit || 10,
            search || ""
        );

        const formattedData = (result.data || [])
            .map((district) => ({
                ...district,
                name: toTitleCase(district.name),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

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


exports.exportData = async (req, res) => {
    const { search, format } = req.query;

    const data = await DistrictModel.exportAll(search || "");

    if (!format || format === "json") {
        return res.json(data);
    }

    if (format === "csv") {
        const fields = Object.keys(data[0] || {});
        const csv = [
            fields.join(","),
            ...data.map((row) =>
                fields.map((f) => `"${row[f] ?? ""}"`).join(",")
            ),
        ].join("\n");

        res.header("Content-Type", "text/csv");
        return res.attachment("districts.csv").send(csv);
    }

    res.status(400).json({ error: "Invalid format" });
};

exports.getById = async (req, res) => {
    const [[row]] = await DistrictModel.findById(req.params.id);
    res.json(row);
};

exports.update = async (req, res) => {
    try {
        await DistrictModel.update(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    await DistrictModel.remove(req.params.id);
    res.json({ success: true });
};