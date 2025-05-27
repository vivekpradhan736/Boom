export type INavLink = {
    imgURL: string;
    route: string;
    label: string;
  };
  
  export type IUpdateUser = {
    userId: string;
    name: string;
    bio: string;
    imageId: string;
    imageUrl: URL | string;
    file: File[];
  };

  export type INewComment = {
    userId: string;
    postId: string;
    text: string;
  }
  
  export type INewPost = {
    userId: string;
    caption: string;
    file: File[];
    location?: string;
    tags?: string;
  };
  
  export type IUpdatePost = {
    postId: string;
    caption: string;
    imageId: string;
    imageUrl: URL;
    file: File[];
    location?: string;
    tags?: string;
  };

  export type INewVideo = {
    userId: string;
    title: string;
    description: string;
    videoType: string | "Short-Form" | "Long-Form";
    videoFile?: File[];
    videoUrl?: string;
    videoThumbnail?: File[];
    price?: number;
  };

  export type IUpdateVideo = {
    videoId: string;
    title: string;
    description: string;
    videoType: string | "Short-Form" | "Long-Form";
    videoFileId?: string;
    videoFileUrl?: URL;
    videoFile?: File[];
    videoUrl?: string;
    videoThumbnailId?: string;
    videoThumbnailUrl?: URL;
    videoThumbnail?: File[];
    price?: number;
  };

  export interface IVideoPurchase {
  _id: string;
  videoId: string;
  userId: string;
  purchaseDate: string;
  price: number;
  status: "pending" | "completed" | "failed";
  transactionId: string;
}
  
  export type IUser = {
    id: string;
    name: string;
    username: string;
    email: string;
    imageUrl: string;
    bio: string;
    followers: string[];
    balance: number;
  };
  
  export type INewUser = {
    name: string;
    email: string;
    username: string;
    password: string;
  };

  export type INewChat = {
    chatName: string;
    isGroupChat: boolean;
    users: string[];
    currentUserId: string;
    usersId: string[];
  }

  export type INewMessage = {
    content: string;
    sender: string;
    chat: string;
    timestamp: string;
  }