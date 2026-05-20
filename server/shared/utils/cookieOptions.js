// Single source of truth for auth cookie options.
// NODE_ENV is read at call time (not module load) so the value is correct
// regardless of import order relative to dotenv.config().
const cookieOptions = ({ maxAge, path } = {}) => {
  const isProduction = process.env.NODE_ENV === "production";
  const opts = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
  };
  if (maxAge !== undefined) opts.maxAge = maxAge;
  if (path !== undefined) opts.path = path;
  return opts;
};

module.exports = { cookieOptions };
