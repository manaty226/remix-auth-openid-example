import { redirect } from "react-router";
import { Authenticator } from "remix-auth";
import { OIDCStrategy } from "remix-auth-openid";
import { clearSession, getSession, setSession } from "./auth-session.server";

export interface User extends OIDCStrategy.BaseUser {
    name?: string;
}

let authenticator = new Authenticator<User>();
const strategy = await OIDCStrategy.init<User>({
    issuer: "http://localhost:8080/realms/master",
    client_id: "test-client",
    client_secret: "0zjWQhiY7kGGkY5HecAp7cTrQ7vD8U09",
    redirect_uris: ["http://localhost:5173/auth/callback"],
    post_logout_redirect_uris: ["http://localhost:/login"],
    scopes: ["openid"],
}, async ({tokens, request}): Promise<User> => {

    if (!tokens.id_token) {
        throw new Error("No id_token in response");
    }

    if (!tokens.access_token) {
        throw new Error("No access_token in response");
    }

    return {
        sub: tokens.claims().sub,
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
        refreshToken: tokens.refresh_token,
        expiredAt: Math.floor(new Date().getTime() / 1000) + (tokens.expires_in ?? 0),
    }
})

authenticator.use(strategy, "keycloak");

async function getUserSession(request:Request): Promise<User | null> {
    const user = await getSession<User>(request);
    console.log("[getUserSession] user is", user);
    if (!user) {
        try {
            const user = await authenticator.authenticate("keycloak", request);
            const headers = await setSession(request, user);
            throw redirect("/success", { headers: headers });
        } catch(e) {
            if (e instanceof Response) {
                throw e;
            }
            console.error(e)
            throw redirect("/");
        }
    }
    return user
}

async function logout(request: Request) {
    const user = await getUserSession(request);
    if (!user) {
        return redirect("/login");
    }

    try {
        await strategy.postLogoutUrl(user.idToken ?? "");
        const header = await clearSession(request);
        throw redirect("/login", { headers: header });
    } catch(e) {
        if (e instanceof Response) {
            return e;
        }
        throw e;
    }
}

export { authenticator, getUserSession, logout };
