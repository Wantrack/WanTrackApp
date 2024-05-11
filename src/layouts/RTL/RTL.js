import React from "react";

// core components
import Login from "components/Auth/Login";

import { BackgroundColorContext } from "contexts/BackgroundColorContext";

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
