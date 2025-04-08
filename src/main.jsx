import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "@/chakraui/provider";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Movies from "./pages/movies/Movies";
import Shows from "./pages/tv/Shows";
import Search from "./pages/search/Search";
import DeatailsPagev3 from "@/components/DetailsPagev3";
import { AuthProvider } from "./context/AuthProvider";
import Login from "./pages/Login";
import Watchlist from "./pages/Watchlist";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/movies",
        element: <Movies />,
      },
      {
        path: "/shows",
        element: <Shows />,
      },
      {
        path: "/search",
        element: <Search />,
      },
      {
        path: "/:type/:id", //dynamic path
        element: <DeatailsPagev3 />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/watchlist",
        element: (
          <ProtectedRoute>
            <Watchlist />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  </StrictMode>
);
