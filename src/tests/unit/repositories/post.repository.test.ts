import { PostRepository } from "../../../repositories/post.repository";
import { PostModel } from "../../../models/post.model";
import mongoose from "mongoose";

jest.mock("../../../models/post.model");

describe("PostRepository", () => {
  let postRepository: PostRepository;
  let mockUserId: string;
  let mockPostId: string;

  beforeEach(() => {
    postRepository = new PostRepository();
    mockUserId = new mongoose.Types.ObjectId().toString();
    mockPostId = new mongoose.Types.ObjectId().toString();
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new post successfully", async () => {
      const mockPost = {
        _id: mockPostId,
        user: mockUserId,
        caption: "Test caption",
        imageUrl: "https://example.com/image.jpg",
        likes: [],
        comments: [],
      };

      (PostModel.create as jest.Mock).mockResolvedValue(mockPost);

      const result = await postRepository.create(
        mockUserId,
        "Test caption",
        "https://example.com/image.jpg"
      );

      expect(PostModel.create).toHaveBeenCalledWith({
        user: mockUserId,
        caption: "Test caption",
        imageUrl: "https://example.com/image.jpg",
        likes: [],
        comments: [],
      });
      expect(result).toEqual(mockPost);
    });

    it("should create a post with empty caption", async () => {
      const mockPost = {
        _id: mockPostId,
        user: mockUserId,
        caption: "",
        imageUrl: "https://example.com/image.jpg",
        likes: [],
        comments: [],
      };

      (PostModel.create as jest.Mock).mockResolvedValue(mockPost);

      const result = await postRepository.create(
        mockUserId,
        "",
        "https://example.com/image.jpg"
      );

      expect(result.caption).toBe("");
    });
  });

  describe("findById", () => {
    it("should find a post by id with populated fields", async () => {
      const mockPost = {
        _id: mockPostId,
        user: {
          _id: mockUserId,
          username: "testuser",
          fullName: "Test User",
          profilePicture: "https://example.com/profile.jpg",
        },
        caption: "Test caption",
        imageUrl: "https://example.com/image.jpg",
        likes: [],
        comments: [],
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };

      (PostModel.findById as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce(mockPost);

      const result = await postRepository.findById(mockPostId);

      expect(PostModel.findById).toHaveBeenCalledWith(mockPostId);
      expect(result).toEqual(mockPost);
    });

    it("should return null if post not found", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };

      (PostModel.findById as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce(null);

      const result = await postRepository.findById(mockPostId);

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should find all posts with pagination", async () => {
      const mockPosts = [
        {
          _id: mockPostId,
          user: { username: "testuser" },
          caption: "Test caption",
          imageUrl: "https://example.com/image.jpg",
        },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
      };

      (PostModel.find as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce(mockPosts);

      const result = await postRepository.findAll(1, 10);

      expect(PostModel.find).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockPosts);
    });

    it("should handle different page numbers correctly", async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
      };

      (PostModel.find as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce([]);

      await postRepository.findAll(3, 10);

      expect(mockQuery.skip).toHaveBeenCalledWith(20);
    });
  });

  describe("findByUserId", () => {
    it("should find all posts by user id", async () => {
      const mockPosts = [
        {
          _id: mockPostId,
          user: mockUserId,
          caption: "Test caption",
          imageUrl: "https://example.com/image.jpg",
        },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
      };

      (PostModel.find as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce(mockPosts);

      const result = await postRepository.findByUserId(mockUserId);

      expect(PostModel.find).toHaveBeenCalledWith({ user: mockUserId });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(mockPosts);
    });
  });

  describe("addLike", () => {
    it("should add a like to a post", async () => {
      const mockPost = {
        _id: mockPostId,
        likes: [mockUserId],
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };

      (PostModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce(mockPost);

      const result = await postRepository.addLike(mockPostId, mockUserId);

      expect(PostModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPostId,
        { $addToSet: { likes: mockUserId } },
        { new: true }
      );
      expect(result).toEqual(mockPost);
    });
  });

  describe("removeLike", () => {
    it("should remove a like from a post", async () => {
      const mockPost = {
        _id: mockPostId,
        likes: [],
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };

      (PostModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce(mockPost);

      const result = await postRepository.removeLike(mockPostId, mockUserId);

      expect(PostModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPostId,
        { $pull: { likes: mockUserId } },
        { new: true }
      );
      expect(result).toEqual(mockPost);
    });
  });

  describe("addComment", () => {
    it("should add a comment to a post", async () => {
      const mockPost = {
        _id: mockPostId,
        comments: [
          {
            _id: new mongoose.Types.ObjectId(),
            user: mockUserId,
            text: "Test comment",
            createdAt: new Date(),
          },
        ],
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };

      (PostModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce(mockPost);

      const result = await postRepository.addComment(
        mockPostId,
        mockUserId,
        "Test comment"
      );

      expect(PostModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPostId,
        expect.objectContaining({
          $push: expect.objectContaining({
            comments: expect.objectContaining({
              user: mockUserId,
              text: "Test comment",
            }),
          }),
        }),
        { new: true }
      );
      expect(result).toEqual(mockPost);
    });
  });

  describe("deleteComment", () => {
    it("should delete a comment from a post", async () => {
      const commentId = new mongoose.Types.ObjectId().toString();
      const mockPost = {
        _id: mockPostId,
        comments: [],
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };

      (PostModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce(mockPost);

      const result = await postRepository.deleteComment(mockPostId, commentId);

      expect(PostModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPostId,
        {
          $pull: {
            comments: { _id: commentId },
          },
        },
        { new: true }
      );
      expect(result).toEqual(mockPost);
    });
  });

  describe("deletePost", () => {
    it("should delete a post successfully", async () => {
      (PostModel.deleteOne as jest.Mock).mockResolvedValue({
        deletedCount: 1,
      });

      const result = await postRepository.deletePost(mockPostId);

      expect(PostModel.deleteOne).toHaveBeenCalledWith({ _id: mockPostId });
      expect(result).toBe(true);
    });

    it("should return false if post not found", async () => {
      (PostModel.deleteOne as jest.Mock).mockResolvedValue({
        deletedCount: 0,
      });

      const result = await postRepository.deletePost(mockPostId);

      expect(result).toBe(false);
    });
  });
});