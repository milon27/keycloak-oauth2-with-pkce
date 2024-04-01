import axios from "axios";
import pkceChallenge from "pkce-challenge";
import { KeyCloakAxios } from "./axios-keycloak";

export default function App() {
  // * 1. get the authorization code using code_challenge_method and codeChallenge hash
  const getAuthCode = async () => {
    // generate codeChallenge,codeVerifier
    const code = await pkceChallenge();
    localStorage.setItem("code", JSON.stringify(code));
    window.location.replace(
      `http://localhost:8080/realms/app-realm/protocol/openid-connect/auth?client_id=my-app&response_type=code&code_challenge=${code.code_challenge}&code_challenge_method=S256&scope=openid&redirect_uri=http://localhost:3000`
    );
  };

  // * 1. get the tokens using codeVerifier string
  const getTokens = () => {
    const urlParams = new URLSearchParams(window.location.search);

    // Retrieve the authorization code from the URL
    const authCode = urlParams.get("code");
    const codeString = localStorage.getItem("code");

    if (!codeString || !authCode) {
      alert("no pkce code verifier or authCode found");
      return;
    }
    const code = JSON.parse(codeString) as {
      code_verifier: string;
      code_challenge: string;
    };
    console.log(code, authCode);
    const requestData = {
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: "http://localhost:3000",
      client_id: "my-app",
      code_verifier: code.code_verifier, // Replace with the actual code verifier
    };

    axios
      .post(
        "http://localhost:8080/realms/app-realm/protocol/openid-connect/token",
        new URLSearchParams(requestData)
      )
      .then((response) => {
        console.log("Token exchange successful:", response.data);
        const tokens = response.data as {
          access_token: string;
          refresh_token: string;
        };
        localStorage.setItem("token", JSON.stringify(tokens));
        // Handle the response data, which typically includes access token, refresh token, etc.
      })
      .catch((error) => {
        console.error("Token exchange failed:", error.response.data);
        // Handle errors
      });
  };

  // * access user info
  const getUserInfo = async () => {
    const tokensString = localStorage.getItem("token");
    if (!tokensString) {
      alert("no access token");
      return;
    }
    const tokens = JSON.parse(tokensString) as {
      access_token: string;
      refresh_token: string;
    };
    const userInfoEndpoint =
      "http://localhost:8080/realms/app-realm/protocol/openid-connect/userinfo";

    try {
      const response = await KeyCloakAxios.get(userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      // Extract user information from the response
      const userInfo = response.data;
      alert(JSON.stringify(userInfo, null, 2));

      // Handle the user information as needed
    } catch (error) {
      console.error("Error fetching user info:", error);
      // Handle errors
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          getAuthCode();
        }}
      >
        login
      </button>
      <button
        onClick={() => {
          getTokens();
        }}
      >
        getTokens
      </button>
      <button
        onClick={() => {
          getUserInfo();
        }}
      >
        getUserInfo
      </button>
    </div>
  );
}
