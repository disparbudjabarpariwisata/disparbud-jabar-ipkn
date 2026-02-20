import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./pages/Home";
import Videos from "./pages/Videos";
import Directory from "./pages/Directory";
import Regulations from "./pages/Regulations";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "videos", Component: Videos },
      { path: "directory", Component: Directory },
      { path: "regulations", Component: Regulations },
      { path: "*", Component: NotFound },
    ],
  },
]);