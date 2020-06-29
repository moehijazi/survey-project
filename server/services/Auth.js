const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  const token = req.headers["x-auth-token"];
  if (!token)
    return res.status(401).json({ message: "Failed to authenticate" });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) return res.status(500).json({ message: "Failed to authenticate" });
    console.log(data);
    req.user = { id: data.user };
    next();
  });
};

module.exports = checkAuth;
