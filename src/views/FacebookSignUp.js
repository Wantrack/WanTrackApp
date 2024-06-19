import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';

import { axios } from '../config/https';
import constants from '../util/constans';

import {
    CardHeader,
    CardBody,
    Card
  } from "reactstrap";

function FbScript() {
    return (<div>        
        <script>
             window.fbAsyncInit = function () {
                FB.init({
                    appId:    '444020324848448', 
                    cookie:   true, 
                    xfbml:    true, 
                    version:  'v20.0' 
                })
            }
        </script>        
    </div>       
    );
}

function FacebookSignUp (props) {
    return <div className="content">
             <FbScript/>
    </div>;
}

export default FacebookSignUp;