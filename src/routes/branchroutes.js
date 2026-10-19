import express from "express";
import multer from "multer";
import {
    addBranch,
    fetchBranches,
    fetchBranch,
    editBranch,
    uploadBranchImage,
    serveBranchImage,
} from "../controllers/branchcontroller.js";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
    fileFilter: (req, file, cb) =>
        ALLOWED_TYPES.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error("Only PNG, JPEG or WebP images are allowed")),
});

// Turns multer errors (wrong type, too large) into clean JSON responses
const singleImage = (req, res, next) =>
    upload.single("image")(req, res, (err) =>
        err ? res.status(400).json({ success: false, message: err.message }) : next()
    );

const router = express.Router();

router.post("/", addBranch);
router.get("/", fetchBranches);
router.get("/:id", fetchBranch);
router.put("/:id", editBranch);

router.put("/:id/logo", singleImage, uploadBranchImage("logo"));
router.put("/:id/signature", singleImage, uploadBranchImage("signature"));
router.get("/:id/logo", serveBranchImage("logo"));
router.get("/:id/signature", serveBranchImage("signature"));

export default router;