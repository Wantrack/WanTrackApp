import Dashboard from "views/Dashboard.js";
import UserProfile from "views/UserProfile.js";
import Users from "views/Users";
import Companies from "views/Companies";
import Company from "views/Company";
import Conversations from "views/Conversations";
import Conversation from "views/Conversation";
import Templates from "views/Templates";
import Template from "views/Template";
import WsTemplates from "views/WsTemplates";
import WsTemplate from "views/WsTemplate";
import ScatterLists from "views/ScatterLists";
import ScatterList from "views/ScatterList";
import Notifications from "views/Notifications";

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
    path: "/conversations",
    name: "Conversaciones",
    icon: "tim-icons icon-chat-33",
    component: <Conversations />,
    layout: "/admin",
    idText: '7'
  },
  {
    path: "/steps",
    name: "Pasos",
    icon: "tim-icons icon-molecule-40",
    component: <Templates />,
    layout: "/admin",
    idText: '10'
  },
  {
    path: "/tables",
    name: "WebHooks",
    icon: "tim-icons icon-cloud-upload-94",
    component: <Notifications />,
    layout: "/admin",
    idText: '8'
  },
  {
    path: "/lists",
    name: "Listas de dispersión",
    icon: "tim-icons icon-notes",
    component: <ScatterLists />,
    layout: "/admin",
    idText: '9'
  },
  {
    path: "/wstemplates",
    name: "Plantillas de Whatsapp",
    icon: "tim-icons icon-bullet-list-67",
    component: <WsTemplates />,
    layout: "/admin",
    idText: '5'
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
  {
    path: "/conversation",
    name: "Conversation",
    component: <Conversation />,
    layout: "/admin",
    invisible: true
  },
  {
    path: "/step",
    name: "Paso",
    component: <Template />,
    layout: "/admin",
    invisible: true
  },
  {
    path: "/wstemplate",
    name: "Plantilla Whastapp",
    component: <WsTemplate />,
    layout: "/admin",
    invisible: true
  },
  {
    path: "/list",
    name: "Lista de dispersion",
    component: <ScatterList />,
    layout: "/admin",
    invisible: true
  }
];
export default routes;
