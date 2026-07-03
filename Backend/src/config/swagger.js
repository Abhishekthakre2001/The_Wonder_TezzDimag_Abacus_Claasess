const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

module.exports = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Abacus API",
      version: "1.0.0"
    }
  },
  apis: [
    path.join(__dirname, "../docs/examSchedule.swagger.yaml"),
    path.join(__dirname, "../docs/index.swagger.yaml"),
    path.join(__dirname, "../docs/users.swagger.yaml"),
    path.join(__dirname, "../docs/questions.swagger.yaml"),
    path.join(__dirname, "../docs/sets.swagger.yaml"),
    path.join(__dirname, "../docs/levels.swagger.yaml"),
    path.join(__dirname, "../docs/exam-schedule.swagger.yaml"),
    path.join(__dirname, "../docs/result.swagger.yaml"),
    path.join(__dirname, "../docs/admin-setting.swagger.yaml"),
    path.join(__dirname, "../docs/state.swagger.yaml"),
    path.join(__dirname, "../docs/district.swagger.yaml"),
    path.join(__dirname, "../docs/institute.swagger.yaml"),
    path.join(__dirname, "../docs/examSchedule.swagger.yaml"),
  ]
});
