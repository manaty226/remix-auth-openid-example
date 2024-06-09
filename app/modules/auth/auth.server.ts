import { Authenticator } from "remix-auth";
import type { SessionStorage, Session, SessionData } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { authSessionStorage } from "./auth-session.server";
import { OIDCStrategy } from "remix-auth-openid";
import type { OIDCStrategyBaseUser } from "remix-auth-openid";

interface User extends OIDCStrategyBaseUser {
    name?: string;
}

let authenticator = new Authenticator<User>(authSessionStorage, {});
const strategy = await OIDCStrategy.init<User>({
    issuer: "http://localhost:8080/realms/master",
    client_id: "YOUR CLIENT ID",
    client_secret: "<YOUR CLIENT SECRET>",
    redirect_uris: ["http://localhost:5173/auth/callback"],
    scopes: ["openid"],
}, async ({tokens, request}): Promise<User> => {

    if (!tokens.id_token) {
        throw new Error("No id_token in response");
    }

    if (!tokens.access_token) {
        throw new Error("No access_token in response");
    }

    return {
        ...tokens.claims(),
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
        refreshToken: tokens.refresh_token,
        expiredAt: new Date().getTime() / 1000 + (tokens.expires_in ?? 0),
    }
})

authenticator.use(strategy, "keycloak");

interface UserSession {
    user: User;
    session: Session<SessionData, SessionData>
}

async function getSession(request:Request): Promise<UserSession> {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    })

    const session = await authSessionStorage.getSession(request.headers.get("Cookie"));

    // refresh access_token if the expiration is approaching
    if (user.expiredAt < new Date().getTime() + 60 * 1000) {
        const tokens = await strategy.refresh(user.refreshToken ?? "", {failureRedirect: "/login"});
        if (!tokens || !tokens?.access_token) {
            return await authenticator.logout(request, {redirectTo: "/login"});
        }
        const newUser = {...user, accessToken: tokens.access_token, refreshToken: tokens.refresh_token};
        session.set(authenticator.sessionKey, newUser);
        await authSessionStorage.commitSession(session);
        return {user: newUser, session}
    }

    return {user, session}
}

async function logout(request: Request) {
    const user = await authenticator.isAuthenticated(request);
    if (!user) {
        return await authenticator.logout(request, {redirectTo: "/login"});
    }
    const redirectTo = strategy.logoutUrl(user.idToken ?? "");
    return await authenticator.logout(request, {redirectTo: redirectTo})
}

export { authenticator, getSession, logout };