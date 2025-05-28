import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { AxiosError } from "axios";

import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import {
  createUserAccount,
  signInAccount,
  getCurrentUser,
  signOutAccount,
  getUsers,
  createPost,
  getPostById,
  updatePost,
  getUserPosts,
  deletePost,
  likePost,
  getUserById,
  updateUser,
  getRecentPosts,
  getInfinitePosts,
  searchPosts,
  savePost,
  deleteSavedPost,
  followUser,
  unfollowUser,
  getCurrentUserWithFollowing,
  getFollowingByUserId,
  createComment,
  getPostCommentById,
  getSearchUsers,
  createChat,
  getAllMessages,
  createMessage,
  getCurrentUserWithFollowers,
  uploadFile,
  getSavedPosts,
  uploadVideo,
  getRecentVideos,
  likeVideo,
  saveVideo,
  deleteSavedVideo,
  getSavedVideos,
  purchaseVideo,
  checkVideoPurchase,
} from "@/lib/mongodb/api";
import { INewChat, INewComment, INewMessage, INewPost, IUser, INewUser, INewVideo, IUpdatePost, IUpdateUser } from "@/types";

interface LikeVideoParams {
  videoId: string;
  likesArray: string[];
}

interface SaveVideoParams {
  userId: string;
  videoId: string;
}

type VideoResponse = {
  _id: string;
  title: string;
  description: string;
  creator: Pick<IUser, "id" | "name" | "username">;
  videoType: "Short-Form" | "Long-Form";
  videoFile: File[];
  videoUrl?: string;
  videoThumbnail: File[];
  price?: number;
  createdAt: string;
  updatedAt: string;
};

interface UploadVideoError {
  message: string;
}

export const useUploadFile = () => {
  return useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      console.log("File uploaded successfully:", data);
    },
    onError: (error) => {
      console.error("File upload failed:", error?.message);
    },
  });
};

export const useGetFollowingByUserId = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FOLLOWING_BY_USER_ID, userId],
    queryFn: () => getFollowingByUserId(userId),
    enabled: !!userId,
  });
};

// ============================== GET CURRENT USER WITH FOLLOWING
export const useGetCurrentUserWithFollowing = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER_WITH_FOLLOWING],
    queryFn: getCurrentUserWithFollowing,
  });
};

// ============================== GET CURRENT USER WITH FOLLOWING
export const useGetCurrentUserWithFollower = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER_WITH_FOLLOWING],
    queryFn: getCurrentUserWithFollowers,
  });
};

// ============================================================
// FOLLOW QUERIES
// ============================================================

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, currentUserId }: { userId: string, currentUserId: string }) => followUser(userId,currentUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING],
      });
    },
  });
};

// ============================================================
// UNFOLLOW QUERY
// ============================================================

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING],
      });
    },
  });
};

// ============================================================
// AUTH QUERIES
// ============================================================

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
  });
};

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

// ============================================================
// POST QUERIES
// ============================================================

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getInfinitePosts,
    getNextPageParam: (lastPage) => {
      // If there's no data, there are no more pages.
      if (lastPage && lastPage.documents.length === 0) {
        return null;
      }

      // Use the $id of the last document as the cursor.
      const lastId = lastPage?.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
  });
};

export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });
};

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useGetPostById = (postId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useGetCommentById = (postId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_COMMENT_BY_ID, postId],
    queryFn: () => getPostCommentById(postId),
    enabled: !!postId,
  });

}

// ============================================================
// VIDEOS
// ============================================================

export const useUploadVideo = () => {
  return useMutation<INewVideo, AxiosError<UploadVideoError>, FormData>({
    mutationFn: uploadVideo,
    onSuccess: (data) => {
      console.log("Video uploaded successfully:", data);
    },
  });
};

export const useGetRecentVideos = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_VIDEOS],
    queryFn: getRecentVideos,
  });
};

export const useLikeVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ videoId, likesArray }: LikeVideoParams) =>
      likeVideo(videoId, likesArray), // Call with params
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_VIDEOS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_SAVED_VIDEOS],
      });
    },
  });
};

export const useSaveVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, videoId }: SaveVideoParams) =>
      saveVideo(userId, videoId), // Call with params
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_SAVED_VIDEOS],
      });
    },
  });
};

export const useDeleteSavedVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSavedVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_SAVED_VIDEOS],
      });
    },
  });
};

export const useGetSavedVideos = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_SAVED_VIDEOS, userId],
    queryFn: () => getSavedVideos(userId),
    enabled: !!userId,
  });
};

// New purchase hooks
export const usePurchaseVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ videoId, userId }: { videoId: string; userId: string }) => purchaseVideo(videoId, userId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CHECK_PURCHASE, variables.videoId],
      });
    },
  });
};


export const useCheckVideoPurchase = (userId: string, videoId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CHECK_PURCHASE, userId, videoId],
    queryFn: () => checkVideoPurchase(userId, videoId),
    enabled: !!userId && !!videoId,
  });
};



export const useGetUserPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      savePost(userId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useGetSavedPosts = (userId: string) => {
  return useQuery({
    queryKey: ["savedPosts", userId],
    queryFn: () => getSavedPosts(userId),
    enabled: !!userId
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

// ============================================================
// COMMENT QUERIES
// ============================================================

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment: INewComment) =>
      createComment(comment),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_COMMENT],
      });
    },
  });

}

// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers(limit),
  });
};

export const useGetSearchUsers = (searchTerm: string, currentUserId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_USERS, searchTerm, currentUserId],
    queryFn: () => getSearchUsers(searchTerm, currentUserId),
    enabled: Boolean(searchTerm && currentUserId),
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
    },
  });
};

// ============================================================
// CHAT QUERIES
// ============================================================

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chat: INewChat) => createChat(chat),
    onSuccess: () => {
      queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.GET_CHAT],
      });
    },
  });
}

export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: INewMessage) => createMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.CREATE_MESSAGE],
      });
    },
  });
}

export const useGetAllMessages = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ALL_MESSAGES],
    queryFn: getAllMessages,
  });
};