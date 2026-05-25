import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useMatches,
} from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-strong rounded-3xl p-10">
        <h1 className="text-7xl font-display font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Signal lost</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That coordinate isn't on our climate grid.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-aurora px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Return to base
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-strong rounded-3xl p-10">
        <h1 className="text-xl font-semibold">Atmospheric anomaly</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-xl bg-aurora px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function RouteHead() {
  const matches = useMatches();
  useEffect(() => {
    // Walk from deepest match upward to find a head() with a title.
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i] as unknown as {
        staticData?: unknown;
        routeId?: string;
        // TanStack stores route options on the underlying route, but the head fn
        // is evaluated and exposed on the match meta. We fall back to scanning meta.
        meta?: Array<{ title?: string; name?: string; content?: string }>;
      };
      const meta = m.meta;
      if (Array.isArray(meta)) {
        const titleEntry = meta.find((x) => x && typeof x.title === "string");
        if (titleEntry?.title) {
          document.title = titleEntry.title;
          return;
        }
      }
    }
    document.title = "Aether — AI Climate Intelligence";
  }, [matches]);
  return null;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  return (
    <>
      <RouteHead />
      <Outlet />
    </>
  );
}
