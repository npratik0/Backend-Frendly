import request from "supertest";
import mongoose from "mongoose";
import app  from "../../app"; 
import { UserModel } from "../../models/user.model";
import { PostModel } from "../../models/post.model";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";


jest.mock("../../config/cloudinary.config", () => ({
  __esModule: true,
  default: {
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: "https://res.cloudinary.com/demo/test-image.jpg",
        public_id: "test-public-id",
      }),
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));

describe("Post Integration Tests", () => {
  let authToken: string;
  let userId: string;
  let testUser: any;
  let createdPostId: string;

  beforeEach(async () => {
    // Create a test user
    testUser = await UserModel.create({
      email: "test@example.com",
      password: "hashedPassword123",
      username: "testuser",
      fullName: "Test User",
      role: "user",
    });

    userId = testUser._id.toString();

    // Generate auth token
    authToken = jwt.sign(
      {
        id: userId,
        email: testUser.email,
        username: testUser.username,
        role: testUser.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  describe("POST /api/posts", () => {

    it("should return 401 if user is not authenticated", async () => {
      const response = await request(app)
        .post("/api/posts")
        .field("caption", "Test post")
        .attach("image", Buffer.from("fake-image-data"), "test.jpg");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 if no image is provided", async () => {
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .field("caption", "Test post caption");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Image is required");
    });
  });

  describe("GET /api/posts/feed", () => {
    beforeEach(async () => {
      
      const userObjectId = new mongoose.Types.ObjectId(userId);
      await PostModel.create([
        {
          user: userObjectId,
          caption: "Post 1",
          imageUrl: "https://example.com/image1.jpg",
        },
        {
          user: userObjectId,
          caption: "Post 2",
          imageUrl: "https://example.com/image2.jpg",
        },
        {
          user: userObjectId,
          caption: "Post 3",
          imageUrl: "https://example.com/image3.jpg",
        },
      ]);
    });

    it("should get feed with posts", async () => {
      const response = await request(app)
        .get("/api/posts/feed")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty("_id");
      expect(response.body.data[0]).toHaveProperty("user");
      expect(response.body.data[0]).toHaveProperty("caption");
      expect(response.body.data[0]).toHaveProperty("likesCount");
      expect(response.body.data[0]).toHaveProperty("commentsCount");
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/posts/feed?page=1")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/api/posts/feed");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/posts/user/:userId", () => {
    beforeEach(async () => {
      // Create posts for the test user
      const userObjectId = new mongoose.Types.ObjectId(userId);
      await PostModel.create([
        {
          user: userObjectId,
          caption: "User post 1",
          imageUrl: "https://example.com/image1.jpg",
        },
        {
          user: userObjectId,
          caption: "User post 2",
          imageUrl: "https://example.com/image2.jpg",
        },
      ]);
    });

    it("should get user posts", async () => {
      const response = await request(app)
        .get(`/api/posts/user/${userId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].user._id).toBe(userId);
    });

    it("should return empty array for user with no posts", async () => {
      const anotherUser = await UserModel.create({
        email: "another@example.com",
        password: "password123",
        username: "anotheruser",
        role: "user",
      });

      const response = await request(app)
        .get(`/api/posts/user/${anotherUser._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe("POST /api/posts/:postId/like", () => {
    let postId: string;

    beforeEach(async () => {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const post = await PostModel.create({
        user: userObjectId,
        caption: "Test post for liking",
        imageUrl: "https://example.com/image.jpg",
      });
      postId = post._id.toString();
    });

    it("should like a post", async () => {
      const response = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isLiked).toBe(true);
      expect(response.body.data.likesCount).toBe(1);
    });

    it("should unlike a post if already liked", async () => {
      // First like
      await request(app)
        .post(`/api/posts/${postId}/like`)
        .set("Authorization", `Bearer ${authToken}`);

      // Then unlike
      const response = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.isLiked).toBe(false);
      expect(response.body.data.likesCount).toBe(0);
    });

    it("should return 404 for non-existent post", async () => {
      const fakePostId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .post(`/api/posts/${fakePostId}/like`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/posts/:postId/comment", () => {
    let postId: string;

    beforeEach(async () => {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const post = await PostModel.create({
        user: userObjectId,
        caption: "Test post for commenting",
        imageUrl: "https://example.com/image.jpg",
      });
      postId = post._id.toString();
    });

    it("should add a comment to a post", async () => {
      const response = await request(app)
        .post(`/api/posts/${postId}/comment`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ text: "Great post!" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comments.length).toBe(1);
      expect(response.body.data.comments[0].text).toBe("Great post!");
      expect(response.body.data.commentsCount).toBe(1);
    });

    it("should return 400 for empty comment", async () => {
      const response = await request(app)
        .post(`/api/posts/${postId}/comment`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ text: "" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent post", async () => {
      const fakePostId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .post(`/api/posts/${fakePostId}/comment`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ text: "Great post!" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/posts/:postId/comment/:commentId", () => {
    let postId: string;
    let commentId: string;

    beforeEach(async () => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  const post = await PostModel.create({
    user: userObjectId,
    caption: "Test post",
    imageUrl: "https://example.com/image.jpg",
    comments: [{
      user: userObjectId,
      text: "Test comment",
      createdAt: new Date(),
    }]
  });
  
  postId = post._id.toString();
  commentId = post.comments[0]._id.toString();
});

    it("should delete own comment", async () => {
      const response = await request(app)
        .delete(`/api/posts/${postId}/comment/${commentId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comments.length).toBe(0);
      expect(response.body.message).toBe("Comment deleted successfully");
    });

    it("should allow post owner to delete any comment", async () => {
      const anotherUser = await UserModel.create({
        email: "another@example.com",
        password: "password123",
        username: "anotheruser",
        role: "user",
      });

      // Add comment from another user
      const post = await PostModel.findById(postId);
      post!.comments.push({
        user: anotherUser._id as any,
        text: "Another comment",
        createdAt: new Date(),
      } as any);
      await post!.save();

      // Get the newly added comment's _id
      const newCommentId = post!.comments[post!.comments.length - 1]._id.toString();

      const response = await request(app)
        .delete(`/api/posts/${postId}/comment/${newCommentId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 400 if user is not comment owner or post owner", async () => {
      const anotherUser = await UserModel.create({
        email: "another@example.com",
        password: "password123",
        username: "anotheruser",
        role: "user",
      });

      const anotherToken = jwt.sign(
        {
          id: anotherUser._id.toString(),
          email: anotherUser.email,
          username: anotherUser.username,
          role: anotherUser.role,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      const response = await request(app)
        .delete(`/api/posts/${postId}/comment/${commentId}`)
        .set("Authorization", `Bearer ${anotherToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/posts/:postId", () => {
    let postId: string;

    beforeEach(async () => {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const post = await PostModel.create({
        user: userObjectId,
        caption: "Test post to delete",
        imageUrl: "https://example.com/image.jpg",
      });
      postId = post._id.toString();
    });

    it("should delete own post", async () => {
      const response = await request(app)
        .delete(`/api/posts/${postId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Post deleted successfully");

      // Verify post is deleted
      const deletedPost = await PostModel.findById(postId);
      expect(deletedPost).toBeNull();
    });

    it("should return 400 if trying to delete another user's post", async () => {
      const anotherUser = await UserModel.create({
        email: "another@example.com",
        password: "password123",
        username: "anotheruser",
        role: "user",
      });

      const anotherPost = await PostModel.create({
        user: anotherUser._id,
        caption: "Another user's post",
        imageUrl: "https://example.com/image.jpg",
      });

      const response = await request(app)
        .delete(`/api/posts/${anotherPost._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent post", async () => {
      const fakePostId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .delete(`/api/posts/${fakePostId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/posts/saved", () => {
    beforeEach(async () => {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      // Create posts and save them
      const post1 = await PostModel.create({
        user: userObjectId,
        caption: "Saved post 1",
        imageUrl: "https://example.com/image1.jpg",
      });

      const post2 = await PostModel.create({
        user: userObjectId,
        caption: "Saved post 2",
        imageUrl: "https://example.com/image2.jpg",
      });

      // Add posts to user's saved posts
      await UserModel.findByIdAndUpdate(userId, {
        $push: { savedPosts: { $each: [post1._id, post2._id] } },
      });
    });

    it("should get saved posts", async () => {
      const response = await request(app)
        .get("/api/posts/saved")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it("should return empty array if no saved posts", async () => {
      await UserModel.findByIdAndUpdate(userId, {
        $set: { savedPosts: [] },
      });

      const response = await request(app)
        .get("/api/posts/saved")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });
  });
});