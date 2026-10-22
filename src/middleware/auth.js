export const authenticate = (req, res, next) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return res.status(501).json({
            success: false,
            message: "Authentication not configured. Set the API_KEY environment variable.",
        });
    }

    const token =
        req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.slice("Bearer ".length).trim()
            : req.header("x-api-key");

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Provide Authorization: Bearer <token> or X-API-Key header.",
        });
    }

    if (token !== apiKey) {
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token.",
        });
    }

    next();
};
