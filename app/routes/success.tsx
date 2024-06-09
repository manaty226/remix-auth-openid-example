import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { authenticator } from "app/modules/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  return user;
}

export default function Success() {
  return (
    <>
      <h1>ログイン成功</h1>
    </>
  );
}
