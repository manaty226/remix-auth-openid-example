import type { LoaderFunctionArgs } from "react-router";
import { authenticator } from "app/modules/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
    return await authenticator.authenticate("keycloak", request);
}

export default function Login() {
    return <></>;
}
