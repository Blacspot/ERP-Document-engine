import express from "express";
import {addCustomer, fetchCustomers} from "../controllers/customerController.js";

const router = express.Router();
router.post("/", addCustomer);
router.get("/", fetchCustomers);

export default router;