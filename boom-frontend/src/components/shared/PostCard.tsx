import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { useState } from "react";

type PostCardProps = {
  post: Models.Document;
};

const PostCard = ({ post }: PostCardProps) => {
  const [showAll, setShowAll] = useState(false);
  const [tagShowAll, setTagShowAll] = useState(false);
  const { user } = useUserContext();
  console.log('post',post)

  const tagMaxLength = tagShowAll ? post.tags : post.tags.slice(0, 3);

  if (!post.creator) return;

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.creator._id}`}>
            <img
              src={
                post.creator?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-12 lg:h-12 rounded-full"
            />
          </Link>

          <Link to={`/profile/${post.creator._id}`}>
            <div className="flex flex-col">
              <p className="base-medium lg:body-bold text-light-1">
                {post.creator.name}
              </p>
              <div className="flex-center gap-2 text-light-3">
                <p className="subtle-semibold lg:small-regular ">
                  {multiFormatDateString(post.createdAt)}
                </p>
                •
                <p className="subtle-semibold lg:small-regular">
                  {post.location}
                </p>
              </div>
            </div>
          </Link>
        </div>

        <Link
          to={`/update-post/${post._id}`}
          className={`${user.id !== post.creator._id && "hidden"}`}>
          <img
            src={"/assets/icons/edit.svg"}
            alt="edit"
            width={20}
            height={20}
          />
        </Link>
      </div>

      <div className="small-medium lg:base-medium py-5">
        <p className="line-clamp-1">{post.caption}</p>
      </div>

      <Link to={`/posts/${post._id}`}>
        <img
          src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="post image"
          className="post-card_img"
        />
      </Link>

      <PostStats post={post} userId={user.id} />

      <div className="">
        <div className="">
          <span className="text-white font-bold cursor-pointer hover:underline hover:text-[#fff5f5] " >{post.creator.name}</span>  <span className="text-[14px] text-[#ebeaea] " >{showAll ? 
          // post.caption
          (post?.caption?.split('\n').map((paragraph: string, index: number) => (
            <span key={index} className="block" >
              {paragraph}
            </span>
          )))
           : post.caption.slice(0, 50) }{post.caption.length < 50 ? "" : (showAll ? "" : "...")}</span>
          {post.caption.length > 50 ? <>
          {showAll ? (
            <ul className="flex flex-wrap gap-1 mt-2 ">
            {post.tags.map((tag: string, index: string) => (
              <li key={`${tag}${index}`} className="text-[#bfbbfa] small-regular mb-1 mr-1 cursor-pointer hover:underline ">
                #{tag}
              </li>
            ))}
          </ul>
          ) : ""}
          {post.caption.length > 50 && (
            <button onClick={() => setShowAll(!showAll)} className="text-[#9c9a9a] text-sm block " >
              {showAll ? 'show less' : 'show more'}
            </button>
          )}
          </> : <>
            <ul className={`flex flex-${tagShowAll ? "wrap" : ""} overflow-hidden gap-1 mt-2`}>
            {tagMaxLength.map((tag: string, index: string) => (
              <li key={`${tag}${index}`} className="text-[#bfbbfa] small-regular mb-1 mr-1 cursor-pointer hover:underline ">
                #{tag}
              </li>
            ))}
            {post.tags.length > 3 ? (tagShowAll ? "" : "...") : ""}
          </ul>
          {post.tags.length > 3 && (
            <button onClick={() => setTagShowAll(!tagShowAll)} className="text-[#9c9a9a] text-sm block " >
              {tagShowAll ? 'show less' : 'show more'}
            </button>
          )}
          </>
          }
        </div>
      </div>
    </div>
  );
};

export default PostCard;