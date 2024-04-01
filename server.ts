// todo this is resource server where we want to verify the keycloak access token
// example code

const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
  // all the endpoints can be found here: http://localhost:8080/realms/app-realm/.well-known/openid-configuration
  jwksUri:
    "http://localhost:8080/realms/app-realm/protocol/openid-connect/certs",
});

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {}, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    }
  });
}

// Usage example
const token = "your-access-token";
verifyToken(token)
  .then((decoded) => {
    console.log("Token verified:", decoded);
    // Proceed with handling the decoded token
  })
  .catch((error) => {
    console.error("Token verification failed:", error);
    // Handle token verification error
  });
