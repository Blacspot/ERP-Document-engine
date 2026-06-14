import express from "express";

import {
    createInvoice,
} from "../controllers/invoicecontroller.js";

const router = express.Router();

router.post(
    "/",
    createInvoice
);

export default router;