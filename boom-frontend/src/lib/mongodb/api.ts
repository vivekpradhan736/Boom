import axios from "axios";
import { mongodbConfig } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser, INewComment, INewChat, INewMessage } from "@/types";

const api = axios.create({
  baseURL: mongodbConfig.apiUrl,
  withCredentials: true, // If you need cookies for authentication
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to get current user (assuming JWT or session-based auth)
export async function getCurrentUser() {
  try {
    const response = await api.get("/users/me");
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ============================== GET FOLLOWING BY USER ID
export async function getFollowingByUserId(userId: string) {
  try {
    const currentAccount = await getCurrentUser();
    const response = await api.get(`/following/byUser/${userId}`);
    const followingUsers = response.data.documents.filter(
      (followedUser: any) => followedUser.byUser._id === currentAccount?._id
    );
    return followingUsers;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// ============================== GET POST COMMENT BY ID
export async function getPostCommentById(postId?: string) {
  if (!postId) throw new Error("Post ID is required");
  try {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ============================== GET CURRENT USER WITH FOLLOWING
export async function getCurrentUserWithFollowing() {
  try {
    const currentAccount = await getCurrentUser();
    
    if (!currentAccount) throw new Error("No current user found");

    const response = await api.get(`/following/byCurrentUser/${currentAccount._id}`);
    console.log("response",response)
    return {
      following: response.data.documents.map((followedUser: any) => followedUser.toUsers),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ============================== GET CURRENT USER WITH FOLLOWERS
export async function getCurrentUserWithFollowers() {
  try {
    const currentAccount = await getCurrentUser();
    
    if (!currentAccount) throw new Error("No current user found");

    const response = await api.get(`/following/followerByCurrentUser/${currentAccount._id}`);
    console.log("response2",response)
    return {
      followers: response.data.documents.map((followerUser: any) => followerUser.byUser),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ============================== FOLLOW USER
export async function followUser(userId: string, currentUserId: string) {
  try {
    const response = await api.post("/following", {
      toUsers: userId,
      byUser: currentUserId,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ============================== UNFOLLOW USER
export async function unfollowUser(userId: string) {
  try {
    const following = await getFollowingByUserId(userId);
    if (following && following.length > 0) {
      await api.delete(`/following/${following[0]._id}`);
      return following;
    }
    console.log("No following user found.");
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  console.log("HiUser")
  try {
    // const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`;
    const response = await api.post("/users", {
      accountId: Math.random().toString(36).substring(2), // Replace with proper ID generation
      email: user.email,
      name: user.name,
      username: user.username,
      // imageUrl: avatarUrl,
    });
    await api.post("/auth/register", {
      email: user.email,
      password: user.password,
    });
    await signInAccount({ email: user.email, password: user.password });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== SAVE USER TO DB (Not needed for MongoDB, handled in createUserAccount)
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: string;
  username?: string;
}) {
  // This function is redundant since createUserAccount directly saves to MongoDB
  return user;
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const response = await api.post("/auth/login", user);
    const { token } = response.data;
    localStorage.setItem("token", token);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  return getCurrentUser(); // Reuses getCurrentUser for MongoDB
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    await api.post("/auth/logout");
    localStorage.removeItem("token");
    return { status: "Ok" };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================================================
// VIDEOS
// ============================================================

export async function uploadVideo(formData: FormData) {
  try {
    const response = await api.post("/videos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    const formData = new FormData();
    formData.append("file", post.file[0]);
    const uploadResponse = await api.post("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const { id: imageId, url: imageUrl } = uploadResponse.data;

    const tags = post.tags?.replace(/ /g, "").split(",") || [];
    const response = await api.post("/posts", {
      creator: post.userId,
      caption: post.caption,
      imageUrl,
      imageId,
      location: post.location,
      tags,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
  // For Cloudinary, the file URL is returned directly from upload
  return fileId; // Adjust if needed based on your backend response
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await api.delete(`/uploads/${fileId}`);
    return { status: "ok" };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const response = await api.get(`/posts/search/${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getInfinitePosts({ pageParam = 1 }: { pageParam: number }) {
  try {
    const response = await api.get(`/posts?page=${pageParam}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ============================== CREATE COMMENT
export async function createComment(comment: INewComment) {
  try {
    const response = await api.post("/comments", {
      users: comment.userId,
      posts: comment.postId,
      comment: comment.text,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw new Error("Post ID is required");
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;
  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      const uploadResponse = await uploadFile(post.file[0]);
      if (!uploadResponse) throw new Error("File upload failed");

      image = { imageUrl: uploadResponse.url, imageId: uploadResponse.id };
    }

    const tags = post.tags?.replace(/ /g, "").split(",") || [];
    const response = await api.put(`/posts/${post.postId}`, {
      caption: post.caption,
      imageUrl: image.imageUrl,
      imageId: image.imageId,
      location: post.location,
      tags,
    });

    if (!response.data && hasFileToUpdate) {
      await deleteFile(image.imageId);
      throw new Error("Post update failed");
    }

    if (hasFileToUpdate && post.imageId) {
      await deleteFile(post.imageId);
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) throw new Error("Post ID and Image ID are required");
  try {
    const response = await api.delete(`/posts/${postId}`);
    await deleteFile(imageId);
    return { status: "Ok" };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const response = await api.post(`/posts/${postId}/like`, { likes: likesArray });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const response = await api.post("/saves", {
      user: userId,
      post: postId,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET SAVE POST
export async function getSavedPosts(userId: string) {
  try {
    if (!userId) throw new Error("User ID is required");
    const response = await api.get(`/saves/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    await api.delete(`/saves/${savedRecordId}`);
    return { status: "Ok" };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) throw new Error("User ID is required");
  try {
    const response = await api.get(`/posts/user/${userId}`);
    console.log("response",response)
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ============================== GET RECENT POSTS
export async function getRecentPosts() {
  try {
    const response = await api.get("/posts/recent");
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  try {
    const response = await api.get(`/users${limit ? `?limit=${limit}` : ""}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ============================== GET SEARCH USERS
export async function getSearchUsers(searchTerm: string, currentUserId: string) {
  try {
    const response = await api.get(`/users/search/${encodeURIComponent(searchTerm)}?currentUserId=${currentUserId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      const uploadResponse = await uploadFile(user.file[0]);
      if (!uploadResponse) throw new Error("File upload failed");

      image = { imageUrl: uploadResponse.url, imageId: uploadResponse.id };
    }

    const response = await api.put(`/users/${user.userId}`, {
      name: user.name,
      bio: user.bio,
      imageUrl: image.imageUrl,
      imageId: image.imageId,
    });

    if (!response.data && hasFileToUpdate) {
      await deleteFile(image.imageId);
      throw new Error("User update failed");
    }

    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== CREATE CHAT
export async function createChat(chat: INewChat) {
  try {
    const usersArray = Array.isArray(chat.users)
      ? [chat.currentUserId, ...chat.users]
      : [chat.currentUserId, chat.users];

    const usersHash = usersArray.sort().join(",");
    const response = await api.post("/chats", {
      chatName: chat.chatName,
      users: usersArray,
      usersHash,
      isGroupChat: false,
      usersId: chat.usersId,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== CREATE MESSAGE
export async function createMessage(message: INewMessage) {
  try {
    const response = await api.post("/messages", {
      content: message.content,
      sender: message.sender,
      chat: message.chat,
      timestamp: message.timestamp,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== GET ALL MESSAGES
export async function getAllMessages() {
  try {
    const response = await api.get("/messages");
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}