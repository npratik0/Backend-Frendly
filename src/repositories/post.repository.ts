import { PostModel, IPost } from "../models/post.model";
import mongoose from "mongoose";

export class PostRepository {
  async create(userId: string, caption: string, imageUrl: string): Promise<IPost> {
    const post = await PostModel.create({
      user: userId,
      caption,
      imageUrl,
      likes: [],
      comments: [],
    });
    return post;
  }

  async findById(postId: string): Promise<IPost | null> {
    return await PostModel.findById(postId)
      .populate("user", "username fullName profilePicture")
      .populate("comments.user", "username profilePicture");
  }

  async findAll(page: number = 1, limit: number = 10): Promise<IPost[]> {
    const skip = (page - 1) * limit;
    return await PostModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username fullName profilePicture")
      .populate("comments.user", "username profilePicture");
  }

  async findByUserId(userId: string): Promise<IPost[]> {
    return await PostModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "username fullName profilePicture")
      .populate("comments.user", "username profilePicture");
  }

  async addLike(postId: string, userId: string): Promise<IPost | null> {
    return await PostModel.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    )
      .populate("user", "username fullName profilePicture")
      .populate("comments.user", "username profilePicture");
  }

  async removeLike(postId: string, userId: string): Promise<IPost | null> {
    return await PostModel.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    )
      .populate("user", "username fullName profilePicture")
      .populate("comments.user", "username profilePicture");
  }

  async addComment(
    postId: string,
    userId: string,
    text: string
  ): Promise<IPost | null> {
    return await PostModel.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            _id: new mongoose.Types.ObjectId(),
            user: userId,
            text,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    )
      .populate("user", "username fullName profilePicture")
      .populate("comments.user", "username profilePicture");
  }

  async deleteComment(postId: string, commentId: string): Promise<IPost | null> {
    return await PostModel.findByIdAndUpdate(
      postId,
      {
        $pull: {
          comments: { _id: commentId },
        },
      },
      { new: true }
    )
      .populate("user", "username fullName profilePicture")
      .populate("comments.user", "username profilePicture");
  }

  async deletePost(postId: string): Promise<boolean> {
    const result = await PostModel.deleteOne({ _id: postId });
    return result.deletedCount > 0;
  }
}