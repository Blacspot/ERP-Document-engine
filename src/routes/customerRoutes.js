import express from "express";
import {addCustomer, fetchCustomers, deleteCustomer} from "../controllers/customerController.js";

const router = express.Router();
router.post("/", addCustomer);
router.get("/", fetchCustomers);
router.delete("/:id", deleteCustomer);

export default router;