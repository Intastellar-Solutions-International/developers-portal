import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "inta.dev · Intastellar Developers" },
    {
      name: "description",
      content: "Developer documentation and tools for Intastellar Solutions.",
    },
  ];
}

export default function Home() {
  return <Welcome />;
}
