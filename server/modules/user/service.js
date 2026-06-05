const bcrypt = require("bcryptjs");
const repository = require("./repository");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../auth");

class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ServiceError";
  }
}

const registerUser = async ({
  username,
  password,
  theme,
  notification,
  lastCompleted,
  imageProfile,
}) => {
  if (!password) throw new ServiceError("Password is required");

  const existingUser = await repository.findByUsername(username);
  if (existingUser) throw new ServiceError("User already exists");

  const lastCompletedDate = lastCompleted ? new Date(lastCompleted) : null;

  await repository.createUser({
    username,
    password,
    settings: {
      theme: theme || "dark",
      notification: notification !== undefined ? notification : true,
    },
    imageProfile: imageProfile || null,
    lastCompleted: lastCompletedDate,
  });

  return {
    message: "User registered succussfully",
    username,
    imageProfile: imageProfile || null,
    lastCompleted: lastCompletedDate || null,
  };
};

const loginUser = async ({ username, password, ip, userAgent }) => {
  const user = await repository.findByUsernameWithPassword(username);
  console.log("User found:", user ? "Yes" : "No");
  if (!user) throw new ServiceError("Invalid username or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ServiceError("Invalid credentials");

  const payload = { userId: user._id };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await repository.saveLoginHistory({
    userId: user._id,
    ipAddress: ip,
    userAgent,
  });

  return {
    user: { id: user._id, username: user.username },
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  const user = await repository.findById(decoded.userId);
  if (!user) throw new ServiceError("User not found", 401);

  // Use signAccessToken's default "15m" so the token lifetime matches the cookie maxAge (ACCESS_MAX_AGE).
  return signAccessToken({ userId: user._id });
};

const getUserData = async (userId) => {
  const userData = await repository.findByIdSafe(userId);
  if (!userData) throw new ServiceError("User not found", 404);
  return userData;
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getUserData,
  ServiceError,
};
