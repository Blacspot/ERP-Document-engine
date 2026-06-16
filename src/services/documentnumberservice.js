import { v4 as uuidv4 }
from "uuid";

export const generateInvoiceNumber =
  () => {
    const date = new Date();
    const year = date.getFullYear();

    const random = Math.floor(
      1000 + Math.random() * 9000
    );
    return  `INV-${year}-${random}`;
  };

export const generateQuotationNumber = () => {
   const year = new Date().getFullYear();
   const random = Math.floor(
      1000 + Math.random() * 9000
   );
   return `QTN-${year}-${random}`;
};

export const generateCreditNoteNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(
    1000 + Math.random() * 9000
  );
  return `CRN-${year}-${random}`;
};

export const generateReceiptNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(
    1000 + Math.random() * 9000
  );
  return `RCT-${year}-${random}`;
}