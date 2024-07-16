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
import Feelings from "views/Feelings";
import FacebookSignUp from "views/FacebookSignUp";
import Chats from "views/Chats";
import Chat from "views/Chat";
import Summary from "views/Summary";
import WebHooks from "views/WebHooks";
import WebHookMessage from "views/WebHookMessage";
import Advisors from "views/Advisors";
import Advisor from "views/Advisor";
import Calls from "views/Calls";

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
    type: 'separator',
    idText: '1'
  },
  {
    path: "/conversations",
    name: "Conversaciones",
    icon: "tim-icons icon-vector",
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
    path: "/chatsws",
    name: "Chat",
    icon: "tim-icons icon-chat-33",
    component: < Chats/>,
    layout: "/admin", 
    idText: '15'
  },
  {  
    type: 'separator',
    idText: '15'
  },
  {
    path: "/webhooks",
    name: "WebHooks",
    icon: "tim-icons icon-cloud-upload-94",
    component: <WebHooks />,
    layout: "/admin",
    idText: '8'
  },
  {
    path: "/lists",
    name: "Listas de difusión",
    icon: "tim-icons icon-notes",
    component: <ScatterLists />,
    layout: "/admin",
    idText: '9'
  },
  {  
    type: 'separator',
    idText: '9'
  },
  {
    path: "/wstemplates",
    name: "Plantillas de Whatsapp",
    icon: "tim-icons icon-puzzle-10",
    component: <WsTemplates />,
    layout: "/admin",
    idText: '5'
  },
  {
    path: "/wstemplates",
    name: "Plantillas de Email",
    icon: "tim-icons icon-email-85",
    component: <WsTemplates />,
    layout: "/admin",
    idText: '12'
  }, 
  {
    path: "/wstemplates",
    name: "Plantillas de SMS",
    icon: "tim-icons icon-mobile",
    component: <WsTemplates />,
    layout: "/admin",
    idText: '13'
  },
  {  
    type: 'separator',
    idText: '13'
  },
  {
    path: "/fbsignup",
    name: "Registrar cliente Meta",
    icon: "tim-icons icon-badge",
    component: < FacebookSignUp/>,
    layout: "/admin", 
    idText: '14'
  },
  {  
    type: 'separator',
    idText: '14'
  },
  {
    path: "/summary",
    name: "Consumos",
    icon: "tim-icons icon-money-coins",
    component: <Summary />,
    layout: "/admin",
    idText: '16'
  },
  {  
    type: 'separator',
    idText: '16'
  },
  {
    path: "/feelings",
    name: "AI Sentimientos Banco de pruebas",
    icon: "tim-icons icon-satisfied",
    component: < Feelings/>,
    layout: "/admin", 
    idText: '11'
  },
  {
    path: "/calls",
    name: "Llamadas",
    icon: "tim-icons icon-mobile",
    component: < Calls/>,
    layout: "/admin", 
    idText: '11'
  },
  {
    path: "/advisors",
    name: "Agentes",
    icon: "tim-icons icon-headphones",
    component: < Advisors/>,
    layout: "/admin", 
    idText: '11'
  },
  {  
    type: 'separator',
    idText: '11'
  },{
    path: "/advisors",
    name: "Lead Automatization",
    icon: "tim-icons icon-spaceship",
    component: < Advisors/>,
    layout: "/admin", 
    idText: '17'
  },{
    path: "/advisors",
    name: "Asesores Lead",
    icon: "tim-icons icon-badge",
    component: < Advisors/>,
    layout: "/admin", 
    idText: '18'
  },
  {  
    type: 'separator',
    idText: '18'
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
  },
  {
    path: "/chat",
    name: "Chat",
    component: < Chat/>,
    layout: "/admin", 
    invisible: true
  },
  {
    path: "/webhook",
    name: "Webhook",
    component: < WebHookMessage/>,
    layout: "/admin", 
    invisible: true
  },
  {
    path: "/advisor",
    name: "Advisor",
    component: < Advisor/>,
    layout: "/admin", 
    invisible: true
  }
];
export default routes;
