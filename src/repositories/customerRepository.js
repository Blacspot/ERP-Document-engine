import supabase from "../config/supabase.js";
export const createCustomer = async (
    customerData
) => {
    const { data, error } =
    await supabase
       .from("customers")
       .insert([customerData])
       .select()
       .single();

    if (error) {
        throw new Error(error.message);
    }  
    return data;
};
export const getCustomers = async () => {
    const { data, error } = await supabase
         .from("customers")
         .select("*")
         .order("created_at", {
            ascending:false,
         });
     if (error) {
        throw new Error(error.message);
     }    
     return data;
};