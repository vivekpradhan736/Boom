import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_CLOUD_NAME= "dfzbbx31u"
const CLOUDINARY_API_KEY= "736842653849378"
const CLOUDINARY_API_SECRET= "bbeYp3hf8e5UaxOxx5GqSK54fFg"

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export default cloudinary;