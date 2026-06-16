import express from "express";

import {
    createInvoice,
    fetchInvoiceById,
} from "../controllers/invoicecontroller.js";

const router = express.Router();

router.post(
    "/",
    createInvoice
);
router.get("/:id", fetchInvoiceById)

export default router;