import { useParams, Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui";
import { Loader } from "@/components/shared";
import { GridPostList, PostStats } from "@/components/shared";

import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
  useGetCommentById,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import Comment from "@/components/shared/Comment";
import { useEffect, useMemo, useState } from "react";
import { Models } from "appwrite";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();

  const { data: post, isLoading: isPostLoading } = useGetPostById(id);
  console.log("post",post)
  const commentList = useMemo(() => {
    return post ? post?.comments?.map((comments: Models.Document) => comments) : [];
  }, [post]);
  const [commentName, setCommentName] = useState<string[]>(commentList);
  const { data: comment, refetch: refetchComment, isLoading: isPostCommentLoading } = useGetCommentById(id)
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator._id
  );
  console.log("userPosts",userPosts)
  const { mutate: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.documents.filter(
    (userPost: any) => userPost._id !== id
  );

  const handleDeletePost = () => {
    deletePost({ postId: id, imageId: post?.imageId });
    navigate(-1);
  };
  useEffect(() => {
    if (comment) {
      const commentNames = comment?.documents.map((doc: Models.Document) => doc);
      setCommentName(commentNames);
    } else {
      setCommentName(commentList);
    }
  }, [comment, commentList]);


  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {isPostLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <img
            src={post?.imageUrl}
            alt="creator"
            className="post_details-img"
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.creator._id}`}
                className="flex items-center gap-3">
                <img
                  src={
                    post?.creator.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  width={24}
                  height={24}
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(post?.createdAt)}
                    </p>
                    •
                    <p className="subtle-semibold lg:small-regular">
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center gap-4">
                <Link
                  to={`/update-post/${post?._id}`}
                  className={`${user.id !== post?.creator._id && "hidden"}`}>
                  <img
                    src={"/assets/icons/edit.svg"}
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ost_details-delete_btn ${user.id !== post?.creator._id && "hidden"
                    }`}>
                  <img
                    src={"/assets/icons/delete.svg"}
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="y-scroll overflow-y-scroll h-96">
              <div className="flex gap-3">
                <Link to={`/profile/${post?.creator._id}`}>
                  <img
                    src={
                      post?.creator.imageUrl ||
                      "/assets/icons/profile-placeholder.svg"
                    }
                    alt="creator"
                    className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                  />
                </Link>

                <div className="flex flex-col flex-1 py-1 w-full text-[14px] font-medium leading-[140%] lg:text-[14.5px] lg:font-normal">
                  <Link
                    to={`/profile/${post?.creator._id}`}>
                    <span className="text-[17px] font-semibold hover:text-[#b6b6b6] cursor-pointer inline hover:underline ">{post?.creator.name}</span>
                  </Link>
                  <span>
                    {post?.caption?.split('\n').map((paragraph: string, index: number) => (
                      <span key={index} className="block text-[#e0dbdb]" >
                        {paragraph}
                      </span>
                    ))}
                  </span>
                  <ul className="flex flex-wrap gap-1 mt-2">
                    {post?.tags.map((tag: string, index: string) => (
                      <li
                        key={`${tag}${index}`}
                        className="text-light-3 small-regular cursor-pointer hover:underline">
                        #{tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {isPostCommentLoading ? (<Loader />) :
                (commentName?.map((comments: any, index: number) => (
                  <div className="flex gap-3 pt-5" key={`${comments}${index}`}>
                    <Link to={`/profile/${comments?.users?._id}`}>
                      <img
                        src={
                          comments?.users?.imageUrl ||
                          "/assets/icons/profile-placeholder.svg"
                        }
                        alt="creator"
                        width={30}
                        height={30}
                        className="w-9 h-8 lg:w-14 lg:h-12 rounded-full"
                      />
                    </Link>
                    <div className="py-2 w-full">
                      <div className=" text-[14px] font-medium leading-[140%] lg:text-[14.5px] lg:font-normal">
                        <Link to={`/profile/${comments?.users?._id}`}>
                          <span className="text-[17px] font-semibold hover:text-[#b6b6b6] cursor-pointer inline hover:underline ">{comments?.users?.name}</span>
                        </Link>
                        <span className="pl-2">{comments?.comment}</span>
                      </div>
                      <p className="subtle-semibold font-medium text-[#848484] ">
                        {multiFormatDateString(comments?.createdAt)}
                      </p>
                    </div>
                  </div>

                ))
                )}
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="w-full">
              <PostStats post={post} userId={user.id} />
            </div>
            <hr className="border w-full border-dark-4/80" />
            <Comment post={post} user={user} refetchComment={refetchComment} />
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;