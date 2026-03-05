import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";
import { uploadProfile } from "../middlewares/cloudinary.middleware";


let authController = new AuthController();
const router = Router();

router.post("/register",authController.register);
router.post("/login",authController.login);


router.get("/whoami", authorizedMiddleware, authController.getProfile);

// router.put(
//     "/update-profile",
//     authorizedMiddleware,
//     uploads.single("image"), // "image" - field name from frontend/client
//     authController.updateProfile
// );

router.post("/request-password-reset", authController.sendResetPasswordEmail);
router.post("/reset-password/:token", authController.resetPassword);


// Search users
router.get("/search", authenticateToken, authController.searchUsers);

// Save/Unsave posts
router.get("/saved-posts", authenticateToken, authController.getSavedPosts);
router.post("/posts/:postId/save", authenticateToken, authController.savePost);
router.post("/posts/:postId/unsave", authenticateToken, authController.unsavePost);

// Get user profile
router.get("/:userId", authenticateToken, authController.getUserProfile);

// Follow/Unfollow
router.post("/:userId/follow",authenticateToken, authController.followUser);
router.post("/:userId/unfollow", authenticateToken, authController.unfollowUser);



// Update profile
router.put("/profile", authenticateToken,authController.updateProfile);

// Update profile picture
router.put(
  "/profile-picture",
  uploadProfile.single("image"),
  authController.updateProfilePicture
);

// Change password
router.put("/change-password", authenticateToken,authController.changePassword);

export default router;