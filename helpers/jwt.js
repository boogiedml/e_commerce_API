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

const verifyJwt = (req, res, next) => {
  const publicRoutes = [
    "/public/uploads/",
    `${apiRoute}/users/login`,
    `${apiRoute}/users/signup`,
    `${apiRoute}/auth/verify-email`,
    `${apiRoute}/products`,
    `${apiRoute}/products/get/featured`,
    `${apiRoute}/products/get/count`,
    `${apiRoute}/categories`,
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    req.path.startsWith(route)
  );

  if (isPublicRoute) {
    // Skip token verification for public routes
    next();
  } else if (req.headers.token && req.headers.token.startsWith("Bearer ")) {
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
