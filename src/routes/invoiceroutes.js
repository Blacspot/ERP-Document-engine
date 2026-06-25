import express from "express";

import {
    createInvoice,
    fetchInvoices,
    fetchInvoiceById,
    deleteInvoice,
    updateInvoice,
    searchInvoices,
    recordPayment,
    cancelInvoice,
    markInvoicePaid,
} from "../controllers/invoicecontroller.js";
import { previewInvoice } from "../controllers/pdfController.js";


const router = express.Router();

router.post(
    "/",
    createInvoice
);
router.get("/", fetchInvoices);
router.get("/search", searchInvoices);
router.get("/:id", fetchInvoiceById)
router.get("/:id/preview", previewInvoice)
router.delete("/:id", deleteInvoice);
router.put("/:id", updateInvoice);
router.patch("/:id/cancel", cancelInvoice);
router.patch("/:id/pay", markInvoicePaid);
router.patch("/:id/payment", recordPayment);

export default router;