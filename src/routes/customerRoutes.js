import express from "express";
import {addCustomer, fetchCustomers, deleteCustomer, updateCustomer} from "../controllers/customerController.js";

const router = express.Router();
router.post("/", addCustomer);
router.get("/", fetchCustomers);
router.delete("/:id", deleteCustomer);
router.put("/:id", updateCustomer);

export default router;