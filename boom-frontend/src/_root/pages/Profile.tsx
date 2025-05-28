import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";

import { LikedPosts } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useGetCurrentUserWithFollowing, useGetCurrentUserWithFollower, useGetUserPosts } from "@/lib/react-query/queries";
import { GridPostList, Loader } from "@/components/shared";
import { useEffect, useState, useRef } from "react";
import FollowButton from "@/components/shared/FollowButton";

interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { pathname } = useLocation();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const { data: currentUser } = useGetUserById(id || "");
  const { data: myFollowingUser, isLoading: isUserLoading, refetch: refetchFollowing } = useGetCurrentUserWithFollowing();
  const { data: myFollowerUser, isLoading: isFollowerLoading } = useGetCurrentUserWithFollower();
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(currentUser?._id);
  console.log("userPosts",userPosts)

  //  ----->> This code are work for Showing the User Profile Picture <<-----

  // Event handler to hide the modal when clicking outside of it
  const handleOutsideClick = (event: MouseEvent) => {
    if (modalVisible && modalRef.current && event.target === modalRef.current) {
      hideModal();
    }
  };
  // Attach the event listener to the window when the component mounts
  useEffect(() => {
    window.addEventListener('click', handleOutsideClick);
    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [modalVisible]);

  // Function to show the modal
  const showModal = () => {
    setModalVisible(true);
  };

  // Function to hide the modal
  const hideModal = () => {
    setModalVisible(false);
  };

  const modalRef = useRef<HTMLDivElement>(null);

  console.log("currentUser",currentUser)

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );


  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 lg:gap-10 2xl:gap-20 gap-5">
          <img
            src={
              currentUser?.imageUrl || "/assets/icons/profile-placeholder.svg"
            }
            alt="profile"
            onClick={showModal}
            className="w-28 h-28 lg:mt-10 lg:h-36 lg:w-36 rounded-full hover:cursor-pointer"
          />

          {/* <!-- The Modal --> */}
          {modalVisible && (
            <div ref={modalRef} id="myModal" className="fixed z-30 pt-[100px] left-0 top-0 w-full h-full overflow-auto bg-[rgb(0,0,0)] bg-[rgba(0,0,0,0.6)] ">

              {/* <!-- Modal content --> */}
              <div className="bg-[#000000] m-auto p-[10px] w-[20%] rounded-2xl shadow-xl shadow-[#343333] ">
                <span onClick={hideModal} className="close text-[#aaaaaa] float-right text-3xl font-bold hover:text-[#fff] hover:no-underline hover:cursor-pointer ">&times;</span>
                <img src={
                  currentUser?.imageUrl || "/assets/icons/profile-placeholder.svg"
                } alt="profile" className="rounded-2xl" />
              </div>

            </div>
          )}

          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {currentUser?.name}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser?.username}
              </p>
            </div>

            <div className="flex gap-8 mt-5 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={currentUser?.posts?.length} label="Posts" />
              <StatBlock value={currentUser?.followers?.length} label="Followers" />
              <StatBlock value={myFollowingUser?.following?.length} label="Following" />
            </div>

            {/* <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
                {currentUser.bio}
              </p> */}
            <div className="mt-7 max-w-screen-sm">
              {currentUser?.bio?.split('\n').map((paragraph: string, index: number) => (
                <p key={index} className="small-medium md:base-medium text-center xl:text-left">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <div className={`${user.id !== currentUser._id && "hidden"}`}>
              <Link
                to={`/update-profile/${currentUser._id}`}
                className={`h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg ${user.id !== currentUser._id && "hidden"
                  }`}>
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={20}
                  height={20}
                />
                <p className="flex whitespace-nowrap small-medium">
                  Edit Profile
                </p>
              </Link>
            </div>
            <div className={`${user.id === id && "hidden"}`}>
            <FollowButton user={currentUser}/>
              {/* <Button type="button" className="shad-button_primary px-8">
                Follow
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {currentUser._id === user.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${pathname === `/profile/${id}` && "!bg-dark-3"
              }`}>
            <img
              src={"/assets/icons/posts.svg"}
              alt="posts"
              width={20}
              height={20}
            />
            Posts
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-lg ${pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"
              }`}>
            <img
              src={"/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
            />
            Liked Posts
          </Link>
        </div>
      )}

      <Routes>
        <Route
          index
          element={<GridPostList posts={userPosts?.documents} showUser={false} />}
        />
        {currentUser._id === user.id && (
          <Route path="/liked-posts" element={<LikedPosts />} />
        )}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;