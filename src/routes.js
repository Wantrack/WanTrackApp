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
import DashboardConversation from "views/DashboardConversation";
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
import LeadsCenter from "views/LeadsCenter";
import LeadViewer from "views/LeadViewer";
import WhatsAppAccount from "views/WhatsAppAccount";
import Automatizations from "views/Automatizations";
import Automatization from "views/Automatization,";
import EmailTemplates from "views/EmailTemplates";
import EmailTemplate from "views/EmailTemplate";
import DocumentsCheck from "views/DocumentsCheck";
import DocumentCheck from "views/DocumentCheck";

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
    idSep: '1'
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
    type: 'separator',
    idSep: '7'
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
    type: 'separator',
    idSep: '10'
  },
  {
    path: "/chatsws",
    name: "Chat",
    icon: "tim-icons icon-chat-33",
    component: < Chats/>,
    layout: "/admin", 
    idSep: '15'
  },
  {  
    type: 'separator',
    idText: '15'
  },
  {
    path: "/webhooks",
    name: "WebHooks",
    icon: "fa-solid fa-network-wired",
    component: <WebHooks />,
    layout: "/admin",
    idText: '8'
  },
  {  
    type: 'separator',
    idSep: '8'
  },
  {
    path: "/lists",
    name: "Campañas de WhastApp",
    icon: "fa-brands fa-whatsapp",
    component: <ScatterLists />,
    layout: "/admin",
    idText: '9'
  },
  {  
    type: 'separator',
    idSep: '9'
  },
  {
    path: "/emailcampaing",
    name: "Campañas de Email",
    icon: "fa-solid fa-envelopes-bulk",
    component: <Companies />,
    layout: "/admin",
    idText: '23'
  },
  {  
    type: 'separator',
    idSep: '23'
  }, 
  {
    path: "/leadsCenter",
    name: "Leads Center",
    icon: "fa-solid fa-users-line",
    component: <LeadsCenter />,
    layout: "/admin",
    idText: '24'
  },
  {  
    type: 'separator',
    idSep: '9'
  },
  {
    path: "/automatizations",
    name: "Automatizacion",
    icon: "fa-solid fa-robot",
    component: <Automatizations />,
    layout: "/admin",
    idText: '25'
  },
  {  
    type: 'separator',
    idSep: '9'
  },
  {
    path: "/wstemplates",
    name: "Plantillas de Whatsapp",
    icon: "fa-brands fa-square-whatsapp",
    component: <WsTemplates />,
    layout: "/admin",
    idText: '5'
  },
  {  
    type: 'separator',
    idSep: '5'
  },
  {
    path: "/emailtemplates",
    name: "Plantillas de Email",
    icon: "fa-solid fa-square-envelope",
    component: <EmailTemplates />,
    layout: "/admin",
    idText: '12'    
  },
  {  
    type: 'separator',
    idSep: '12'
  }, 
  {
    path: "/wstemplates",
    name: "Plantillas de SMS",
    icon: "tim-icons icon-mobile",
    component: <WsTemplates />,
    layout: "/admin",
    idText: '13',
    invisible: true
  },
  {  
    type: 'separator',
    idSep: '13',
    invisible: true
  },
  {
    path: "/fbsignup",
    name: "Registrar cliente Meta",
    icon: "fa-brands fa-meta",
    component: < FacebookSignUp/>,
    layout: "/admin", 
    idText: '14'
  },
  {  
    type: 'separator',
    idSep: '14'
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
    idSep: '16'
  },
  {
    path: "/dashboardconversations",
    name: "Dashboard",
    icon: "tim-icons icon-chart-bar-32",
    component: <DashboardConversation />,
    layout: "/admin",
    idText: '11'
  },
  {  
    type: 'separator',
    idSep: '11'
  },
  {
    path: "/feelings",
    name: "AI Sentimientos Banco de pruebas",
    icon: "tim-icons icon-satisfied",
    component: < Feelings/>,
    layout: "/admin", 
    idText: '19'
  },
  {  
    type: 'separator',
    idSep: '19'
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
    type: 'separator',
    idSep: '11'
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
    idSep: '11'
  },{
    path: "/advisors",
    name: "Lead Automatization",
    icon: "tim-icons icon-spaceship",
    component: < Advisors/>,
    layout: "/admin", 
    idText: '17'
  },
  {  
    type: 'separator',
    idSep: '17'
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
    idSep: '18'
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
    type: 'separator',
    idSep: '3'
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
    type: 'separator',
    idSep: '2'
  },
  {
    path: "/documentsCheck",
    name: "Verifi. Documentos",
    icon: "fa-solid fa-file-circle-check",
    component: <DocumentsCheck />,
    layout: "/admin",
    idText: '21'
  },
  {  
    type: 'separator',
    idSep: '21'
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
    path: "/emailtemplate",
    name: "Plantilla Email",
    component: <EmailTemplate />,
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
  },
  {
    path: "/leadviewer",
    name: "Leads Center",
    icon: "tim-icons icon-single-copy-04",
    component: <LeadViewer />,
    layout: "/admin",
    invisible: true
  },
  {
    path: "/whatsappaccount",
    name: "WhatsAppAccount",
    icon: "tim-icons icon-single-copy-04",
    component: <WhatsAppAccount />,
    layout: "/admin",
    invisible: true
  },
  {
    path: "/automatization",
    name: "Automatizacion",
    icon: "tim-icons icon-single-copy-04",
    component: <Automatization />,
    layout: "/admin",
    invisible: true
  },
  {
    path: "/documentCheck",
    name: "Document Check",
    icon: "tim-icons icon-single-copy-04",
    component: <DocumentCheck />,
    layout: "/admin",
    invisible: true
  }
];
export default routes;
