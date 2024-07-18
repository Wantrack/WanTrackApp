import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader/Loader';
import { axios } from '../config/https';
import constants from '../util/constans';
import { Link } from "react-router-dom";
import {
    Card,
    Row,
    Col
  } from "reactstrap";
import HistoryTrans from './HistoryTrans';
import { func } from 'prop-types';

function Summary (props) {
    const [loaderActive, setLoaderActive] = useState(false);
    const [amountMessagesSent, setAmountMessagesSent] = useState(0);
    const [months] = useState(["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]);
    const [monthsIndex] = useState([1,2,3,4,5,6,7,8,9,10,11,12]);
    const [selectedIndexMonth, setSelectedIndexMonth] = useState(new Date().getMonth()+1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => { 
        loadData(selectedYear, selectedIndexMonth)
    }, []);

    async function loadData(year, month) {
        setLoaderActive(true);
        axios.get(`${constants.apiurl}/api/messagesentCountByYearMonth/${year}/${month}`).then(result => {
            const amount = result.data.count;
            setAmountMessagesSent(amount);
            setLoaderActive(false);
        });
    }

    function changeMonth(monthIndex) {
        setSelectedIndexMonth(pre => {
            let resultMonth = pre + monthIndex;

            if(resultMonth > 1 && resultMonth < 13) {
                loadData(selectedYear, resultMonth);
            }

            if(resultMonth < 1) {
                resultMonth = 12;
                setSelectedYear(prey => {
                    let resultYear = prey - 1;
                    console.log(resultYear)
                    loadData(prey, resultMonth);
                    return resultYear;
                })
            }   

            if(resultMonth > 12) {
                resultMonth = 1;
                setSelectedYear(prey => {
                    let resultYear = prey + 1;
                    loadData(prey, resultMonth);
                    return resultYear;
                })
            }

            return resultMonth;
        });        

        
    }
    
    return <div className="content">
            <Loader active={loaderActive} />
            <Card>
                <Row>
                    <Col className='month_summary' lg="12">
                        <div>
                            <Link to="javascript:void(0)" onClick={()=>{changeMonth(-1)}}>
                                <i className="fa-solid fa-arrow-left month_summary_arrow"></i>
                            </Link>
                        </div>
                        <div className='year_month_summary'>
                            <h1>{months[selectedIndexMonth-1]}</h1>
                            <h6>{selectedYear}</h6>
                        </div>
                        <div>
                            <Link to="javascript:void(0)" onClick={()=>{changeMonth(1)}}>
                                <i className="fa-solid fa-arrow-right month_summary_arrow"></i>
                            </Link>                            
                        </div>
                    </Col>
                </Row>
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
                                    <h4><i className="fa-solid fa-coins"></i>Saldo actual: </h4>
                                    <h1>$ {(amountMessagesSent * 50).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h1>
                                </Card>
                            </Col>
                            <Col lg="4">
                                <Card className='cardData'>
                                    <h4><i className="fa-solid fa-coins"></i>Facturación minima: </h4>
                                    <h1>$ 400,000</h1>
                                </Card>
                            </Col>
                    </Row>
                    </Col>
                    <Col lg="12" md="12">
                        <HistoryTrans year={selectedYear} month={selectedIndexMonth}></HistoryTrans>
                    </Col>
                </Row>
            </Card>
    </div>;
}

export default Summary;