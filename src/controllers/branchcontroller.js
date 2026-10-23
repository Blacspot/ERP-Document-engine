import {
    createBranch,
    getBranches,
    getBranchById,
    updateBranch,
} from "../repositories/branch.js";
import { uploadFile, downloadFile } from "../services/document/storageservice.js";
import { clearInvoicePdfPathsByBranch } from "../repositories/invoice.js";

const EDITABLE_FIELDS = ["name", "address", "email", "phone"];

const pick = (obj, keys) =>
    Object.fromEntries(keys.filter((k) => k in obj).map((k) => [k, obj[k]]));

export const addBranch = async (req, res) => {
    try {
        const branch = await createBranch(pick(req.body, EDITABLE_FIELDS));
        res.status(201).json({ success: true, data: branch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const fetchBranches = async (req, res) => {
    try {
        res.json({ success: true, data: await getBranches() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const fetchBranch = async (req, res) => {
    try {
        res.json({ success: true, data: await getBranchById(req.params.id) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const editBranch = async (req, res) => {
    try {
        const branch = await updateBranch(req.params.id, pick(req.body, EDITABLE_FIELDS));
        res.json({ success: true, data: branch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// field is "logo" or "signature"; the column stores the R2 key, not a URL
export const uploadBranchImage = (field) => async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image uploaded (field name must be 'image')" });
        }
        const branch = await getBranchById(req.params.id);
        const key = `branches/${branch.id}/${field}`;
        await uploadFile(key, req.file.buffer, req.file.mimetype);
        const updated = await updateBranch(branch.id, { [`${field}_url`]: key });
        await clearInvoicePdfPathsByBranch(branch.id);
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Streams the image so the frontend can use it in an <img> tag
export const serveBranchImage = (field) => async (req, res) => {
    try {
        const branch = await getBranchById(req.params.id);
        const key = branch[`${field}_url`];
        if (!key) {
            return res.status(404).json({ success: false, message: `No ${field} uploaded` });
        }
        const { buffer, contentType } = await downloadFile(key);
        res.setHeader("Content-Type", contentType || "image/png");
        res.setHeader("Cache-Control", "private, max-age=300");
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};