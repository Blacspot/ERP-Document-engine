import supabase from "../config/supabase.js";

export const createBranch = async (branchData) => {
    const { data, error } = await supabase
        .from("branches")
        .insert([branchData])
        .select()
        .single();
    if (error) {
        throw new Error(error.message);
    }
    return data;
};

export const getBranches = async () => {
    const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) {
        throw new Error(error.message);
    }
    return data;
};

export const getBranchById = async (id) => {
    const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("id", id)
        .single();
    if (error) {
        throw new Error(error.message);
    }
    return data;
};

export const updateBranch = async (id, branchData) => {
    const { data, error } = await supabase
        .from("branches")
        .update(branchData)
        .eq("id", id)
        .select()
        .single();
    if (error) {
        throw new Error(error.message);
    }
    return data;
};