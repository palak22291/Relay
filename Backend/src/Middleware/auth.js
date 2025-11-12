// const jwt = require("jsonwebtoken");

// module.exports = function (req, res, next) {
//   const token = req.headers["authorization"]?.split(" ")[1];

//   //   req.headers → metadata sent with the request (like language, content type, and authentication info)
//   // Authorization: Bearer <JWT_TOKEN_HERE>
//   // "Authorization" is a standard HTTP header name
//   // "Bearer" is a type of authentication scheme
//   // <JWT_TOKEN_HERE> is your token string
//   // Square brackets are safer when the header name may not be exactly known in advance or contains special characters.
//   // If authorization header exists → split it,If it doesn't exist → avoid error, return undefined
//   // split => "Bearer <token>" =>"Bearer token".split(" ") => ["Bearer", "token"]
//   // .split(" ")[1]   // gives "token"

//   if (!token) {
//     return res
//       .status(401)
//       .json({ error: "No token provided, authorization denied" });
//   }

//   try {
//     // const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const { verifyToken } = require("../Utils/jwt");

//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return res.status(401).json({ error: "Token is invalid or expired" });
//     }
//     req.user = decoded;
//     // "This request now belongs to this user."
//     next();
//     // This middleware is done, move to the next function in the route."
//   } catch (err) {
//     res.status(401).json({ error: "Token is invalid or expired" });
//   }
// };

// // jwt verify (a function  if jwt library) checks  whether the token is valid and authentic using a secret key (JWT_SECRET) that only your server knows.
// // if token  is valid it will generate a payload which cntains userid iat(issued at time) and expiry


// 

const jwt = require("jsonwebtoken");
const { verifyToken } = require("../Utils/jwt"); 

module.exports = function (req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "No token provided, authorization denied" });
  }

  try {
    const decoded = verifyToken(token); // returns { userId, email }
    if (!decoded) {
      return res.status(401).json({ error: "Token is invalid or expired" });
    }
    req.user = decoded; // attach decoded user info to req.user
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(401).json({ error: "Token is invalid or expired" });
  }
};
