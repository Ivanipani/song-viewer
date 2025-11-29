import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  route("/", "./pages/player/layout.tsx", [
    index("./pages/player/index.tsx"),
  ]),
  // route("*?", "./pages/player/layout.tsx", [
  //   index("./pages/player/index.tsx"),
  //   route("player", "./pages/player/full-player.tsx"),
  // ]),
] satisfies RouteConfig;
