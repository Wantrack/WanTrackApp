import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";

// core components
import Login from "components/Auth/Login";

import { BackgroundColorContext } from "contexts/BackgroundColorContext";

var ps;

function RTL(props) {
  
  React.useEffect(() => {   
    
  }); 
  return (
    <div>
      <BackgroundColorContext.Consumer>
        {() => (
          <React.Fragment>
            <div className="wrapper" style={{backgroundImage: "url(./bg.jpg)", backgroundSize: "cover"}}>
              <Login/>
            </div>
          </React.Fragment>
        )}
      </BackgroundColorContext.Consumer>
    </div>
  );
}

export default RTL;
