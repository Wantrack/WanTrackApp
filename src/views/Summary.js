import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader/Loader';
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
    const [amountMessagesSent, setAmountMessagesSent] = useState(0);

    useEffect(() => { 
        setLoaderActive(true);
        axios.get(`${constants.apiurl}/api/messagesentCount`).then(result => {
            const amount = result.data.count;
            setAmountMessagesSent(amount);
            setLoaderActive(false);
        });
    }, []);
    
    return <div className="content">
            <Loader active={loaderActive} />
            <Card>
                <Row>
                    <Col lg="12">
                    <Row>
                            <Col lg="4">
                                <Card className='cardData'>
                                    <h4><i className="fa-solid fa-paper-plane"></i> Mensajes enviados: </h4>
                                    <h1>{amountMessagesSent}</h1>
                                </Card>
                            </Col>
                            <Col lg="4">
                                <Card className='cardData'>
                                    <h4><i class="fa-solid fa-coins"></i>Saldo actual: </h4>
                                    <h1>$ {(amountMessagesSent * 50).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h1>
                                </Card>
                            </Col>
                            <Col lg="4">
                                <Card className='cardData'>
                                    <h4><i class="fa-solid fa-coins"></i>Facturación minima: </h4>
                                    <h1>$ 400,000</h1>
                                </Card>
                            </Col>
                    </Row>
                    </Col>
                    <Col lg="12" md="12">
                        <HistoryTrans></HistoryTrans>
                    </Col>
                </Row>
            </Card>
    </div>;
}

export default Summary;