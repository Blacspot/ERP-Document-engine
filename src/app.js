import express from "express";
import cors from "cors";
import morgan from "morgan";
import invoiceRoutes from "./routes/invoiceroutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import branchRoutes from "./routes/branchroutes.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api/invoices", invoiceRoutes)
app.use("/api/customers", customerRoutes);
app.use("/api/branches", branchRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Document Engine is running"
    });
});
export default app;