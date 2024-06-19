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
    const handleClick = () => {
        window.launchWhatsAppSignup();
    };

    return (<div>        
        <button onClick={handleClick} className='btn btn-primary'>Login with Facebook</button>
    </div>       
    );
}

function FacebookSignUp (props) {
    return <div className="content">
             <FbScript/>
    </div>;
}

export default FacebookSignUp;