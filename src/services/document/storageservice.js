import "dotenv/config";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const Bucket = process.env.R2_BUCKET_NAME;

// Generic helpers (used for logos, signatures, anything)
export const uploadFile = async (key, buffer, contentType) => {
    await r2.send(new PutObjectCommand({
        Bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    }));
    return key;
};

export const downloadFile = async (key) => {
    const res = await r2.send(new GetObjectCommand({ Bucket, Key: key }));
    return {
        buffer: Buffer.from(await res.Body.transformToByteArray()),
        contentType: res.ContentType,
    };
};

// PDF wrappers: same names and signatures as before, so callers don't change
export const uploadPdf = (filePath, pdfBuffer) =>
    uploadFile(filePath, pdfBuffer, "application/pdf");

export const downloadPdf = async (filePath) =>
    (await downloadFile(filePath)).buffer;