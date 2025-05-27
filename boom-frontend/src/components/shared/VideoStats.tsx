import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Models } from "appwrite";

import { checkIsLiked } from "@/lib/utils";
import {
  useDeleteSavedVideo,
  useGetCurrentUser,
  useGetSavedVideos,
  useLikeVideo,
  useSaveVideo,
} from "@/lib/react-query/queries";

type VideoStatsProps = {
  video: Models.Document;
  userId: string;
};

const VideoStats = ({ video, userId }: VideoStatsProps) => {
  const location = useLocation();
  const likesList = video?.likes.map((user: any) => user._id);

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likeVideo } = useLikeVideo();
  const { mutate: saveVideo } = useSaveVideo();
  const { mutate: deleteSaveVideo } = useDeleteSavedVideo();
  const { data: savedVideos, isLoading } = useGetSavedVideos(userId);

  const { data: currentUser } = useGetCurrentUser();

  const savedVideoRecord = savedVideos?.find(
    (record: Models.Document) => record.video._id === video._id
  );

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href,
        });
      } else {
        alert("Web Share API not supported in this browser.");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  useEffect(() => {
    setIsSaved(!!savedVideoRecord);
  }, [currentUser, savedVideos]);

  const handleLikeVideo = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();

    let likesArray = [...likes];

    if (likesArray.includes(userId)) {
      likesArray = likesArray.filter((id) => id !== userId);
    } else {
      likesArray.push(userId);
    }

    setLikes(likesArray);
    likeVideo({ videoId: video._id, likesArray });
  };

  const handleSaveVideo = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();

    if (savedVideoRecord) {
      setIsSaved(false);
      return deleteSaveVideo(savedVideoRecord._id);
    }

    saveVideo({ userId, videoId: video._id });
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
          src={`${
            checkIsLiked(likes, userId)
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }`}
          alt="like"
          width={20}
          height={20}
          onClick={handleLikeVideo}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
        <Link
          to={`/videos/${video._id}`}
          className={`${containerStyles2} ${containerStyles3}`}
        >
          <img
            src="/assets/icons/comment.png"
            alt="comment"
            width={22}
            height={22}
            className="cursor-pointer"
          />
        </Link>
        <img
          src="/assets/icons/send.png"
          alt="share"
          width={23}
          height={23}
          onClick={handleShare}
          className={`cursor-pointer rotate-12 ${containerStyles2} ${containerStyles3}`}
        />
      </div>

      <div className="flex gap-2">
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="save"
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={handleSaveVideo}
        />
      </div>
    </div>
  );
};

export default VideoStats;