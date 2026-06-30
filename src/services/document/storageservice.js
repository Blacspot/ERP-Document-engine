import supabase from "../../config/supabase.js";



export const uploadPdf = async (
    filePath,
    pdfBuffer
) => {
    
    const {error} = await supabase
                     .storage
                     .from("documentapi-bucket")
                     .upload(
                        filePath,
                        pdfBuffer,
                        {
                            contentType: "application/pdf",
                            upsert: false,
                        }
                     );
        if (error) {
            throw new Error(error.message);
        }             
        return filePath;
};
export const downloadPdf = async( filePath) => {
    const { data, error } = await supabase
          .storage
          .from("documentapi-bucket")
          .download(filePath);
    if (error) {
        throw new Error(error.message);
    }      
    return Buffer.from(
        await data.arrayBuffer()
    );
};