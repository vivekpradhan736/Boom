import { Models } from "appwrite";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { checkIsLiked } from "../../lib/utils";
import { useDeleteSavedPost, useGetCurrentUser, useGetSavedPosts, useLikePost, useSavePost } from "../../lib/react-query/queries";

type PostStatsProps = {
  post: Models.Document;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const location = useLocation();
  const likesList = post?.likes.map((user: Models.Document) => user?.id);

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();
  const { data: savedPost, isLoading, isError, error, refetch } = useGetSavedPosts(userId);

  const { data: currentUser } = useGetCurrentUser();

  const savedPostRecord = savedPost?.documents.find(
    (record: Models.Document) => record.post._id === post._id
  );

  const handleShare = async () => {
    try {
      if (navigator.share) {
        // Use Web Share API
        await navigator.share({
          title: 'Share Example',
          text: 'Check out this link!',
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that do not support Web Share API
        alert('Web Share API not supported in this browser.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser]);

  const handleLikePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    let likesArray = [...likes];

    if (likesArray.includes(userId)) {
      likesArray = likesArray.filter((Id) => Id !== userId);
    } else {
      likesArray.push(userId);
    }

    setLikes(likesArray);
    likePost({ postId: post._id, likesArray });
  };

  const handleSavePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (savedPostRecord) {
      setIsSaved(false);
      return deleteSavePost(savedPostRecord._id);
    }

    savePost({ userId: userId, postId: post._id });
    setIsSaved(true);
  };

  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";

  const containerStyles2 = location.pathname.startsWith("/explore")
    ? "hidden"
    : "";

  const containerStyles3 = location.pathname.startsWith("/profile")
    ? "hidden"
    : "";

  return (
    <div className={`flex justify-between items-center z-20 ${containerStyles}`}>
      <div className="flex gap-2 mr-5">
        <img
          src={`${checkIsLiked(likes, userId)
            ? "/assets/icons/liked.svg"
            : "/assets/icons/like.svg"
            }`}
          alt="like"
          width={20}
          height={20}
          onClick={(e) => handleLikePost(e)}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
        <Link to={`/posts/${post._id}`} className={`${containerStyles2} ${containerStyles3}`} >
          <img
            src={"/assets/icons/comment.png"}
            alt="like"
            width={22}
            height={22}
            className="cursor-pointer"
          />
        </Link>
        <img
          src={"/assets/icons/send.png"}
          alt="like"
          width={23}
          height={23}
          onClick={handleShare}
          className={`cursor-pointer rotate-12 ${containerStyles2} ${containerStyles3}`}
        />
      </div>

      <div className="flex gap-2">
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="share"
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={(e) => handleSavePost(e)}
        />
      </div>
    </div>
  );
};

export default PostStats;