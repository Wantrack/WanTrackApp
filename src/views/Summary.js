import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader/Loader';
import { decode } from "../util/base64";
import { axios } from '../config/https';
import constants from '../util/constans';
import {
    Card,
    Row,
    Col
  } from "reactstrap";
import HistoryTrans from './HistoryTrans';

function Summary (props) {
    const [loaderActive, setLoaderActive] = useState(false);
    
    useEffect(() => { 

    }, []);
    
    return <div className="content">
            <Loader active={loaderActive} />
            <Card>
                <Row>
                    <Col lg="12" md="12">
                        <HistoryTrans></HistoryTrans>
                    </Col>
                </Row>
            </Card>
    </div>;
}

export default Summary;