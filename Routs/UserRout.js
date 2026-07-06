const router = require("express").Router();

const {
  registerUser,
  userLogin,
  updateUser,
  getAllUsers,
  getProfile
} = require("../Controller/UserController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/role");

// Public
router.post("/register", registerUser);
router.post("/login", userLogin);

// Logged-in Admin
router.get("/profile", protect, getProfile);

// Super Admin Only
router.get(
  "/users",
  protect,
  authorizeRoles("superAdmin"),
  getAllUsers
);

router.put(
  "/update/:id",
  protect,
  authorizeRoles("superAdmin"),
  updateUser
);

module.exports = router;