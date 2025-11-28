import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  route("/", "./pages/player.tsx", [
    index("./pages/player/index.tsx"),
    route("player", "./pages/player/full-player.tsx"),
  ]),
  route("*?", "catchall.tsx"),
] satisfies RouteConfig;
