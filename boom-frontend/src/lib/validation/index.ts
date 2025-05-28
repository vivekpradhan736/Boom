import * as z from "zod";

// ============================================================
// USER
// ============================================================
export const SignupValidation = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const SigninValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const ProfileValidation = z.object({
  file: z.custom<File[]>(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
  bio: z.string(),
});

// ============================================================
// POST
// ============================================================
export const PostValidation = z.object({
  caption: z.string().min(5, { message: "Minimum 5 characters." }).max(2200, { message: "Maximum 2,200 caracters" }),
  file: z.custom<File[]>(),
  location: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
  tags: z.string(),
});

// ============================================================
// VIDEO
// ============================================================
export const VideoValidation = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
  videoType: z.enum(["Short-Form", "Long-Form"]),
  videoFile: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.type === "video/mp4", "Video must be .mp4")
    .refine((file) => !file || file.size <= 10 * 1024 * 1024, "Video must be less than 10MB"),
  videoUrl: z
    .string()
    .optional()
    .refine(
      (url) => {
        // Skip validation for empty or undefined URL
        if (!url) return true;
        // Validate URL format only if provided
        return /^(https?:\/\/)/.test(url);
      },
      { message: "Must be a valid URL" }
    ),
  videoThumbnail: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.type.startsWith("image/"), "Thumbnail must be an image"),
  price: z
    .string()
    .optional()
    // .refine((val) => !val || !isNaN(parseFloat(val)), "Price must be a valid number")
    // .transform((val) => (val ? parseFloat(val) : 0)),
}).refine(
  (data) => {
    if (data.videoType === "Short-Form") {
      return !!data.videoFile;
    }
    return !!data.videoUrl;
  },
  {
    message: "Video file is required for Short-Form, Video URL is required for Long-Form",
    path: ["videoFile", "videoUrl"],
  }
);
//   title: z.string().min(5, { message: "Minimum 5 characters." }).max(2200, { message: "Maximum 2,200 caracters" }),
//   description: z.string().min(1, { message: "This field is required" }).max(100000, { message: "Maximum 100000 characters." }),
//   videoType: z.string().min(1, { message: "This field is required" }),
//   videoFile: z.custom<File[]>(),
//   videoUrl: z.string().min(1, { message: "This field is required" }),
//   videoThumbnail: z.custom<File[]>(),
//   price: z.number(),
// });

// ============================================================
// COMMENT
// ============================================================
export const CommentValidation = z.object({
  text: z.string().min(1, { message: "Minimum 1 characters." }).max(10000, { message: "Maximum 10,000 caracters" }),
});