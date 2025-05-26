import * as z from "zod";
import { Models } from "appwrite";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Textarea,
} from "../ui";
import { VideoValidation } from "../../lib/validation";
import { useToast } from "../ui/use-toast";
import { useUserContext } from "../../context/AuthContext";
import { FileUploader, Loader } from "../shared";
import { useUpdatePost, useUploadVideo } from "../../lib/react-query/queries";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react";

type VideoFormProps = {
  video?: Models.Document;
  action: "Create" | "Update";
};

const VideoForm = ({ video, action }: VideoFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();
  const [videoFormat, setVideoFormat] = useState("Long-Form");

  const handleVideoFormat = (value: string) => {
    setVideoFormat(value)
  }

  const form = useForm<z.infer<typeof VideoValidation>>({
    resolver: zodResolver(VideoValidation),
    defaultValues: {
      title: video ? video?.title : "",
      description: video ? video?.description : "",
      videoType: video ? video?.videoType : "", 
      videoFile: [],
      videoUrl: video ? video?.videoUrl : "",
      videoThumbnail: [],
      price: video ? video.price : 0,
    },
  });

  // Query
  const { mutateAsync: createvideo, isPending: isLoadingCreate } = useUploadVideo();
  const { mutateAsync: updatePost, isLoading: isLoadingUpdate } = useUpdatePost();

  // Handler
  const handleSubmit = async (value: z.infer<typeof VideoValidation>) => {
    // ACTION = UPDATE
    // if (video && action === "Update") {
    //   const updatedVideo = await updateVideo({
    //     ...value,
    //     videoId: video._id,
    //     imageId: post.imageId,
    //     imageUrl: post.imageUrl,
    //   });

    //   if (!updatedVideo) {
    //     toast({
    //       title: `${action} video failed. Please try again.`,
    //     });
    //   }
    //   return navigate(`/posts/${post._id}`);
    // }

    // ACTION = CREATE
    const data = new FormData();
    data.append("title", value.title);
    data.append("description", value.description);
    data.append("videoType", value.videoType);
    if (value.videoType === "Short-Form") {
      if (value.videoFile) {
        data.append("videoFile", value.videoFile);
      } else {
        alert("Video file is required for Short-Form");
        return;
      }
    } else {
      if (value.videoUrl) {
        data.append("videoUrl", value.videoUrl);
        data.append("price", value.price);
      } else {
        alert("Video URL is required for Long-Form");
        return;
      }
    }
    if (value.videoThumbnail) {
      data.append("videoThumbnail", value.videoThumbnail);
    }

    createvideo(data, {
      onSuccess: (data: any) => {
        toast({
        title: `${action} video failed. Please try again.`,
      });
      navigate("/");
      },
    });

    // const newVideo = await createvideo({
    //   ...value,
    //   userId: user.id,
    // });

    // if (!newVideo) {
    //   toast({
    //     title: `${action} video failed. Please try again.`,
    //   });
    // }
    // navigate("/");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-9 w-full  max-w-5xl">

        <RadioGroup value={videoFormat} onValueChange={handleVideoFormat}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="Long-Form" id="r1" />
        <Label htmlFor="r1">Long Video</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="Short-Form" id="r2" />
        <Label htmlFor="r2">Short Video</Label>
      </div>
    </RadioGroup>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Title</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {
            videoFormat == "Long-Form" ? (
                <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Video URL</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
            ) : 
            (
                <FormField
          control={form.control}
          name="videoFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Short Video</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={video?.videoFileUrl}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
            )
        }

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Description</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Price</FormLabel>
              <FormControl>
                <Input type="number" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}>
            {(isLoadingCreate || isLoadingUpdate) && <Loader />}
            {action} Video
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default VideoForm;