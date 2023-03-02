import jwt from "jsonwebtoken";
// import { expressjwt } from "express-jwt";

// function authJwt() {
//   const secret = process.env.SECRET_KEY;
//   return expressjwt({
//     secret,
//     algorithms: ["HS256"],
//   });
// }
const apiRoute = "/api/v1";

const publicRoute = "/public/uploads/";

const verifyJwt = (req, res, next) => {
  if (req.path.startsWith(publicRoute)) {
    // Skip token verification for public routes
    next();
  } else if (
    req.path === `${apiRoute}/users/login` ||
    req.path === `${apiRoute}/users/signup` ||
    (req.method === "GET" && req.path === `${apiRoute}/products`) ||
    (req.method === "GET" &&
      req.path === `${apiRoute}/products/get/featured`) ||
    (req.method === "GET" && req.path === `${apiRoute}/products/get/count`) ||
    (req.method === "GET" && req.path === `${apiRoute}/categories`)
  ) {
    // Skip token verification for the login route and some public routes
    next();
  } else if (
    req.headers.token &&
    req.headers.token.split(" ")[0] === "Bearer"
  ) {
    const token = req.headers.token.split(" ")[1];

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        res.status(403).json({ error: true, message: "Token is invalid" });
      } else {
        req.user = user;
        if (!user.isAdmin) {
          res
            .status(403)
            .json({ error: true, message: "User is not authorized" });
        } else {
          next();
        }
      }
    });
  } else {
    res.status(401).json({ error: true, message: "Token is missing" });
  }
};

export default verifyJwt;
