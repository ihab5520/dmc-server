const router = require("express").Router();
const authRouter = require("./auth.routes");
const userRoutes = require("./users.routes");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

// You put the next routes here 👇

router.use("/auth", authRouter);
router.use("/users", isAuthenticated, userRoutes);


module.exports = router;
