import express from "express";

import {
    createInvoice,
    fetchInvoices,
    fetchInvoiceById,
} from "../controllers/invoicecontroller.js";

const router = express.Router();

router.post(
    "/",
    createInvoice
);
router.get("/", fetchInvoices);
router.get("/:id", fetchInvoiceById)

export default router;