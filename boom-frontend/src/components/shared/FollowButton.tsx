import { Models } from "appwrite";
import { Button } from "../ui"
import { useFollowUser, useGetCurrentUserWithFollowing, useUnfollowUser } from "@/lib/react-query/queries";
import { Loader } from ".";
import { useUserContext } from "@/context/AuthContext";
import { useState } from "react";

type FollowButtonProps = {
  user: Models.Document;
};

const FollowButton = ({ user }: FollowButtonProps) => {
  const [followButtonClicked, setFollowButtonClicked] = useState(false);
  const [unFollowButtonClicked, setUnFollowButtonClicked] = useState(false);
  const { user:currentUser } = useUserContext();

  const { mutate: followUser, isPending: followPending  } = useFollowUser();
  const { mutate: unfollowUser, isPending: unFollowPending } = useUnfollowUser();

  const { data: myFollowingUser, isLoading: isUserLoading, refetch: refetchFollowing } = useGetCurrentUserWithFollowing();

  const isFollowing = myFollowingUser?.following.includes(user._id) || false;

  
  const handleUnFollow = () => {
    if (!unFollowButtonClicked) {
    unfollowUser({ userId: user._id });
    refetchFollowing()
    setUnFollowButtonClicked(true);
    }
  };

  const handleFollow = () => {
    if (!followButtonClicked) {
    followUser({ userId: user._id, currentUserId: currentUser.id });
    refetchFollowing()
    setFollowButtonClicked(true);
    }
  };

  return (
    <>
    {
      isFollowing ? (
        <Button type="button" size="sm" className="shad-button_primary px-5" onClick={handleUnFollow} disabled={unFollowButtonClicked} >
          {isUserLoading ? (
            <div className="flex-center gap-2">
              <Loader /> Loading...
            </div>
          ) : unFollowPending ? (
            <div className="flex-center gap-2">
              <Loader /> Loading...
            </div>
          ) : (
            "Unfollow"
          )}
        </Button>
      ) : (
        <Button type="button" size="sm" className="shad-button_primary px-5" onClick={handleFollow} disabled={followButtonClicked} >
          {isUserLoading ? (
            <div className="flex-center gap-2">
              <Loader /> Loading...
            </div>
          ) : followPending ? (
            <div className="flex-center gap-2">
              <Loader /> Loading...
            </div>
          ) : (
            "Follow"
          )}
        </Button>
      )
    }
    </>
  )
}

export default FollowButton
