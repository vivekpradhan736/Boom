import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateUser, useUploadFile } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { resolve } from "node:path/posix";

const ProfilePictureSchema = z.object({
  profilePicture: z
    .any()
    .refine((file) => file instanceof File || file?.length > 0, {
      message: "Please select an image",
    })
    .optional(),
});

type ProfilePictureType = z.infer<typeof ProfilePictureSchema>;

const ProfilePictureForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { mutateAsync: uploadPicture, isPending, isError, error, data } = useUploadFile();
  const { mutateAsync: updateUser } = useUpdateUser();
  const { user, setUser } = useUserContext();
  console.log("user",user)

  const form = useForm<ProfilePictureType>({
    resolver: zodResolver(ProfilePictureSchema),
    defaultValues: {
      profilePicture: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setSelectedFile(file);
      form.setValue("profilePicture", file);
    }
  };

  const onSubmit = async (data: ProfilePictureType) => {
    if (!data.profilePicture) {
      toast({ title: "Please select a profile picture" });
      return;
    }
    if(!selectedFile){
      toast({ title: "Please select a profile picture" });
      return;
     }

    try {
      setIsUploading(true);

      // 🔁 Upload logic here (replace with actual API call)
      const formData = new FormData();
      formData.append("profilePicture", data.profilePicture);

      console.log("formData",formData)
      console.log("selectedFile",selectedFile)

      // Simulate API call
      const res = await uploadPicture(selectedFile);
      console.log("res",res)

      const updatedUser = await updateUser({
      userId: user?.id,
      name: user?.name,
      bio: user?.bio,
      file: [],
      imageUrl: res?.url,
      imageId: res?.id,
    });
    console.log("updatedUser",updatedUser)
    setUser({
      ...user,
      imageUrl: updatedUser?.imageUrl,
    });

      toast({ title: "Profile picture uploaded successfully!" });
      navigate("/");
    } catch (error) {
      toast({ title: "Upload failed. Try again." });
    } finally {
      setIsUploading(false);
    }
  };

  const skipUpload = () => {
    navigate("/");
  };

  return (
    <>
    <section className="flex flex-1 justify-center items-center flex-col py-10">
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg" alt="logo" />

        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Add a profile picture</h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          This step is optional. You can skip it for now.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
          <FormField
            control={form.control}
            name="profilePicture"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Upload Image</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/*" required onChange={handleFileChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-full self-center"
            />
          )}

          <Button type="submit" className="shad-button_primary">
            {isUploading ? (
              <div className="flex-center gap-2">
                <Loader /> Uploading...
              </div>
            ) : (
              "Upload and Continue"
            )}
          </Button>

          <Button type="button" onClick={skipUpload} variant="ghost" className="text-primary-500 hover:underline">
            Skip for now
          </Button>
        </form>
      </div>
    </Form>
    </section>

    <img
            src="/assets/images/side-img.svg"
            alt="logo"
            className="hidden xl:block w-1/2 h-screen object-cover bg-no-repeat"
          />
    </>
  );
};

export default ProfilePictureForm;