import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "app/modules/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.authenticate("keycloak", request, {
    successRedirect: "/success",
    failureRedirect: "/",
  });
}

export default function Calback() {
  return <></>;
}
