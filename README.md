### KeyCloak authentication with authorization code flow/ standard flow with Proof Key for Code Exchange Code (PKCE)

## how i did it.

#### Configure the KeyCloak dashboard using docker (KeyCloak will be running on https://localhost:8080)

```yml
# docker-compose.yml

version: "3.8"
services:
  keycloak:
    container_name: keycloak
    image: quay.io/keycloak/keycloak:24.0.1
    ports:
      - 8080:8080
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
      # - DB_VENDOR=mysql
      # - DB_ADDR=mysql:3008
      # - DB_DATABASE=test
      # - DB_USER=keycloak
      # - DB_PASSWORD=myPassword
    command: ["start-dev"]
```

![login page](/screenshot/login.png)

#### Create new realm by giving a name

![realm](/screenshot/add-realm.png)

#### Create new client/application

> - step 1:

- select your realm from dropdown
- click on clients
- click on create clients
- make sure keep client type = openid connect and give a client ID
  ![client](/screenshot/add-client-1.png)

> - step 2:

- select standard flow/ authorization code flow only and click next.
  ![client](/screenshot/add-client-2.png)

> - step 3:

- add the redirect uri and logout uri and web origin and click save.
  ![client](/screenshot/add-client-3.png)

#### Enable PKCE in client/application (select S256 as challenge method)

![pkce](/screenshot/pkce-1.png)
![pkce](/screenshot/pkce-2.png)

# Handle Refresh Token & Access Token Expire Time

- Refresh Token: go to realm setting and click on session
- i am setting 365 days as expire time for refresh token (this could be around 7 days as well because when we generate a new access token it will also generate a new refresh token so if user is using the app his refresh token will not expire.)
  ![pkce](/screenshot/rt.png)

- Access Token: go to realm setting and click on tokens
- i am enabling revoke refresh token so that one refresh token can only be used once
- i am setting 1 hour as expire time for access token
  ![pkce](/screenshot/at.png)

# all done with the keycloak config

# Now in App.tsx file follow this 3 step

1. get the authorization code using code_challenge_method and codeChallenge hash
1. get the tokens using codeVerifier string
1. access user info

- for handling the refresh token we are using axios interceptor when we got 401 we try to get new access + refresh token.

# additional stuff

1. in the backend you can verify the jwt access token example code is in server.ts file
