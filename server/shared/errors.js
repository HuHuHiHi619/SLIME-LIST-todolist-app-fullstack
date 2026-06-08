class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ServiceError";
  }
}

const sendServiceError = (res, error) => {
  if (error.name === "ServiceError") {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return null;
};

const handleError = (res, error, message = "Server Error", statusCode = 500) => {
  console.error(`Error: ${message}`, error);
  res.status(statusCode).json({ error: message });
};

module.exports = { ServiceError, sendServiceError, handleError };
