import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';

import { axios } from '../config/https';
import constants from '../util/constans';
import MetaFlow from "./MetaFlow";

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
        <button onClick={handleClick} className='btn btn-primary'>Iniciar registro a meta</button>
    </div>       
    );
}

function FacebookSignUp (props) {
    return <div className="content">
             <FbScript/>
             <MetaFlow/>
    </div>;
}

export default FacebookSignUp;