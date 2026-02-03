// controllers/uploadController.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { r2 } from "../utils/r2.js";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export const signR2Upload = async (req, res) => {
    
  try {
    const { contentType, folder = "uploads" } = req.body;
    console.log("1")
    if (!contentType || !ALLOWED.has(contentType)) {
      return res.status(400).json({ message: "Invalid image type" });
    }
    
    const ext =
      contentType === "image/jpeg" ? "jpg" :
      contentType === "image/png" ? "png" :
      contentType === "image/webp" ? "webp" :
      "avif";

    const key = `${folder}/${Date.now()}-${nanoid(10)}.${ext}`;
    
    const cmd = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: contentType,
      // NOTE: no ACL here (R2 commonly relies on public access settings / domain)
    });
   
    console.log(process.env.R2_BUCKET,"bucket")
    // console.log(process.env.)
    const uploadUrl = await getSignedUrl(r2, cmd, { expiresIn: 60 });
    console.log("5")
    // This is the URL you store in MongoDB
    const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
    console.log("6")
    return res.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    console.error("signR2Upload error:", err);
    return res.status(500).json({ message:err?.message || "Failed to sign upload" });
  }
};
