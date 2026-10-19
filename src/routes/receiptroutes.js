import express from "express";
import {
    addReceipt,
    fetchReceipts,
    fetchReceiptById,
    previewReceipt,
    downloadReceipt,
} from "../controllers/receiptcontroller.js";

const router = express.Router();

router.post("/", addReceipt);
router.get("/", fetchReceipts);
router.get("/:id", fetchReceiptById);
router.get("/:id/preview", previewReceipt);
router.get("/:id/download", downloadReceipt);

export default router;