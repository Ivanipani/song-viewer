import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  route("/", "./pages/player/layout.tsx", [
    index("./pages/player/ContentArea.tsx"),
  ]),
] satisfies RouteConfig;
