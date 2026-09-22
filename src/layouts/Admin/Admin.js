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
import { decode, encode } from "util/base64";

function getStoredUserInfo() {
  const encodedUserInfo = localStorage.getItem(constants.userinfo);
  if (!encodedUserInfo) return null;

  try {
    return JSON.parse(decode(encodedUserInfo));
  } catch (error) {
    console.error('Error parsing user info:', error);
    return null;
  }
}

function getDefaultAdminPath(userInfo) {
  const modules = userInfo?.modules
    ? String(userInfo.modules).replaceAll(' ', '').split(',').filter(Boolean)
    : [];

  if (modules.length === 1 && modules[0] === '21') return '/admin/documentsCheck';
  if (modules.includes('11')) return '/admin/dashboardconversations';
  if (modules.includes('1')) return '/admin/dashboard';
  if (modules.includes('15')) return '/admin/chatsws';

  return '/admin/access-denied';
}

function Admin(props) {
  const location = useLocation();
  const navigate = useNavigate ();
  const mainPanelRef = React.useRef(null);
  const [sidebarOpened, setsidebarOpened] = React.useState(
    document.documentElement.className.indexOf("nav-open") !== -1
  );
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );
  const [userInfo, setUserInfo] = React.useState(getStoredUserInfo);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = React.useState(true);
  const pathMain = React.useMemo(() => getDefaultAdminPath(userInfo), [userInfo]);

  React.useEffect(() => {
    const token = localStorage.getItem(constants.token);
    if (!token) {
      navigate('/login');
      return;
    }

    const refreshUserInfo = async () => {
      try {
        await axios.get(`${constants.apiurl}/api/validate/${token}`);

        const storedUserInfo = getStoredUserInfo();
        if (storedUserInfo?.email) {
          try {
            const response = await axios.get(
              `${constants.apiurl}/api/users/getByEmail/${encodeURIComponent(storedUserInfo.email)}`
            );
            localStorage.setItem(constants.userinfo, encode(JSON.stringify(response.data)));
            setUserInfo(response.data);
          } catch (error) {
            console.error('Error refreshing user info:', error);
          }
        }
      } catch (error) {
        navigate('/login');
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    refreshUserInfo();
  }, [navigate]);
  React.useEffect(() => {
    const scrollbarInstances = [];
    if (navigator.platform.indexOf("Win") > -1) {
      document.documentElement.className += " perfect-scrollbar-on";
      document.documentElement.classList.remove("perfect-scrollbar-off");
      if (mainPanelRef.current) {
        scrollbarInstances.push(new PerfectScrollbar(mainPanelRef.current, {
          suppressScrollX: true,
        }));
      }
    }
    // Specify how to clean up after this effect:
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        scrollbarInstances.forEach((instance) => instance.destroy());
        document.documentElement.classList.add("perfect-scrollbar-off");
        document.documentElement.classList.remove("perfect-scrollbar-on");
      }
    };
  }, []);
  React.useEffect(() => {
    const tableScrollbars = [];
    if (navigator.platform.indexOf("Win") > -1) {
      let tables = document.querySelectorAll(".table-responsive");
      for (let i = 0; i < tables.length; i++) {
        if (tables[i]) tableScrollbars.push(new PerfectScrollbar(tables[i]));
      }
    }
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainPanelRef.current) {
      mainPanelRef.current.scrollTop = 0;
    }
    return () => tableScrollbars.forEach((instance) => instance.destroy());
  }, [location]);
  // this function opens and closes the sidebar on small devices
  const toggleSidebar = () => {
    document.documentElement.classList.toggle("nav-open");
    setsidebarOpened(!sidebarOpened);
  };
  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((collapsed) => {
      const nextCollapsed = !collapsed;
      localStorage.setItem("sidebar-collapsed", String(nextCollapsed));
      return nextCollapsed;
    });
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

  if (isLoadingUserInfo) return null;

  return (
    <BackgroundColorContext.Consumer>
      {({ color, changeColor }) => (
        <React.Fragment>
          <div className={`wrapper${sidebarCollapsed ? " sidebar-mini" : ""}`}>
            <Sidebar
              routes={routes}
              //logo = undefined I comment this to hide the logo and title in the main menu
              toggleSidebar={toggleSidebar}
              sidebarCollapsed={sidebarCollapsed}
              toggleSidebarCollapsed={toggleSidebarCollapsed}
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
