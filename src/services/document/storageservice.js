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

export const uploadPdf = async (filePath, pdfBuffer) => {
    await r2.send(new PutObjectCommand({
        Bucket,
        Key: filePath,
        Body: pdfBuffer,
        ContentType: "application/pdf",
    }));
    return filePath;
};

export const downloadPdf = async (filePath) => {
    const res = await r2.send(new GetObjectCommand({ Bucket, Key: filePath }));
    return Buffer.from(await res.Body.transformToByteArray());
};