import express from "express";
import {
    addCreditNote,
    fetchCreditNotes,
    fetchCreditNoteById,
    updateCreditNoteStatus,
    deleteCreditNote,
    previewCreditNote,
    downloadCreditNote,
} from "../controllers/creditnotecontroller.js";

const router = express.Router();

router.post("/", addCreditNote);
router.get("/", fetchCreditNotes);
router.get("/:id", fetchCreditNoteById);
router.get("/:id/preview", previewCreditNote);
router.get("/:id/download", downloadCreditNote);
router.patch("/:id/status", updateCreditNoteStatus);
router.delete("/:id", deleteCreditNote);

export default router;