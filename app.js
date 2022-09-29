
require("dotenv/config");
// ℹ️ Connects to the database
require("./db");
const { isAuthenticated } = require("./middleware/jwt.middleware");
// User http requests (express is node js framework)
const express = require("express");
const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here
// Contrary to the views version, all routes are controlled from the routes/index.js
const allRoutes = require("./routes/auth.routes");
app.use("/api", allRoutes);


require("./error")(app);
module.exports = app;
