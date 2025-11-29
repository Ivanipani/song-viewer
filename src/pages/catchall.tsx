/**
 * Catch-all 404 page component.
 *
 * React Router route: Currently commented out in routes.ts
 *
 * Responsibilities:
 * - Handles requests to undefined routes
 * - Throws 404 Response to trigger root ErrorBoundary
 *
 * Note: This route is not currently active in routes.ts.
 * When enabled, it would catch all unmatched routes.
 *
 * No data ownership - immediately throws error.
 * No network calls - static error response.
 */
export default function Component() {
  throw new Response("Page not found", { status: 404 });
}

