// import { PostRepository } from "../repositories/post.repository";
// import { CreatePostDto, PostResponseDto } from "../dtos/post.dto";
// import { NotFoundError, BadRequestError } from "../errors/custom-errors";

// export class PostService {
//   private postRepository: PostRepository;

//   constructor() {
//     this.postRepository = new PostRepository();
//   }

//   async createPost(
//     userId: string,
//     createPostDto: CreatePostDto
//   ): Promise<PostResponseDto> {
//     const { caption, imageUrl } = createPostDto;

//     if (!imageUrl) {
//       throw new BadRequestError("Image is required");
//     }

//     const post = await this.postRepository.create(userId, caption, imageUrl);
//     const populatedPost = await this.postRepository.findById(post._id.toString());

//     if (!populatedPost) {
//       throw new NotFoundError("Post not found after creation");
//     }

//     return this.formatPost(populatedPost, userId);
//   }

//   async getFeed(userId: string, page: number = 1): Promise<PostResponseDto[]> {
//     const posts = await this.postRepository.findAll(page, 10);
//     return posts.map((post) => this.formatPost(post, userId));
//   }

//   async getUserPosts(userId: string, currentUserId: string): Promise<PostResponseDto[]> {
//     const posts = await this.postRepository.findByUserId(userId);
//     return posts.map((post) => this.formatPost(post, currentUserId));
//   }

//   async likePost(postId: string, userId: string): Promise<PostResponseDto> {
//     const post = await this.postRepository.findById(postId);

//     if (!post) {
//       throw new NotFoundError("Post not found");
//     }

//     const isLiked = post.likes.some((like) => like.toString() === userId);

//     const updatedPost = isLiked
//       ? await this.postRepository.removeLike(postId, userId)
//       : await this.postRepository.addLike(postId, userId);

//     if (!updatedPost) {
//       throw new NotFoundError("Post not found");
//     }

//     return this.formatPost(updatedPost, userId);
//   }

//   async addComment(
//     postId: string,
//     userId: string,
//     text: string
//   ): Promise<PostResponseDto> {
//     if (!text || text.trim().length === 0) {
//       throw new BadRequestError("Comment text is required");
//     }

//     const post = await this.postRepository.addComment(postId, userId, text);

//     if (!post) {
//       throw new NotFoundError("Post not found");
//     }

//     return this.formatPost(post, userId);
//   }

//   async deletePost(postId: string, userId: string): Promise<void> {
//     const post = await this.postRepository.findById(postId);

//     if (!post) {
//       throw new NotFoundError("Post not found");
//     }

//     if (post.user._id.toString() !== userId) {
//       throw new BadRequestError("You can only delete your own posts");
//     }

//     await this.postRepository.deletePost(postId);
//   }

//   private formatPost(post: any, currentUserId: string): PostResponseDto {
//     const isLiked = post.likes.some(
//       (like: any) => like.toString() === currentUserId
//     );

//     return {
//       _id: post._id.toString(),
//       user: {
//         _id: post.user._id.toString(),
//         username: post.user.username,
//         fullName: post.user.fullName || post.user.username,
//         profilePicture: post.user.profilePicture || "",
//       },
//       caption: post.caption || "",
//       imageUrl: post.imageUrl,
//       likes: post.likes.map((like: any) => like.toString()),
//       likesCount: post.likes.length,
//       comments: post.comments.map((comment: any) => ({
//         _id: comment._id.toString(),
//         user: {
//           _id: comment.user._id.toString(),
//           username: comment.user.username,
//           profilePicture: comment.user.profilePicture || "",
//         },
//         text: comment.text,
//         createdAt: comment.createdAt,
//       })),
//       commentsCount: post.comments.length,
//       isLiked,
//       createdAt: post.createdAt,
//       updatedAt: post.updatedAt,
//     };
//   }
// }


import { PostRepository } from "../repositories/post.repository";
import { CreatePostDto, PostResponseDto } from "../dtos/post.dto";
import { NotFoundError, BadRequestError } from "../errors/custom-errors";
import cloudinary from "../config/cloudinary.config";

export class PostService {
  private postRepository: PostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  async createPost(
    userId: string,
    createPostDto: CreatePostDto
  ): Promise<PostResponseDto> {
    const { caption, imageUrl } = createPostDto;

    if (!imageUrl) {
      throw new BadRequestError("Image is required");
    }

    const post = await this.postRepository.create(userId, caption, imageUrl);
    const populatedPost = await this.postRepository.findById(post._id.toString());

    if (!populatedPost) {
      throw new NotFoundError("Post not found after creation");
    }

    return this.formatPost(populatedPost, userId);
  }

  async getFeed(userId: string, page: number = 1): Promise<PostResponseDto[]> {
    const posts = await this.postRepository.findAll(page, 10);
    return posts.map((post) => this.formatPost(post, userId));
  }

  async getUserPosts(userId: string, currentUserId: string): Promise<PostResponseDto[]> {
    const posts = await this.postRepository.findByUserId(userId);
    return posts.map((post) => this.formatPost(post, currentUserId));
  }

  async likePost(postId: string, userId: string): Promise<PostResponseDto> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const isLiked = post.likes.some((like) => like.toString() === userId);

    const updatedPost = isLiked
      ? await this.postRepository.removeLike(postId, userId)
      : await this.postRepository.addLike(postId, userId);

    if (!updatedPost) {
      throw new NotFoundError("Post not found");
    }

    return this.formatPost(updatedPost, userId);
  }

  async addComment(
    postId: string,
    userId: string,
    text: string
  ): Promise<PostResponseDto> {
    if (!text || text.trim().length === 0) {
      throw new BadRequestError("Comment text is required");
    }

    const post = await this.postRepository.addComment(postId, userId, text);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    return this.formatPost(post, userId);
  }

  async deleteComment(
    postId: string,
    commentId: string,
    userId: string
  ): Promise<PostResponseDto> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const comment = post.comments.find((c: any) => c._id.toString() === commentId);

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    if (comment.user._id.toString() !== userId && post.user._id.toString() !== userId) {
      throw new BadRequestError("You can only delete your own comments or comments on your posts");
    }

    const updatedPost = await this.postRepository.deleteComment(postId, commentId);

    if (!updatedPost) {
      throw new NotFoundError("Post not found");
    }

    return this.formatPost(updatedPost, userId);
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    if (post.user._id.toString() !== userId) {
      throw new BadRequestError("You can only delete your own posts");
    }

    // Delete image from Cloudinary
    try {
      const publicId = this.extractPublicId(post.imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
    }

    await this.postRepository.deletePost(postId);
  }

  private extractPublicId(url: string): string | null {
    try {
      const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
      return matches ? matches[1] : null;
    } catch (error) {
      return null;
    }
  }

  private formatPost(post: any, currentUserId: string): PostResponseDto {
    const isLiked = post.likes.some(
      (like: any) => like.toString() === currentUserId
    );

    return {
      _id: post._id.toString(),
      user: {
        _id: post.user._id.toString(),
        username: post.user.username,
        fullName: post.user.fullName || post.user.username,
        profilePicture: post.user.profilePicture || "",
      },
      caption: post.caption || "",
      imageUrl: post.imageUrl,
      likes: post.likes.map((like: any) => like.toString()),
      likesCount: post.likes.length,
      comments: post.comments.map((comment: any) => ({
        _id: comment._id.toString(),
        user: {
          _id: comment.user._id.toString(),
          username: comment.user.username,
          profilePicture: comment.user.profilePicture || "",
        },
        text: comment.text,
        createdAt: comment.createdAt,
      })),
      commentsCount: post.comments.length,
      isLiked,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  //additional
  async getSavedPostsByIds(postIds: string[], currentUserId: string): Promise<PostResponseDto[]> {
  const posts = await Promise.all(
    postIds.map(id => this.postRepository.findById(id))
  );
  
  const validPosts = posts.filter(post => post !== null);
  return validPosts.map(post => this.formatPost(post!, currentUserId));
}
}