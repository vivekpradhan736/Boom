import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "../ui";
import { convertFileToUrl } from "../../lib/utils";
import { useToast } from "../ui/use-toast";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
  isVideo?: boolean;
};

const FileUploader = ({ fieldChange, mediaUrl, isVideo }: FileUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      console.log("Accepted files:", acceptedFiles); // Debug
      setFile(acceptedFiles);
      fieldChange(acceptedFiles);
      setFileUrl(convertFileToUrl(acceptedFiles[0]));
    },
    [fieldChange]
  );

  const onDropRejected = useCallback(
    (fileRejections: any[]) => {
      toast({
        title: "Invalid file",
        description: `Please upload a valid ${isVideo ? "MP4 video" : "image (PNG, JPG, JPEG, GIF)"}.`,
        variant: "destructive",
      });
    },
    [isVideo, toast]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDropRejected,
    accept: isVideo
      ? { "video/mp4": [".mp4"] }
      : { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-col items-center bg-dark-3 rounded-xl cursor-pointer"
    >
      <input {...getInputProps()} className="cursor-pointer" />
      {fileUrl ? (
        <>
          <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
            {isVideo ? (
              <video
                src={fileUrl}
                controls
                className="file_uploader-img"
                style={{ maxWidth: "100%", maxHeight: "400px" }}
              />
            ) : (
              <img src={fileUrl} alt="image" className="file_uploader-img" />
            )}
          </div>
          <p className="file_uploader-label">
            Click or drag {isVideo ? "video" : "photo"} to replace
          </p>
        </>
      ) : (
        <div className="file_uploader-box">
          <img
            src="/assets/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file upload"
            className="w-24 h-20 object-cover"
          />
          <h3 className="base-medium text-light-2 mb-2 mt-6">
            Drag {isVideo ? "video" : "photo"} here
          </h3>
          <p className="text-light-4 small-regular mb-6">
            {isVideo ? "MP4" : "SVG, PNG, JPG"}
          </p>
          <Button type="button" className="shad-button_dark_4">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;