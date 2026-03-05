import { Request, Response } from "express";
import { PostController } from "../../../controllers/post.controller";
import { PostService } from "../../../services/post.service";
import { UserService } from "../../../services/user.service";
import mongoose from "mongoose";

jest.mock("../../../services/post.service");
jest.mock("../../../services/user.service");


describe("PostController", () => {
  let postController: PostController;
  let mockPostService: jest.Mocked<PostService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserId: string;

  beforeEach(() => {
    postController = new PostController();
    mockPostService = (postController as any).postService;
    mockUserId = new mongoose.Types.ObjectId().toString();

    mockRequest = {
      user: {
        _id: mockUserId,
        email: "test@example.com",
        username: "testuser",
        role: "user",
      },
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe("createPost", () => {
    it("should create a post successfully", async () => {
      const mockFile = {
        path: "https://res.cloudinary.com/demo/image.jpg",
      } as Express.Multer.File & { path: string };

      mockRequest.body = { caption: "Test caption" };
      mockRequest.file = mockFile;

      const mockPost = {
        _id: new mongoose.Types.ObjectId().toString(),
        user: {
          _id: mockUserId,
          username: "testuser",
          fullName: "Test User",
          profilePicture: "",
        },
        caption: "Test caption",
        imageUrl: mockFile.path,
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        isLiked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPostService.createPost.mockResolvedValue(mockPost);

      await postController.createPost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPostService.createPost).toHaveBeenCalledWith(mockUserId, {
        caption: "Test caption",
        imageUrl: mockFile.path,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPost,
        message: "Post created successfully",
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      mockRequest.user = undefined;

      await postController.createPost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized",
      });
    });

    it("should return 400 if no file is uploaded", async () => {
      mockRequest.file = undefined;
      mockRequest.body = { caption: "Test caption" };

      await postController.createPost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Image is required",
      });
    });

    it("should handle empty caption", async () => {
      const mockFile = {
        path: "https://res.cloudinary.com/demo/image.jpg",
      } as Express.Multer.File & { path: string };

      mockRequest.body = {};
      mockRequest.file = mockFile;

      const mockPost = {
        _id: new mongoose.Types.ObjectId().toString(),
        user: {
          _id: mockUserId,
          username: "testuser",
          fullName: "Test User",
          profilePicture: "",
        },
        caption: "",
        imageUrl: mockFile.path,
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        isLiked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPostService.createPost.mockResolvedValue(mockPost);

      await postController.createPost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPostService.createPost).toHaveBeenCalledWith(mockUserId, {
        caption: "",
        imageUrl: mockFile.path,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it("should handle service errors", async () => {
      const mockFile = {
        path: "https://res.cloudinary.com/demo/image.jpg",
      } as Express.Multer.File & { path: string };

      mockRequest.body = { caption: "Test caption" };
      mockRequest.file = mockFile;

      const error = new Error("Service error");
      (error as any).statusCode = 500;
      mockPostService.createPost.mockRejectedValue(error);

      await postController.createPost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Service error",
      });
    });
  });

  describe("getFeed", () => {
    it("should get feed with default pagination", async () => {
      const mockPosts = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          user: {
            _id: mockUserId,
            username: "testuser",
            fullName: "Test User",
            profilePicture: "",
          },
          caption: "Test caption",
          imageUrl: "https://example.com/image.jpg",
          likes: [],
          likesCount: 0,
          comments: [],
          commentsCount: 0,
          isLiked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPostService.getFeed.mockResolvedValue(mockPosts);

      await postController.getFeed(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPostService.getFeed).toHaveBeenCalledWith(mockUserId, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosts,
      });
    });

    it("should get feed with custom page", async () => {
      mockRequest.query = { page: "3" };
      mockPostService.getFeed.mockResolvedValue([]);

      await postController.getFeed(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPostService.getFeed).toHaveBeenCalledWith(mockUserId, 3);
    });

    it("should handle service errors", async () => {
      const error = new Error("Service error");
      (error as any).statusCode = 500;
      mockPostService.getFeed.mockRejectedValue(error);

      await postController.getFeed(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Service error",
      });
    });
  });

  describe("getUserPosts", () => {
    it("should get user posts", async () => {
      const targetUserId = new mongoose.Types.ObjectId().toString();
      mockRequest.params = { userId: targetUserId };

      const mockPosts = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          user: {
            _id: targetUserId,
            username: "targetuser",
            fullName: "Target User",
            profilePicture: "",
          },
          caption: "User post",
          imageUrl: "https://example.com/image.jpg",
          likes: [],
          likesCount: 0,
          comments: [],
          commentsCount: 0,
          isLiked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPostService.getUserPosts.mockResolvedValue(mockPosts);

      await postController.getUserPosts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPostService.getUserPosts).toHaveBeenCalledWith(
        targetUserId,
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosts,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { userId: mockUserId };
      const error = new Error("Service error");
      (error as any).statusCode = 404;
      mockPostService.getUserPosts.mockRejectedValue(error);

      await postController.getUserPosts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Service error",
      });
    });
  });

  describe("likePost", () => {
    it("should like a post", async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      mockRequest.params = { postId };

      const mockPost = {
        _id: postId,
        user: {
          _id: mockUserId,
          username: "testuser",
          fullName: "Test User",
          profilePicture: "",
        },
        caption: "Test caption",
        imageUrl: "https://example.com/image.jpg",
        likes: [mockUserId],
        likesCount: 1,
        comments: [],
        commentsCount: 0,
        isLiked: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPostService.likePost.mockResolvedValue(mockPost);

      await postController.likePost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPostService.likePost).toHaveBeenCalledWith(postId, mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPost,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { postId: "invalidId" };
      const error = new Error("Post not found");
      (error as any).statusCode = 404;
      mockPostService.likePost.mockRejectedValue(error);

      await postController.likePost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Post not found",
      });
    });
  });

  describe("addComment", () => {
    it("should add a comment to a post", async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      mockRequest.params = { postId };
      mockRequest.body = { text: "Great post!" };

      const mockPost = {
        _id: postId,
        user: {
          _id: mockUserId,
          username: "testuser",
          fullName: "Test User",
          profilePicture: "",
        },
        caption: "Test caption",
        imageUrl: "https://example.com/image.jpg",
        likes: [],
        likesCount: 0,
        comments: [
          {
            _id: new mongoose.Types.ObjectId().toString(),
            user: {
              _id: mockUserId,
              username: "testuser",
              profilePicture: "",
            },
            text: "Great post!",
            createdAt: new Date(),
          },
        ],
        commentsCount: 1,
        isLiked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPostService.addComment.mockResolvedValue(mockPost);

      await postController.addComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPostService.addComment).toHaveBeenCalledWith(
        postId,
        mockUserId,
        "Great post!"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPost,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { postId: "invalidId" };
      mockRequest.body = { text: "Great post!" };
      const error = new Error("Post not found");
      (error as any).statusCode = 404;
      mockPostService.addComment.mockRejectedValue(error);

      await postController.addComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Post not found",
      });
    });
  });

  describe("deleteComment", () => {
    it("should delete a comment from a post", async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const commentId = new mongoose.Types.ObjectId().toString();
      mockRequest.params = { postId, commentId };

      const mockPost = {
        _id: postId,
        user: {
          _id: mockUserId,
          username: "testuser",
          fullName: "Test User",
          profilePicture: "",
        },
        caption: "Test caption",
        imageUrl: "https://example.com/image.jpg",
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        isLiked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPostService.deleteComment.mockResolvedValue(mockPost);

      await postController.deleteComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPostService.deleteComment).toHaveBeenCalledWith(
        postId,
        commentId,
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPost,
        message: "Comment deleted successfully",
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = {
        postId: "invalidPostId",
        commentId: "invalidCommentId",
      };
      const error = new Error("Comment not found");
      (error as any).statusCode = 404;
      mockPostService.deleteComment.mockRejectedValue(error);

      await postController.deleteComment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Comment not found",
      });
    });
  });

  describe("deletePost", () => {
    it("should delete a post", async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      mockRequest.params = { postId };

      mockPostService.deletePost.mockResolvedValue(undefined);

      await postController.deletePost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPostService.deletePost).toHaveBeenCalledWith(postId, mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Post deleted successfully",
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { postId: "invalidId" };
      const error = new Error("Post not found");
      (error as any).statusCode = 404;
      mockPostService.deletePost.mockRejectedValue(error);

      await postController.deletePost(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Post not found",
      });
    });
  });

  describe("getSavedPosts", () => {
    it("should get saved posts", async () => {
      const mockUserService = new UserService() as jest.Mocked<UserService>;
      const postId1 = new mongoose.Types.ObjectId().toString();
      const postId2 = new mongoose.Types.ObjectId().toString();

      const mockSavedPostIds = [postId1, postId2];
      const mockPosts = [
        {
          _id: postId1,
          user: {
            _id: mockUserId,
            username: "testuser",
            fullName: "Test User",
            profilePicture: "",
          },
          caption: "Saved post 1",
          imageUrl: "https://example.com/image1.jpg",
          likes: [],
          likesCount: 0,
          comments: [],
          commentsCount: 0,
          isLiked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: postId2,
          user: {
            _id: mockUserId,
            username: "testuser",
            fullName: "Test User",
            profilePicture: "",
          },
          caption: "Saved post 2",
          imageUrl: "https://example.com/image2.jpg",
          likes: [],
          likesCount: 0,
          comments: [],
          commentsCount: 0,
          isLiked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUserService.getSavedPosts = jest
        .fn()
        .mockResolvedValue(mockSavedPostIds);
      mockPostService.getSavedPostsByIds.mockResolvedValue(mockPosts);

      // Mock UserService constructor
      (UserService as jest.Mock).mockImplementation(() => mockUserService);

      await postController.getSavedPosts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUserService.getSavedPosts).toHaveBeenCalledWith(mockUserId);
      expect(mockPostService.getSavedPostsByIds).toHaveBeenCalledWith(
        mockSavedPostIds,
        mockUserId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosts,
      });
    });

    it("should handle service errors", async () => {
      const mockUserService = new UserService() as jest.Mocked<UserService>;
      mockUserService.getSavedPosts = jest.fn().mockRejectedValue(
        new Error("Service error")
      );
      (UserService as jest.Mock).mockImplementation(() => mockUserService);

      await postController.getSavedPosts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Service error",
      });
    });
  });
});