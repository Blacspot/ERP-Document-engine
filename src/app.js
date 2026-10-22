import express from "express";
import cors from "cors";
import morgan from "morgan";
import { authenticate } from "./middleware/auth.js";
import invoiceRoutes from "./routes/invoiceroutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import branchRoutes from "./routes/branchroutes.js";
import quotationRoutes from "./routes/quotationroutes.js";
import creditNoteRoutes from "./routes/creditnoteroutes.js";
import receiptRoutes from "./routes/receiptroutes.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Authentication required for every API route (including logo/signature images).
app.use("/api", authenticate);

app.use("/api/invoices", invoiceRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/credit-notes", creditNoteRoutes);
app.use("/api/receipts", receiptRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Document Engine is running"
    });
});
export default app;