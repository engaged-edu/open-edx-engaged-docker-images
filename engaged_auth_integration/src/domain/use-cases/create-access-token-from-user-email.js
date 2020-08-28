

exports.createAccessTokenFromUserEmailFactory = ({ AppError, createUserAccessToken, fetchUserFromOpenEdx }) => {
  return {
    createAccessTokenFromUserEmail: async ({ email } = {}) => {
      const { user } = await fetchUserFromOpenEdx({ email });
      if(!user) {
        //throw error
      }
      const { accessToken } = await createUserAccessToken({ userId: user.id });
      return { user, accessToken };
    }
  }
}
