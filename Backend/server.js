const express = require("express");
const cluster = require("cluster");
const os = require("os");
const helmet = require("helmet"); // security headers like CSP, XSS, etc.
const morgan = require("morgan"); // logging every incomeing api request to the console
// const limiter = require("./src/middlewares/rateLimiter");
const corsConfig = require("./src/middlewares/corsConfig");
const userRoutes = require("./src/routes/UserRoutes");
const levelRoutes = require("./src/routes/LevelRoutes");
const examschedule = require("./src/routes/ExamScheduleRoutes");
const examScheduleRoutes = require("./src/routes/examSchedule.routes");
const setRoutes = require("./src/routes/SetRoutes");
const resultRoutes = require("./src/routes/ResultRoutes");
const adminsetting = require("./src/routes/AdminSettingRoutes");
const summary = require("./src/routes/summaryroute");
const Exam_registartion = require("./src/routes/Exam_registartion");
const errorHandler = require("./src/utils/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");
const theme = require("./src/routes/ThemeRoutes");
const ExamResultRoutes = require("./src/routes/ExamResultRoutes");
const State = require("./src/routes/stateRoutes");
const District = require("./src/routes/districtRoutes");
const Institute = require("./src/routes/InstituteRoutes");
const cookieParser = require("cookie-parser");
const RegistartionRoute = require("./src/routes/Individualregistration");
const questionpaperroute = require("./src/routes/Questionpaper");

const app = express();
const PORT = 4001;

if (cluster.isMaster) {
  // 🌟 Master process (manages workers)
  // const numCPUs = os.cpus().length;
  const numCPUs = Math.min(2, os.cpus().length);

  console.log(`🟢 Master ${process.pid} is running`);
  console.log(`⚡ Forking ${numCPUs} workers...`);

  // Fork workers equal to CPU cores
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart worker if it crashes
  cluster.on("exit", (worker, code, signal) => {
    console.error(`❌ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // ✅ Global middlewares
  app.use(corsConfig);
  // app.options("*", corsConfig);           // CORS policy
  app.use(helmet()); // Security headers

  // app.use(limiter);              // Rate limiting
  app.use(express.json()); // Parse JSON
  app.use(morgan("combined")); // Request logging
  app.use(cookieParser());

  // ✅ Routes
  app.use("/users", userRoutes);
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // new Question paper route
  app.use("/questions", questionpaperroute);

  app.use("/levels", levelRoutes);
  app.use("/sets", setRoutes);
  app.use("/exam-schedule", examschedule);
  app.use("/exam-schedules", examScheduleRoutes);
  app.use("/results", resultRoutes);
  app.use("/exam-results", ExamResultRoutes);
  app.use("/admin-settings", adminsetting);
  app.use("/summary", summary);
  app.use("/theme", theme);
  app.use("/exam-registration", Exam_registartion);
  app.use("/states", State);
  app.use("/districts", District);
  app.use("/institute", Institute);
  app.use("/individual-registration", RegistartionRoute);

  // ✅ Error Handling
  app.use(errorHandler);

  // ✅ Start Server (same file)
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT} `);
    console.log(`📘 Swagger → http://localhost:${PORT}/swagger`);
  });
}
