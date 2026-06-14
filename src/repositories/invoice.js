import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    rate: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
});
const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        unique: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    items: [invoiceItemSchema],
    subtotal: Number,
    tax:{
        type:Number,
        default:0,
    },
    total:Number,
    issueDate: {
        type: Date,
        default: Date.now,
    },
    dueDate: Date,
    status: {
        type: String,
        enum: [
            "draft",
            "sent",
            "paid",
            "cancelled",
        ],
        default: "draft",
    },
    pdfPath: {
        type:String,
        default: "",
    },

},
{
    timestamps: true,
}
);
export default mongoose.model(
    "Invoice",
    invoiceSchema
)