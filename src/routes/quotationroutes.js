import express from "express";
import {
    addQuotation,
    fetchQuotations,
    fetchQuotationById,
    updateQuotationStatus,
    deleteQuotation,
    previewQuotation,
    downloadQuotation,
} from "../controllers/quotationcontroller.js";

const router = express.Router();

router.post("/", addQuotation);
router.get("/", fetchQuotations);
router.get("/:id", fetchQuotationById);
router.get("/:id/preview", previewQuotation);
router.get("/:id/download", downloadQuotation);
router.patch("/:id/status", updateQuotationStatus);
router.delete("/:id", deleteQuotation);

export default router;