import jwt from "jsonwebtoken";

export const sendJWTToken = (res, user, message, statusCode = 200) => {
  // const jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
  const jwtToken = jwt.sign(
    { _id: user._id },
    "oinfiosdfnodsifisnfosifsnodfsino",
    {
      expiresIn: "2d",
    }
  );

  res
    .status(statusCode)
    .cookie("authToken", jwtToken, {
      expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      sameSite: "none",
      // for development false
      secure: true,
      httpOnly: true,
    })
    .json({
      success: true,
      message,
      user,
    });
};
