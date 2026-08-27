import React from "react";
import { Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";

// core components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Footer from "components/Footer/Footer.js";
import Sidebar from "components/Sidebar/Sidebar.js";

import routes from "routes.js";
import { BackgroundColorContext } from "contexts/BackgroundColorContext";
import { axios } from '../../config/https';
import constants from '../../util/constans';
import { decode } from "util/base64";

var ps;

function getDefaultAdminPath() {
  const encodedUserInfo = localStorage.getItem(constants.userinfo);
  if (!encodedUserInfo) return '/admin/access-denied';

  try {
    const userInfo = JSON.parse(decode(encodedUserInfo));
    const modules = userInfo.modules
      ? String(userInfo.modules).replaceAll(' ', '').split(',').filter(Boolean)
      : [];

    if (modules.length === 1 && modules[0] === '21') return '/admin/documentsCheck';
    if (modules.includes('11')) return '/admin/dashboardconversations';
    if (modules.includes('1')) return '/admin/dashboard';
    if (modules.includes('15')) return '/admin/chatsws';
  } catch (error) {
    console.error('Error parsing user info:', error);
  }

  return '/admin/access-denied';
}

function Admin(props) {
  const location = useLocation();
  const navigate = useNavigate ();
  const mainPanelRef = React.useRef(null);
  const [sidebarOpened, setsidebarOpened] = React.useState(
    document.documentElement.className.indexOf("nav-open") !== -1
  );
  const pathMain = React.useMemo(getDefaultAdminPath, []);
  React.useEffect(() => {
    const token = localStorage.getItem(constants.token);
    if(token) {
      axios.get(`${constants.apiurl}/api/validate/${token}`).then(() => {})
      .catch(error => {
        navigate('/login');
      });
    }else {
      navigate('/login');
    }
  }, [navigate]);
  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      document.documentElement.className += " perfect-scrollbar-on";
      document.documentElement.classList.remove("perfect-scrollbar-off");
      ps = new PerfectScrollbar(mainPanelRef.current, {
        suppressScrollX: true,
      });
      let tables = document.querySelectorAll(".table-responsive");
      for (let i = 0; i < tables.length; i++) {
        ps = new PerfectScrollbar(tables[i]);
      }
    }
    // Specify how to clean up after this effect:
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
        document.documentElement.classList.add("perfect-scrollbar-off");
        document.documentElement.classList.remove("perfect-scrollbar-on");
      }
    };
  }, []);
  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      let tables = document.querySelectorAll(".table-responsive");
      for (let i = 0; i < tables.length; i++) {
        ps = new PerfectScrollbar(tables[i]);
      }
    }
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainPanelRef.current) {
      mainPanelRef.current.scrollTop = 0;
    }
  }, [location]);
  // this function opens and closes the sidebar on small devices
  const toggleSidebar = () => {
    document.documentElement.classList.toggle("nav-open");
    setsidebarOpened(!sidebarOpened);
  };
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/admin") {
        return (
          <Route path={prop.path} element={prop.component} key={key} exact />
        );
      } else {
        return null;
      }
    });
  };
  const getBrandText = (path) => {
    for (let i = 0; i < routes.length; i++) {
      if (location.pathname.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return "Brand";
  };
  return (
    <BackgroundColorContext.Consumer>
      {({ color, changeColor }) => (
        <React.Fragment>
          <div className="wrapper">
            <Sidebar
              routes={routes}
              //logo = undefined I comment this to hide the logo and title in the main menu
              toggleSidebar={toggleSidebar}
            />
            <div className="main-panel" ref={mainPanelRef} data={color}>
              <AdminNavbar
                brandText={getBrandText(location.pathname)}
                toggleSidebar={toggleSidebar}
                sidebarOpened={sidebarOpened}
              />
              <Routes>
                {getRoutes(routes)}
                <Route
                  path="/access-denied"
                  element={pathMain !== '/admin/access-denied' ? (
                    <Navigate to={pathMain} replace />
                  ) : (
                    <div className="content">
                      <div className="card">
                        <div className="card-body">
                          <h4>Usuario sin módulos asignados</h4>
                          <p>Solicita a un administrador que asigne un rol con acceso a esta aplicación.</p>
                        </div>
                      </div>
                    </div>
                  )}
                />
                <Route
                  path="/"
                  element={<Navigate to={pathMain} replace />}
                />
              </Routes>
              {
                // we don't want the Footer to be rendered on map page
                location.pathname === "/admin/maps" ? null : <Footer fluid />
              }
            </div>
          </div>
          {/* <FixedPlugin bgColor={color} handleBgClick={changeColor} />  I comment this to hide the nut to color setup*/}
        </React.Fragment>
      )}
    </BackgroundColorContext.Consumer>
  );
}

export default Admin;
