import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { buildHomePageMeta } from "~/lib/seo";

export function meta({ location }: Route.MetaArgs) {
  return buildHomePageMeta(location.pathname);
}

export default function Home() {
  return <Welcome />;
}
