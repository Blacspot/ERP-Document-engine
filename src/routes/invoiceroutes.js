import express from "express";

import {
    createInvoice,
    fetchInvoices,
    fetchInvoiceById,
    deleteInvoice,
    updateInvoice,
    searchInvoices,
} from "../controllers/invoicecontroller.js";

const router = express.Router();

router.post(
    "/",
    createInvoice
);
router.get("/", fetchInvoices);
router.get("/search", searchInvoices);
router.get("/:id", fetchInvoiceById)
router.delete("/:id", deleteInvoice);
router.put("/:id", updateInvoice);

export default router;