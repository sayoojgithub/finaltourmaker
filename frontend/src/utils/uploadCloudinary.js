// const upload_preset = import.meta.env.VITE_UPLOAD_PRESET;
// const cloud_name = import.meta.env.VITE_CLOUD_NAME;

// const uploadImageToCloudinary = async (file) => {
//     const uploadData = new FormData();
//     uploadData.append('file', file);
//     uploadData.append('upload_preset', upload_preset);

//     const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
//         method: 'POST',
//         body: uploadData
//     });
   
//     const data = await res.json();
//     console.log("📦 Cloudinary response:", data);
//     return data;
// }

// export default uploadImageToCloudinary;


// utils/uploadCloudinary.js  (now uploads to Cloudflare R2)
import API from "../api";

const uploadImageToCloudinary = async (file, folder = "uploads") => {
  // 1) Ask backend for signed PUT URL + public URL
  const signRes = await API.post("/upload/r2/sign", {
    contentType: file.type,
    folder, // "vehicle" | "trip" | "activity" | "company-logo" etc
  });

  const { uploadUrl, publicUrl } = signRes.data;

  // 2) Upload directly from browser to R2
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!putRes.ok) {
    throw new Error("R2 upload failed");
  }

  // 3) Return Cloudinary-like response so your JSX does not change
  return { secure_url: publicUrl };
};

export default uploadImageToCloudinary;
