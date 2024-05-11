import Dashboard from "views/Dashboard.js";
import Notifications from "views/Notifications.js";
import TableList from "views/TableList.js";
import UserProfile from "views/UserProfile.js";
import Users from "views/Users";
import Companies from "views/Companies";
import Company from "views/Company";

var routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "tim-icons icon-chart-pie-36",
    component: <Dashboard />,
    layout: "/admin",
    idText: '1'
  },
  {
    path: "/notifications",
    name: "Conversaciones",
    icon: "tim-icons icon-chat-33",
    component: <Notifications />,
    layout: "/admin",
    idText: '7'
  },
  {
    path: "/tables",
    name: "WebHooks",
    icon: "tim-icons icon-cloud-upload-94",
    component: <TableList />,
    layout: "/admin",
    idText: '8'
  },
  {
    path: "/list",
    name: "Listas de dispersión",
    icon: "tim-icons icon-notes",
    component: <UserProfile />,
    layout: "/admin",
    idText: '9'
  },
  {
    path: "/users",
    name: "Usuarios",
    icon: "tim-icons icon-single-02",
    component: <Users />,
    layout: "/admin",
    idText: '3'
  },
  {
    path: "/companies",
    name: "Empresas",
    icon: "tim-icons icon-components",
    component: <Companies />,
    layout: "/admin",
    idText: '2'
  },
  {
    path: "/user",
    name: "User",
    component: <UserProfile />,
    layout: "/admin",
    invisible: true
  },
  {
    path: "/company",
    name: "Company",
    component: <Company />,
    layout: "/admin",
    invisible: true
  },
];
export default routes;
