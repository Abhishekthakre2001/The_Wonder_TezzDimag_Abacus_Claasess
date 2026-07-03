module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "ExamSchedule",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            exam_title: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            start_datetime: {
                type: DataTypes.DATE,
                allowNull: false,
            },

            end_datetime: {
                type: DataTypes.DATE,
                allowNull: false,
            },

            exam_status: {
                type: DataTypes.ENUM("Active", "Inactive"),
                defaultValue: "Active",
            },

            exam_category: {
                type: DataTypes.ENUM("Abacus", "Vedic"),
            },

            exam_type: {
                type: DataTypes.ENUM("Mock", "Main Exam"),
            },

            exam_level: {
                type: DataTypes.JSON,
            },

            exam_set: {
                type: DataTypes.JSON,
            },

            exam_state: {
                type: DataTypes.JSON,
            },

            exam_district: {
                type: DataTypes.JSON,
            },

            exam_institute: {
                type: DataTypes.JSON,
            },

            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: "exam_schedules",
            underscored: true,
            timestamps: true,
        }
    );
};