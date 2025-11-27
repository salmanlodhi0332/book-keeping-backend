const jwt = require('jsonwebtoken');
const db = require('../models');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const User = db.User;

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'Authorization header missing' });

    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const payload = jwt.verify(token, JWT_SECRET);
    // optionally refresh user from DB
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ message: 'Invalid token (user not found)' });

    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
