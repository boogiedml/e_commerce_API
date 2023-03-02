const errorHandler = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res
      .status(401)
      .json({ error: true, message: "The user is not authorised" });
  }

  if (err.name === "ValidationError") {
    return res.status(401).json({ error: true, message: err });
  }

  return res.status(500).json({ error: true, message: err });
};

export default errorHandler;
