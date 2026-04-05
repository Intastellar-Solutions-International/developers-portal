import { data } from "react-router";

import type { Route } from "./+types/$";
import { NotFoundPage } from "~/components/not-found-page";

export async function loader(_args: Route.LoaderArgs) {
  return data(null, { status: 404 });
}

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Page not found · inta.dev" },
    { name: "robots", content: "noindex" },
    {
      name: "description",
      content: "This page does not exist on inta.dev.",
    },
  ];
}

export default function NotFoundRoute() {
  return <NotFoundPage />;
}
