const { isValidObjectId, Types } = require("mongoose");

/**
 * Resolves who is making the request and builds the MongoDB ownership filter.
 *
 * Returns { formatUser, userFilter } where:
 *   - formatUser  — ObjectId when the request carries a valid JWT user, null otherwise
 *   - userFilter  — { user: ObjectId }   for authenticated users
 *                   { guestId: string }  for guest sessions
 *                   null                 when neither identity is present
 *
 * Callers must guard against null userFilter before issuing any DB query.
 * Returning null (not {}) is intentional: {} passed to Tasks.find() would
 * match every document in the collection regardless of owner.
 */
const buildUserFilter = (req) => {
  const formatUser =
    req.user && isValidObjectId(req.user.id)
      ? new Types.ObjectId(req.user.id)
      : null;

  const userFilter = formatUser
    ? { user: formatUser }
    : req.guestId
    ? { guestId: req.guestId }
    : null;

  return { formatUser, userFilter };
};

module.exports = { buildUserFilter };
