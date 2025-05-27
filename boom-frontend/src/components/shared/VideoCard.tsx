import { Link } from "react-router-dom";
import { useState } from "react";
import { Models } from "appwrite";

import { VideoStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { useCheckVideoPurchase, usePurchaseVideo } from "@/lib/react-query/queries";
import { Play } from "lucide-react";
import { toast } from "../ui";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type VideoCardProps = {
    video: Models.Document;
};

const VideoCard = ({ video }: VideoCardProps) => {
    const [open, setOpen] = useState(false)
    const [showAll, setShowAll] = useState(false);
    const { user } = useUserContext();

    const { data: purchaseStatus, refetch: refetchPurchase, isLoading: isPurchaseLoading } = useCheckVideoPurchase(
        user.id,
        video._id
    );
    const { mutate: purchaseVideo, isPending: isPurchasing } = usePurchaseVideo();

    console.log("purchaseStatus", purchaseStatus)

    if (!video.creator) return null;

    const isLongForm = video.videoType === "Long-Form";
    const isPaid = video.price > 0;
    const isPurchased = purchaseStatus?.purchased || false;
    const canWatch = !isLongForm || !isPaid || isPurchased;

    console.log("user", user)
    console.log("isPaid", isPaid)
    console.log("isPurchased", isPurchased)

    const handlePurchase = () => {
        purchaseVideo({videoId: video._id, userId: user.id}, {
            onSuccess: () => {
                refetchPurchase();
                toast({ title: `Video purchased successfully!` });
                setOpen(false);
            },
            onError: (error) => {
                toast({ title: `Purchase failed` });
            },
        });
    };

    const handlePurchaseFirst = () => {
        if(isPurchased == false){
            toast({ title: `Please purchase this video!` });
        }
    }

    const getYouTubeId = (url: string) => {
        try {
            const parsedUrl = new URL(url);
            const hostname = parsedUrl.hostname;

            if (hostname === "youtu.be") {
                return parsedUrl.pathname.slice(1); // remove leading slash
            }

            if (hostname.includes("youtube.com")) {
                return parsedUrl.searchParams.get("v");
            }

            return null;
        } catch (error) {
            return null;
        }
    };

    const videoId = getYouTubeId(video.videoUrl);

    return (
        <div className="post-card">
            <div className="flex-between">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${video.creator._id}`}>
                        <img
                            src={
                                video.creator?.imageUrl ||
                                "/assets/icons/profile-placeholder.svg"
                            }
                            alt="creator"
                            className="w-12 lg:h-12 rounded-full"
                        />
                    </Link>

                    <Link to={`/profile/${video.creator._id}`}>
                        <div className="flex flex-col">
                            <p className="base-medium lg:body-bold text-light-1">
                                {video.creator.name}
                            </p>
                            <div className="flex-center gap-2 text-light-3">
                                <p className="subtle-semibold lg:small-regular">
                                    {multiFormatDateString(video.createdAt)}
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                <Link
                    to={`/update-video/${video._id}`}
                    className={`${user.id !== video.creator._id && "hidden"}`}
                >
                    <img
                        src="/assets/icons/edit.svg"
                        alt="edit"
                        width={20}
                        height={20}
                    />
                </Link>
            </div>

            <div className="small-medium lg:base-medium py-5 flex justify-between">
                <p className="line-clamp-1 w-[70%]">{video.title}</p>
                {
                    isPaid ? ( 
                        isPurchased ? (
                            <div className="w-[10%] text-[#7761dc]">Paid</div>
                        ) : (
                            <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer text-[#866fed] px-1 flex justify-end border rounded-sm border-[#5c5abc]">Buy ₹{video.price}</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase video</DialogTitle>
          <DialogDescription>
            Title: {video.title}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1 py-4">
            <h1>Video price: ₹{video.price}</h1>
            <h1>My balance: ₹{user.balance}</h1>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handlePurchase} className="bg-[#433fb6]">Buy ₹{video.price}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
                        )
                    ) : (
                        <div className="w-[10%] text-[#7761dc]">Free</div>
                    )
                }
            </div>

            {
                video.videoType == "Long-Form" ? (
                    isPaid ? (
                        isPurchased ? (
                            <iframe
                            width="560"
                            height="315"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allowFullScreen
                        ></iframe>
                        ) : (
                            <div className="relative cursor-pointer" onClick={handlePurchaseFirst}>
                            <img
                                src={video?.videoThumbnailUrl || "/assets/icons/profile-placeholder.svg"}
                                alt="post image"
                                className="post-card_img opacity-50"
                            />
                            <Play strokeWidth={3} className="absolute w-10 h-10 top-[50%] left-[50%]" />
                            </div>
                        )
                    ) : (
                        <iframe
                            width="560"
                            height="315"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allowFullScreen
                        ></iframe>
                    )
                ) : (
                    <video autoPlay controls
                        loop
                        playsInline className="w-full h-[400px]">
                        <source src={video.videoFileUrl} type="video/mp4" />
                    </video>
                )
            }

            <VideoStats video={video} userId={user.id} />

            <div>
                <div>
                    <span className="text-white font-bold cursor-pointer hover:underline hover:text-[#fff5f5]">
                        {video.creator.name}
                    </span>{" "}
                    <span className="text-[14px] text-[#ebeaea]">
                        {showAll
                            ? video.description
                                .split("\n")
                                .map((paragraph: string, index: number) => (
                                    <span key={index} className="block">
                                        {paragraph}
                                    </span>
                                ))
                            : video.description.slice(0, 50)}
                        {video.description.length < 50 ? "" : showAll ? "" : "..."}
                    </span>
                    {video.description.length > 50 && (
                        <>
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="text-[#9c9a9a] text-sm block"
                            >
                                {showAll ? "show less" : "show more"}
                            </button>
                        </>)}
                </div>
            </div>
        </div>
    );
};

export default VideoCard;