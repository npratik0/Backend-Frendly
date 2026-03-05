// import { Router } from "express";
// import { PostController } from "../controllers/post.controller";
// // import { authenticateToken } from "../middlewares/auth.middleware";
// import { authenticateToken } from "../middlewares/auth.middleware";

// const router = Router();
// const postController = new PostController();

// // All routes require authentication
// router.use(authenticateToken);

// // Create post
// router.post("/", postController.createPost);

// // Get feed
// router.get("/feed", postController.getFeed);

// // Get user posts
// router.get("/user/:userId", postController.getUserPosts);

// // Like/Unlike post
// router.post("/:postId/like", postController.likePost);

// // Add comment
// router.post("/:postId/comment", postController.addComment);

// // Delete post
// router.delete("/:postId", postController.deletePost);

// export default router;



import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { uploadPost } from "../middlewares/cloudinary.middleware";

const router = Router();
const postController = new PostController();

router.use(authenticateToken);

// Create post with image upload
router.post("/", uploadPost.single("image"), postController.createPost);

// Get feed with pagination
router.get("/feed", postController.getFeed);

// Get user posts
router.get("/user/:userId", postController.getUserPosts);

// Like/Unlike post
router.post("/:postId/like", postController.likePost);

// Add comment
router.post("/:postId/comment", postController.addComment);

// Delete comment
router.delete("/:postId/comment/:commentId", postController.deleteComment);

// Delete post
router.delete("/:postId", postController.deletePost);

//  get saved posts
router.get("/saved", postController.getSavedPosts);

export default router;