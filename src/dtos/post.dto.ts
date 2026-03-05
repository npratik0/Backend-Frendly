export interface CreatePostDto {
  caption: string;
  imageUrl: string;
}

export interface AddCommentDto {
  text: string;
}

export interface PostResponseDto {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    profilePicture: string;
  };
  caption: string;
  imageUrl: string;
  likes: string[];
  likesCount: number;
  comments: {
    _id: string;
    user: {
      _id: string;
      username: string;
      profilePicture: string;
    };
    text: string;
    createdAt: Date;
  }[];
  commentsCount: number;
  isLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
}