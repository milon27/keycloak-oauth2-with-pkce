import axios from "axios";

export const KeyCloakAxios = axios.create({
  baseURL: "http://your-api-server.com",
});

KeyCloakAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error response is a 401 and it's not a token refresh request
    if (
      error.response.status === 401 ||
      (error.response.status === 429 && !originalRequest._retry)
    ) {
      originalRequest._retry = true;

      try {
        console.log({ msg: "// Attempt to refresh the token" });

        const tokenEndpoint =
          "http://localhost:8080/realms/app-realm/protocol/openid-connect/token";
        const tokensString = localStorage.getItem("token");
        if (!tokensString) {
          alert("no access token");
          return;
        }
        const tokens = JSON.parse(tokensString) as {
          access_token: string;
          refresh_token: string;
        };

        if (tokens.refresh_token) {
          const requestData = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: tokens.refresh_token,
            client_id: "my-app",
            redirect_uri: "http://localhost:3000",
          });

          const response = await axios.post(tokenEndpoint, requestData);
          const newTokens = response.data as {
            access_token: string;
            refresh_token: string;
          };
          console.log({ newTokens });
          // Update the access token in localStorage
          localStorage.setItem("token", JSON.stringify(newTokens));

          // Retry the original request with the new access token
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${newTokens.access_token}`;
          return axios(originalRequest);
        } else {
          console.log("Refresh token is missing.");
        }
      } catch (refreshError) {
        //   todo: handle logout here
        console.error("Token refresh failed:", refreshError);
      }
    }

    // If token refresh fails or another 401 error occurs after refreshing
    // Handle the error according to your app's requirements
    console.error("Request failed:", error);
    // For example, you can redirect to a logout page or display an error message to the user

    return Promise.reject(error);
  }
);
