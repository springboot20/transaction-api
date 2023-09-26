export const createUserToken = (user) => {
  return { username: user.username, userId: user._id, role: user.role };
};
