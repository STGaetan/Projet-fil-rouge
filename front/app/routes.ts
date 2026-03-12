import { createBrowserRouter } from "react-router";
import { AdminLayout } from "./layouts/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { Stagiaires } from "./pages/Stagiaires";
import { Dossiers } from "./pages/Dossiers";
import { Formations } from "./pages/Formations";
import { Absences } from "./pages/Absences";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: ProtectedRoute,
    children: [
      {
        path: "/",
        Component: AdminLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "stagiaires", Component: Stagiaires },
          { path: "formations", Component: Formations },
          { path: "dossiers", Component: Dossiers },
          { path: "absences", Component: Absences },
          { path: "*", Component: Dashboard },
        ],
      }
    ]
  },
]);
