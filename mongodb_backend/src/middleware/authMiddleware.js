const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'medicare_pro_super_secret_key_123');
        req.user = decoded; // { id, role }
        next();
    } catch (ex) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};
