import { Link, createRootRoute, Outlet } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
  component: () => (
    <div className="h-screen bg-gray-50 text-gray-900">
      <header className="flex h-12 items-center justify-between border-b border-gray-200 bg-white px-4">
        <h1 className="text-sm font-semibold">GoJitsu</h1>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            to="/"
            className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            activeProps={{ className: "rounded-md bg-blue-50 px-2 py-1 text-blue-700" }}
          >
            Shipments
          </Link>
          <Link
            to="/assignments"
            className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            activeProps={{ className: "rounded-md bg-blue-50 px-2 py-1 text-blue-700" }}
          >
            Assignments
          </Link>
        </nav>
      </header>
      <main className="h-[calc(100vh-48px)]">
        <Outlet />
      </main>
    </div>
  ),
});
