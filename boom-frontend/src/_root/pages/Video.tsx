import { Loader, VideoCard, UserCard } from "@/components/shared";
import {
  useGetRecentVideos,
  useGetUsers,
} from "@/lib/react-query/queries";
import { Models } from "appwrite";
import { useUserContext } from "@/context/AuthContext";
import { INewVideo, IUser } from "@/types";

const Video = () => {
  const { user } = useUserContext();

  const { data: videos, isLoading: isVideoLoading, isError: isErrorVideos } = useGetRecentVideos();
  const { data: creators, isLoading: isUserLoading, isError: isErrorCreators } = useGetUsers(10);
  console.log("videos",videos)

  const filteredCreators = creators?.documents.filter((creator: any) => creator?._id !== user?.id);

  if (isErrorVideos || isErrorCreators) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Video Feed</h2>
          {isVideoLoading && !videos ? (
            <Loader />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {videos?.map((video: Models.Document) => (
                <li key={video._id} className="flex justify-center w-full">
                  <VideoCard video={video} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="home-creators">
        <h3 className="h3-bold text-light-1">Top Creators</h3>
        {isUserLoading && !creators ? (
          <Loader />
        ) : (
          <ul className="grid 2xl:grid-cols-2 gap-6">
            {filteredCreators?.map((creator: Models.Document) => (
              <li key={creator._id}>
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Video;