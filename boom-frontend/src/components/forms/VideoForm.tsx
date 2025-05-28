import * as z from "zod";
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
import { useUploadVideo } from "../../lib/react-query/queries";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type VideoFormProps = {
  video?: any; // Temporary until proper type is defined
  action: "Create" | "Update";
};

const VideoForm = ({ video, action }: VideoFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();
  console.log("user", user)

  const form = useForm<z.infer<typeof VideoValidation>>({
    resolver: zodResolver(VideoValidation),
    defaultValues: {
      title: video?.title || "",
      description: video?.description || "",
      videoType: video?.videoType || "Short-Form",
      videoFile: undefined,
      videoUrl: video?.videoUrl || "",
      videoThumbnail: undefined,
      price: video?.price?.toString() || "0",
    },
  });

  const { mutateAsync: createVideo, isPending: isLoadingCreate } = useUploadVideo();

  const handleSubmit = async (value: z.infer<typeof VideoValidation>) => {
    console.log("handleSubmit called, isLoadingCreate:", isLoadingCreate);
    console.log("Form values:", value);
    console.log("videoFile:", value.videoFile, "isFile:", value.videoFile instanceof File);

    if (action === "Update") {
      toast({ title: "Update action is not implemented yet.", variant: "destructive" });
      return;
    }

    try {
      const validated = VideoValidation.safeParse(value);
      if (!validated.success) {
        console.error("Validation errors:", validated.error.flatten());
        toast({
          title: "Form validation failed",
          description: "Please check all fields and try again.",
          variant: "destructive",
        });
        return;
      }

      const data = new FormData();
      data.append("userId", user.id);
      data.append("title", value.title);
      data.append("description", value.description);
      data.append("videoType", value.videoType);
      if (value.videoType === "Short-Form") {
        if (value.videoFile && value.videoFile instanceof File) {
          data.append("videoFile", value.videoFile);
        } else {
          toast({
            title: "Valid video file is required for Short-Form",
            variant: "destructive",
          });
          return;
        }
      } else {
        if (value.videoUrl) {
          data.append("videoUrl", value.videoUrl);
          data.append("price", value.price?.toString() || "0");
        } else {
          toast({
            title: "Video URL is required for Long-Form",
            variant: "destructive",
          });
          return;
        }
      }
      if (value.videoThumbnail && value.videoThumbnail instanceof File) {
        data.append("videoThumbnail", value.videoThumbnail);
      }

      console.log("Submitting FormData:", Array.from(data.entries()));

      await createVideo(data, {
        onSuccess: () => {
          toast({ title: "Video uploaded successfully!" });
          navigate("/");
        },
        onError: (error: any) => {
          console.error("createVideo error:", error);
          toast({
            title: "Video upload failed",
            description: error.response?.data?.message || error.message,
            variant: "destructive",
          });
        },
      });
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Video upload failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Debug form state
  console.log("Form errors:", form.formState.errors);
  console.log("Form isValid:", form.formState);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl"
      >
        <FormField
          control={form.control}
          name="videoType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Video Type</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={(value: any) => {
                    field.onChange(value);
                    form.setValue("videoType", value);
                    form.resetField("videoFile");
                    form.resetField("videoUrl");
                  }}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Long-Form" id="long-form" />
                    <Label htmlFor="long-form">Long Video</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Short-Form" id="short-form" />
                    <Label htmlFor="short-form">Short Video</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Title</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {form.watch("videoType") === "Long-Form" ? (
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
        ) : (
          <FormField
            control={form.control}
            name="videoFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Add Short Video</FormLabel>
                <FormControl>
                  <FileUploader
                    fieldChange={(files: File[]) => {
                      console.log("FileUploader files:", files); // Debug
                      field.onChange(files[0] || undefined);
                    }}
                    mediaUrl={video?.videoFileUrl || ""}
                    isVideo={true}
                  />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Description</FormLabel>
              <FormControl>
                <Textarea className="shad-textarea custom-scrollbar" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="videoThumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Thumbnail (Optional)</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={(files: File[]) => {
                    console.log("Thumbnail files:", files); // Debug
                    field.onChange(files[0] || undefined);
                  }}
                  mediaUrl={video?.videoThumbnailUrl || ""}
                  isVideo={false}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {form.watch("videoType") === "Long-Form" && (
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Price (₹, 0 for free)</FormLabel>
                <FormControl>
                  <Input type="number" className="shad-input" {...field} />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate}
            onClick={() => console.log("Submit button clicked")} // Debug
          >
            {isLoadingCreate && <Loader />}
            {action} Video
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default VideoForm;