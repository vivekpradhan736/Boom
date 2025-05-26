export enum QUERY_KEYS {
    // AUTH KEYS
    CREATE_USER_ACCOUNT = "createUserAccount",
  
    // USER KEYS
    GET_CURRENT_USER = "getCurrentUser",
    GET_USERS = "getUsers",
    GET_USER_BY_ID = "getUserById",
  
    // POST KEYS
    GET_POSTS = "getPosts",
    GET_INFINITE_POSTS = "getInfinitePosts",
    GET_RECENT_POSTS = "getRecentPosts",
    GET_POST_BY_ID = "getPostById",
    GET_USER_POSTS = "getUserPosts",
    GET_FILE_PREVIEW = "getFilePreview",
  
    //  SEARCH KEYS
    SEARCH_USERS = "getSearchUsers",
    SEARCH_POSTS = "getSearchPosts",

    // FOLLOW KEYS
    GET_FOLLOWERS = "getFollowers",
    GET_FOLLOWING = "getFollowing",
    GET_CURRENT_USER_WITH_FOLLOWING = "getCurrentUserWithFollowing",
    GET_FOLLOWING_BY_USER_ID = "getFollowingByUserId",

    // COMMENT KEYS
    CREATE_COMMENT = "createComment",
    GET_POST_COMMENT = "getPostComment",
    GET_POST_COMMENT_BY_ID = "getPostCommentById",
    
    // CHAT KEYS
    GET_CHAT = "getChat",
    GET_ALL_MESSAGES = "getAllMessages",
    CREATE_MESSAGE = "createMessage",
  }