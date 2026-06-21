import {createCustomer, getCustomers, deleteCustomer as deleteCustomerInDB} from "../repositories/customerRepository.js";
export const addCustomer = async (req, res) => {
    try {
        const customer = await createCustomer(req.body || req.query);
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({
            message:
            error.message,
        });        
    }
};

export const fetchCustomers = async(req, res) => {
    try {
        const customers = await getCustomers();
        res.json(customers);
    } catch (error) {
       res.status(500).json({
        message:
          error.message,
       });        
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const result = await deleteCustomerInDB(req.params.id);
        res.json({success: true, ...result});
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};