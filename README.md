# Welcome to Remix Auth OpenID Connect Starter Example

## Get Started
1. Clone the repository and install the dependencies
```bash
git clone
cd remix-auth-openid-connect-starter
npm install
```

2. Start Keycloak server by docker
```bash
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak start-dev
```

3. Create a new client and a new user in keycloak
- Go to "http://localhost:8080/" and login with the admin credentials
- Create a new client
  - Click on "Clients" in the left sidebar
  - Click on "Create" button
  - Fill in the "Client ID" and click on "Next"
  - Turn on Client Authentication and click on "Next"
  - Fill in the "Valid Redirect URIs" with "http://localhost:5173/auth/callback" and click on "Save"
- Create a new user
  - Go to "Users" tab and create a new user
  - Go to "Credentials" tab and set the password for the user

4. Setting up authenticator in Remix
- Open `/app/modules/auth/auth.server.ts`
- Fill in the `client_id` and `client_secret` with the above settings

5. Start the Remix server
```bash
npm run dev
```

6. Open the browser and go to "http://localhost:5173"

Ready to go! 🎉