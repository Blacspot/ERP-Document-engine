import express from "express";

import {
    createInvoice,
    fetchInvoices,
    fetchInvoiceById,
    deleteInvoice,
} from "../controllers/invoicecontroller.js";

const router = express.Router();

router.post(
    "/",
    createInvoice
);
router.get("/", fetchInvoices);
router.get("/:id", fetchInvoiceById)
router.delete("/:id", deleteInvoice);

export default router;