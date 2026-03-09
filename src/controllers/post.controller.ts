import { Request, Response } from "express";
import { PostService } from "../services/post.service";
import { UserService } from "../services/user.service";


export class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user._id;

    const { caption } = req.body;
    const file = req.file as Express.Multer.File & { path: string };

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const post = await this.postService.createPost(userId, {
      caption: caption || "",
      imageUrl: file.path,
    });

    res.status(201).json({
      success: true,
      data: post,
      message: "Post created successfully",
    });

  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

  

  getFeed = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const page = parseInt(req.query.page as string) || 1;
      const posts = await this.postService.getFeed(userId, page);

      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  getUserPosts = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const currentUserId = req.user?._id;
      const posts = await this.postService.getUserPosts(userId, currentUserId);

      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  likePost = async (req: Request, res: Response) => {
    try {
      const postId = req.params.postId;
      const userId = req.user?._id;
      const post = await this.postService.likePost(postId, userId);

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  addComment = async (req: Request, res: Response) => {
    try {
      const postId = req.params.postId;
      const userId = req.user?._id;
      const { text } = req.body;
      const post = await this.postService.addComment(postId, userId, text);

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  deleteComment = async (req: Request, res: Response) => {
    try {
      const { postId, commentId } = req.params;
      const userId = req.user?._id;
      const post = await this.postService.deleteComment(postId, commentId, userId);

      res.status(200).json({
        success: true,
        data: post,
        message: "Comment deleted successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  deletePost = async (req: Request, res: Response) => {
    try {
      const postId = req.params.postId;
      const userId = req.user?._id;
      await this.postService.deletePost(postId, userId);

      res.status(200).json({
        success: true,
        message: "Post deleted successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };




  // additional
  getSavedPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const userService = new UserService();
    const savedPostIds = await userService.getSavedPosts(userId);
    const posts = await this.postService.getSavedPostsByIds(savedPostIds, userId);

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
  
}
