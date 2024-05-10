import Dashboard from "views/Dashboard.js";
import Notifications from "views/Notifications.js";
import TableList from "views/TableList.js";
import Typography from "views/Typography.js";
import UserProfile from "views/UserProfile.js";

var routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "tim-icons icon-chart-pie-36",
    component: <Dashboard />,
    layout: "/admin",
  },
  {
    path: "/notifications",
    name: "Conversaciones",
    icon: "tim-icons icon-chat-33",
    component: <Notifications />,
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "WebHooks",
    icon: "tim-icons icon-cloud-upload-94",
    component: <TableList />,
    layout: "/admin",
  },
  {
    path: "/user-profile",
    name: "Listas de dispersión",
    icon: "tim-icons icon-notes",
    component: <UserProfile />,
    layout: "/admin",
  },
  {
    path: "/user-profile",
    name: "Usuarios",
    icon: "tim-icons icon-single-02",
    component: <UserProfile />,
    layout: "/admin",
  },
  {
    path: "/typography",
    name: "Empresas",
    icon: "tim-icons icon-components",
    component: <Typography />,
    layout: "/admin",
  },
];
export default routes;
