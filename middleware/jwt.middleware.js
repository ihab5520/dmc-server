// import jwt from "express-jwt";
const { expressjwt: jwt } = require("express-jwt");

// jwt gets and object, decodes it, verifies it and sends back a boolean
// jwt will very the signature using secret, knowing that the token was signed using this algorithm, will see if there is a payload inside the token, and then will do somethig with it
const isAuthenticated = jwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ["HS256"],
  requestProperty: "payload",
  getToken: getTokenFromHeaders, 
});

function getTokenFromHeaders(req) {
  // Check if the token is available on the request Headers
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    // Get the encoded token string and return it
    const token = req.headers.authorization.split(" ")[1];
    return token;
  }

  return null;
}
     module.exports = { isAuthenticated };


