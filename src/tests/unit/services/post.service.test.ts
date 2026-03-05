import { PostService } from "../../../services/post.service";
import { PostRepository } from "../../../repositories/post.repository";
import { NotFoundError, BadRequestError } from "../../../errors/custom-errors";
import cloudinary from "../../../config/cloudinary.config";
import mongoose from "mongoose";

jest.mock("../../../repositories/post.repository");
jest.mock("../../../config/cloudinary.config");

describe("PostService", () => {
  let postService: PostService;
  let mockPostRepository: jest.Mocked<PostRepository>;
  let mockUserId: string;
  let mockPostId: string;

  beforeEach(() => {
    postService = new PostService();
    mockPostRepository = (postService as any).postRepository;
    mockUserId = new mongoose.Types.ObjectId().toString();
    mockPostId = new mongoose.Types.ObjectId().toString();
    jest.clearAllMocks();
  });

  describe("createPost", () => {
    it("should create a post successfully", async () => {
      const createPostDto = {
        caption: "Test caption",
        imageUrl: "https://example.com/image.jpg",
      };

      const mockCreatedPost = {
        _id: new mongoose.Types.ObjectId(),
        user: mockUserId,
        caption: "Test caption",
        imageUrl: "https://example.com/image.jpg",
        likes: [],
        comments: [],
      };

      const mockPopulatedPost = {
        ...mockCreatedPost,
        user: {
          _id: new mongoose.Types.ObjectId(mockUserId),
          username: "testuser",
          fullName: "Test User",
          profilePicture: "https://example.com/profile.jpg",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPostRepository.create.mockResolvedValue(mockCreatedPost as any);
      mockPostRepository.findById.mockResolvedValue(mockPopulatedPost as any);

      const result = await postService.createPost(mockUserId, createPostDto);

      expect(mockPostRepository.create).toHaveBeenCalledWith(
        mockUserId,
        "Test caption",
        "https://example.com/image.jpg"
      );
      expect(mockPostRepository.findById).toHaveBeenCalledWith(
        mockCreatedPost._id.toString()
      );
      expect(result).toMatchObject({
        user: expect.objectContaining({
          username: "testuser",
        }),
        caption: "Test caption",
        imageUrl: "https://example.com/image.jpg",
      });
    });

    it("should throw BadRequestError if imageUrl is missing", async () => {
      const createPostDto = {
        caption: "Test caption",
        imageUrl: "",
      };

      await expect(
        postService.createPost(mockUserId, createPostDto)
      ).rejects.toThrow(BadRequestError);
      await expect(
        postService.createPost(mockUserId, createPostDto)
      ).rejects.toThrow("Image is required");
    });

    it("should throw NotFoundError if post not found after creation", async () => {
      const createPostDto = {
        caption: "Test caption",
        imageUrl: "https://example.com/image.jpg",
      };

      const mockCreatedPost = {
        _id: new mongoose.Types.ObjectId(),
        user: mockUserId,
        caption: "Test caption",
        imageUrl: "https://example.com/image.jpg",
      };

      mockPostRepository.create.mockResolvedValue(mockCreatedPost as any);
      mockPostRepository.findById.mockResolvedValue(null);

      await expect(
        postService.createPost(mockUserId, createPostDto)
      ).rejects.toThrow(NotFoundError);
      await expect(
        postService.createPost(mockUserId, createPostDto)
      ).rejects.toThrow("Post not found after creation");
    });
  });

  describe("getFeed", () => {
    it("should get feed with default pagination", async () => {
      const mockPosts = [
        {
          _id: new mongoose.Types.ObjectId(),
          user: {
            _id: new mongoose.Types.ObjectId(),
            username: "testuser",
            fullName: "Test User",
            profilePicture: "",
          },
          caption: "Test caption",
          imageUrl: "https://example.com/image.jpg",
          likes: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPostRepository.findAll.mockResolvedValue(mockPosts as any);

      const result = await postService.getFeed(mockUserId);

      expect(mockPostRepository.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        user: expect.objectContaining({
          username: "testuser",
        }),
      });
    });

    it("should get feed with custom page", async () => {
      mockPostRepository.findAll.mockResolvedValue([]);

      await postService.getFeed(mockUserId, 3);

      expect(mockPostRepository.findAll).toHaveBeenCalledWith(3, 10);
    });

    it("should format posts with isLiked flag", async () => {
      const mockPosts = [
        {
          _id: new mongoose.Types.ObjectId(),
          user: {
            _id: new mongoose.Types.ObjectId(),
            username: "testuser",
            fullName: "Test User",
            profilePicture: "",
          },
          caption: "Test caption",
          imageUrl: "https://example.com/image.jpg",
          likes: [new mongoose.Types.ObjectId(mockUserId)],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPostRepository.findAll.mockResolvedValue(mockPosts as any);

      const result = await postService.getFeed(mockUserId);

      expect(result[0].isLiked).toBe(true);
      expect(result[0].likesCount).toBe(1);
    });
  });

  describe("getUserPosts", () => {
    it("should get user posts", async () => {
      const targetUserId = new mongoose.Types.ObjectId().toString();
      const mockPosts = [
        {
          _id: new mongoose.Types.ObjectId(),
          user: {
            _id: new mongoose.Types.ObjectId(targetUserId),
            username: "targetuser",
            fullName: "Target User",
            profilePicture: "",
          },
          caption: "User post",
          imageUrl: "https://example.com/image.jpg",
          likes: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPostRepository.findByUserId.mockResolvedValue(mockPosts as any);

      const result = await postService.getUserPosts(targetUserId, mockUserId);

      expect(mockPostRepository.findByUserId).toHaveBeenCalledWith(targetUserId);
      expect(result).toHaveLength(1);
    });
  });

  describe("likePost", () => {
    it("should add like to post if not already liked", async () => {
      const mockPost = {
        _id: new mongoose.Types.ObjectId(mockPostId),
        user: {
          _id: new mongoose.Types.ObjectId(),
          username: "testuser",
          fullName: "Test User",
          profilePicture: "",
        },
        caption: "Test caption",
        imageUrl: "https://example.com/image.jpg",
        likes: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedPost = {
        ...mockPost,
        likes: [new mongoose.Types.ObjectId(mockUserId)],
      };

      mockPostRepository.findById.mockResolvedValue(mockPost as any);
      mockPostRepository.addLike.mockResolvedValue(mockUpdatedPost as any);

      const result = await postService.likePost(mockPostId, mockUserId);

      expect(mockPostRepository.addLike).toHaveBeenCalledWith(mockPostId, mockUserId);
      expect(result.isLiked).toBe(true);
      expect(result.likesCount).toBe(1);
    });

    it("should remove like from post if already liked", async () => {
      const mockPost = {
        _id: new mongoose.Types.ObjectId(mockPostId),
        user: {
          _id: new mongoose.Types.ObjectId(),
          username: "testuser",
          fullName: "Test User",
          profilePicture: "",
        },
        caption: "Test caption",
        imageUrl: "https://example.com/image.jpg",
        likes: [new mongoose.Types.ObjectId(mockUserId)],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedPost = {
        ...mockPost,
        likes: [],
      };

      mockPostRepository.findById.mockResolvedValue(mockPost as any);
      mockPostRepository.removeLike.mockResolvedValue(mockUpdatedPost as any);

      const result = await postService.likePost(mockPostId, mockUserId);

      expect(mockPostRepository.removeLike).toHaveBeenCalledWith(mockPostId, mockUserId);
      expect(result.isLiked).toBe(false);
      expect(result.likesCount).toBe(0);
    });

    it("should throw NotFoundError if post not found", async () => {
      mockPostRepository.findById.mockResolvedValue(null);

      await expect(postService.likePost(mockPostId, mockUserId)).rejects.toThrow(
        NotFoundError
      );
      await expect(postService.likePost(mockPostId, mockUserId)).rejects.toThrow(
        "Post not found"
      );
    });

    it("should throw NotFoundError if updated post not found", async () => {
      const mockPost = {
        _id: new mongoose.Types.ObjectId(mockPostId),
        likes: [],
      };

      mockPostRepository.findById.mockResolvedValue(mockPost as any);
      mockPostRepository.addLike.mockResolvedValue(null);

      await expect(postService.likePost(mockPostId, mockUserId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("addComment", () => {
    it("should add comment to post", async () => {
      const commentText = "Test comment";
      const mockPost = {
        _id: new mongoose.Types.ObjectId(mockPostId),
        user: {
          _id: new mongoose.Types.ObjectId(),
          username: "testuser",
          fullName: "Test User",
          profilePicture: "",
        },
        caption: "Test caption",
        imageUrl: "https://example.com/image.jpg",
        likes: [],
        comments: [
          {
            _id: new mongoose.Types.ObjectId(),
            user: {
              _id: new mongoose.Types.ObjectId(mockUserId),
              username: "commenter",
              profilePicture: "",
            },
            text: commentText,
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPostRepository.addComment.mockResolvedValue(mockPost as any);

      const result = await postService.addComment(mockPostId, mockUserId, commentText);

      expect(mockPostRepository.addComment).toHaveBeenCalledWith(
        mockPostId,
        mockUserId,
        commentText
      );
      expect(result.comments).toHaveLength(1);
      expect(result.commentsCount).toBe(1);
    });

    it("should throw BadRequestError if comment text is empty", async () => {
      await expect(
        postService.addComment(mockPostId, mockUserId, "")
      ).rejects.toThrow(BadRequestError);
      await expect(
        postService.addComment(mockPostId, mockUserId, "   ")
      ).rejects.toThrow("Comment text is required");
    });

    it("should throw NotFoundError if post not found", async () => {
      mockPostRepository.addComment.mockResolvedValue(null);

      await expect(
        postService.addComment(mockPostId, mockUserId, "Test comment")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteComment", () => {
    it("should delete comment by comment owner", async () => {
      const commentId = new mongoose.Types.ObjectId().toString();
      const mockPost = {
        _id: new mongoose.Types.ObjectId(mockPostId),
        user: {
          _id: new mongoose.Types.ObjectId(),
          username: "postowner",
        },
        comments: [
          {
            _id: new mongoose.Types.ObjectId(commentId),
            user: {
              _id: new mongoose.Types.ObjectId(mockUserId),
              username: "commenter",
            },
            text: "Test comment",
            createdAt: new Date(),
          },
        ],
        likes: [],
        caption: "",
        imageUrl: "https://example.com/image.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedPost = {
        ...mockPost,
        comments: [],
      };

      mockPostRepository.findById.mockResolvedValue(mockPost as any);
      mockPostRepository.deleteComment.mockResolvedValue(mockUpdatedPost as any);

      const result = await postService.deleteComment(mockPostId, commentId, mockUserId);

      expect(mockPostRepository.deleteComment).toHaveBeenCalledWith(
        mockPostId,
        commentId
      );
      expect(result.comments).toHaveLength(0);
    });

    it("should delete comment by post owner", async () => {
      const commentId = new mongoose.Types.ObjectId().toString();
      const otherUserId = new mongoose.Types.ObjectId().toString();
      const mockPost = {
        _id: new mongoose.Types.ObjectId(mockPostId),
        user: {
          _id: new mongoose.Types.ObjectId(mockUserId),
          username: "postowner",
        },
        comments: [
          {
            _id: new mongoose.Types.ObjectId(commentId),
            user: {
              _id: new mongoose.Types.ObjectId(otherUserId),
              username: "commenter",
            },
            text: "Test comment",
            createdAt: new Date(),
          },
        ],
        likes: [],
        caption: "",
        imageUrl: "https://example.com/image.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedPost = {
        ...mockPost,
        comments: [],
      };

      mockPostRepository.findById.mockResolvedValue(mockPost as any);
      mockPostRepository.deleteComment.mockResolvedValue(mockUpdatedPost as any);

      const result = await postService.deleteComment(mockPostId, commentId, mockUserId);

      expect(result.comments).toHaveLength(0);
    });

    it("should throw NotFoundError if post not found", async () => {
      const commentId = new mongoose.Types.ObjectId().toString();
      mockPostRepository.findById.mockResolvedValue(null);

      await expect(
        postService.deleteComment(mockPostId, commentId, mockUserId)
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if comment not found", async () => {
      const commentId = new mongoose.Types.ObjectId().toString();
      const mockPost = {
        _id: new mongoose.Types.ObjectId(mockPostId),
        user: { _id: new mongoose.Types.ObjectId() },
        comments: [],
      };

      mockPostRepository.findById.mockResolvedValue(mockPost as any);

      await expect(
        postService.deleteComment(mockPostId, commentId, mockUserId)
      ).rejects.toThrow(NotFoundError);
      await expect(
        postService.deleteComment(mockPostId, commentId, mockUserId)
      ).rejects.toThrow("Comment not found");
    });

    it("should throw BadRequestError if user is not comment owner or post owner", async () => {
      const commentId = new mongoose.Types.ObjectId().toString();
      const otherUserId = new mongoose.Types.ObjectId().toString();
      const postOwnerId = new mongoose.Types.ObjectId().toString();

      const mockPost = {
        _id: new mongoose.Types.ObjectId(mockPostId),
        user: {
          _id: new mongoose.Types.ObjectId(postOwnerId),
          username: "postowner",
        },
        comments: [
          {
            _id: new mongoose.Types.ObjectId(commentId),
            user: {
              _id: new mongoose.Types.ObjectId(otherUserId),
              username: "commenter",
            },
            text: "Test comment",
            createdAt: new Date(),
          },
        ],
      };

      mockPostRepository.findById.mockResolvedValue(mockPost as any);

      await expect(
        postService.deleteComment(mockPostId, commentId, mockUserId)
      ).rejects.toThrow(BadRequestError);
      await expect(
        postService.deleteComment(mockPostId, commentId, mockUserId)
      ).rejects.toThrow("You can only delete your own comments or comments on your posts");
    });
  });

  describe("deletePost", () => {
    it("should delete post successfully", async () => {
      const mockPost = {
        _id: new mongoose.Types.ObjectId(mockPostId),
        user: {
          _id: new mongoose.Types.ObjectId(mockUserId),
          username: "testuser",
        },
        caption: "Test caption",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg",
      };

      mockPostRepository.findById.mockResolvedValue(mockPost as any);
      mockPostRepository.deletePost.mockResolvedValue(true);
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: "ok" });

      await postService.deletePost(mockPostId, mockUserId);

      expect(mockPostRepository.findById).toHaveBeenCalledWith(mockPostId);
    //   expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
    //     "demo/image/upload/v1234567890/sample"
    //   );
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
  "sample"
);
      expect(mockPostRepository.deletePost).toHaveBeenCalledWith(mockPostId);
    });

    it("should throw NotFoundError if post not found", async () => {
      mockPostRepository.findById.mockResolvedValue(null);

      await expect(postService.deletePost(mockPostId, mockUserId)).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw BadRequestError if user is not post owner", async () => {
      const otherUserId = new mongoose.Types.ObjectId().toString();
      const mockPost = {
        _id: new mongoose.Types.ObjectId(mockPostId),
        user: {
          _id: new mongoose.Types.ObjectId(otherUserId),
          username: "otheruser",
        },
        imageUrl: "https://example.com/image.jpg",
      };

      mockPostRepository.findById.mockResolvedValue(mockPost as any);

      await expect(postService.deletePost(mockPostId, mockUserId)).rejects.toThrow(
        BadRequestError
      );
      await expect(postService.deletePost(mockPostId, mockUserId)).rejects.toThrow(
        "You can only delete your own posts"
      );
    });

    it("should continue deletion even if cloudinary deletion fails", async () => {
      const mockPost = {
        _id: new mongoose.Types.ObjectId(mockPostId),
        user: {
          _id: new mongoose.Types.ObjectId(mockUserId),
          username: "testuser",
        },
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg",
      };

      mockPostRepository.findById.mockResolvedValue(mockPost as any);
      mockPostRepository.deletePost.mockResolvedValue(true);
      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(
        new Error("Cloudinary error")
      );

      await expect(postService.deletePost(mockPostId, mockUserId)).resolves.not.toThrow();
      expect(mockPostRepository.deletePost).toHaveBeenCalledWith(mockPostId);
    });
  });

  describe("getSavedPostsByIds", () => {
    it("should get saved posts by ids", async () => {
      const postId1 = new mongoose.Types.ObjectId().toString();
      const postId2 = new mongoose.Types.ObjectId().toString();

      const mockPosts = [
        {
          _id: new mongoose.Types.ObjectId(postId1),
          user: {
            _id: new mongoose.Types.ObjectId(),
            username: "user1",
            fullName: "User One",
            profilePicture: "",
          },
          caption: "Post 1",
          imageUrl: "https://example.com/image1.jpg",
          likes: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(postId2),
          user: {
            _id: new mongoose.Types.ObjectId(),
            username: "user2",
            fullName: "User Two",
            profilePicture: "",
          },
          caption: "Post 2",
          imageUrl: "https://example.com/image2.jpg",
          likes: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPostRepository.findById
        .mockResolvedValueOnce(mockPosts[0] as any)
        .mockResolvedValueOnce(mockPosts[1] as any);

      const result = await postService.getSavedPostsByIds(
        [postId1, postId2],
        mockUserId
      );

      expect(result).toHaveLength(2);
      expect(mockPostRepository.findById).toHaveBeenCalledTimes(2);
    });

    it("should filter out null posts", async () => {
      const postId1 = new mongoose.Types.ObjectId().toString();
      const postId2 = new mongoose.Types.ObjectId().toString();

      const mockPost = {
        _id: new mongoose.Types.ObjectId(postId1),
        user: {
          _id: new mongoose.Types.ObjectId(),
          username: "user1",
          fullName: "User One",
          profilePicture: "",
        },
        caption: "Post 1",
        imageUrl: "https://example.com/image1.jpg",
        likes: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPostRepository.findById
        .mockResolvedValueOnce(mockPost as any)
        .mockResolvedValueOnce(null);

      const result = await postService.getSavedPostsByIds(
        [postId1, postId2],
        mockUserId
      );

      expect(result).toHaveLength(1);
    });
  });
});