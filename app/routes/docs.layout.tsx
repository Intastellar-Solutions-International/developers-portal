import { Outlet } from "react-router";

export default function DocsLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Outlet />
    </div>
  );
}
