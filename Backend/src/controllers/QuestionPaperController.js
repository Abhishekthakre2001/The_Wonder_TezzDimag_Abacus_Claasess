const QuestionPaperService = require("../services/QuestionPaper");

// Import
exports.importQuestions = async (req, res) => {
    try {
        req.body.created_by = req.user.id;

        const result = await QuestionPaperService.importQuestions(req.body);

        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all papers
exports.getQuestionPapers = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || "";

        const data = await QuestionPaperService.getQuestionPapers(
            req.user.id,
            page,
            limit,
            search
        );

        res.json({
            success: true,
            ...data
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


// Get filtered active question papers
exports.getFilteredQuestionPapers = async (req, res) => {
    try {
        const {
            question_paper_type,
            level_id,
            set_id,
            paper_type
        } = req.query;

        const data = await QuestionPaperService.getFilteredQuestionPapers({
            question_paper_type,
            level_id,
            set_id,
            paper_type
        });

        res.json({
            success: true,
            records: data
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Get questions by paper
exports.getQuestionsByPaper = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || "";

        const data = await QuestionPaperService.getQuestionsByPaper(
            req.params.id,
            req.user.id,
            page,
            limit,
            search
        );

        res.json({
            success: true,
            ...data
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// Update paper
exports.updateQuestionPaper = async (req, res) => {

    console.log("req received update q")
    try {
        await QuestionPaperService.updateQuestionPaper(
            req.params.id,
            req.body,
            req.user.id
        );

        res.json({ success: true, message: "Question Paper Updated" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete paper
exports.deleteQuestionPaper = async (req, res) => {
    try {
        await QuestionPaperService.deleteQuestionPaper(
            req.params.id,
            req.user.id
        );

        res.json({ success: true, message: "Question Paper Deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
    try {
        await QuestionPaperService.deleteQuestion(
            req.params.questionId,
            req.user.id
        );

        res.json({ success: true, message: "Question Deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update question
exports.updateQuestion = async (req, res) => {
    try {
        await QuestionPaperService.updateQuestion(
            req.params.questionId,
            req.body,
            req.user.id
        );

        res.json({ success: true, message: "Question Updated" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// Export
exports.exportQuestionPapers = async (req, res) => {
    try {
        const search = req.query.search || "";

        await QuestionPaperService.exportQuestionPapers(
            req.user.id,
            search,
            res
        );

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.exportQuestionPaper = async (req, res) => {
    try {

        const search = req.query.search || "";

        await QuestionPaperService.exportQuestionPaper(
            req.params.id,
            req.user.id,
            search,
            res
        );

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};