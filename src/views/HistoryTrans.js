import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader/Loader';
import { axios } from '../config/https';
import constants from '../util/constans';
import moment from 'moment';
import {
    CardHeader,
    CardBody,
    Card,
    Row,
    Col,
    Table,
    CardTitle,
    CardFooter,
    Pagination,
    PaginationItem,
    PaginationLink
  } from "reactstrap";

function HistoryTrans (props) {   
    const [messagesSent, setMessagesSent] = useState([]);
    const [maxMessagesSent, setMaxMessagesSent] = useState(0);
    const [startMessagesSent, setStartMessagesSent] = useState(0);
    const [amountMessagesSentArray, setAmountMessagesSentArray] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);     

    function getMessageSent(from, to) {
        setLoaderActive(true);
        const start = (25 * (from > 0 ? from  - 1: from));
        setStartMessagesSent(start);
        axios.get(`${constants.apiurl}/api/messagesent?start=${start}&end=${to}${props.year ? `&year=${props.year}`: ''} ${props.month ? `&month=${props.month}` : ''}`).then(result => {
            setMessagesSent(result.data);
            setLoaderActive(false);
        });

        setLoaderActive(true);
        axios.get(`${constants.apiurl}/api/messagesentCount${props.year ? `?year=${props.year}`: ''} ${props.month ? `&month=${props.month}` : ''}`).then(result => {
            const amount = result.data.count;
            const max = Math.ceil(amount/25);
            setLoaderActive(false);
            var rows = [], i = 0, len = max
            while (++i <= len) rows.push(i);
            setAmountMessagesSentArray(rows);
            setMaxMessagesSent(max);
            setLoaderActive(false);
        });
    }
    
    useEffect(() => {
        getMessageSent(0 , 25);
    }, []);

    useEffect(()=>{
        getMessageSent(0 , 25);
    },[props.month]);
    
    
    return <div className="content">
            <Loader active={loaderActive} />
            <Row>                
                <Col lg="12">
                    <Card>
                        <Row>
                            <Col lg="12" md="12">
                                <Card>
                                    <CardHeader>
                                        <CardTitle tag="h4">Historico de transacciones</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <Table className="tablesorter" responsive>
                                            <thead className="text-primary">
                                                <tr>
                                                <th>#</th>
                                                <th>Telefono</th>
                                                <th>Plantilla</th>
                                                <th>Tipo</th>
                                                <th className="text-center">Fecha</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {messagesSent.map((messageSent, index) => 
                                                <tr key={index}>
                                                    <td>{(index + 1) + startMessagesSent }</td>
                                                    <td>{messageSent.phone}</td>
                                                    <td>{messageSent.name}</td>
                                                    <td>{messageSent.type == 1 ? 'Lista de difusion' : 'WebHook'}</td>
                                                    <td className="text-center">{moment(messageSent.creationdate).format('DD-MM-YYYY hh:mm:ss')}</td>
                                                </tr>
                                                )}                   
                                            </tbody>
                                        </Table>
                                    </CardBody>
                                    <CardFooter style={{display:'flex', justifyContent:'center'}}>
                                        <div style={{width:'90%', overflowX:'auto', display: 'flex', justifyContent: 'center'}}>
                                            <Pagination>
                                                <PaginationItem>
                                                    <PaginationLink
                                                    onClick={() => {getMessageSent(0, 25)}}
                                                    first
                                                    href="javascript:void(0)"
                                                    />
                                                </PaginationItem>
                                                {
                                                    amountMessagesSentArray.map((item, index) => 
                                                        <PaginationItem  key={index}>
                                                            <PaginationLink 
                                                            href="javascript:void(0)"
                                                            onClick={() => {getMessageSent(index + 1, 25)}}
                                                            >
                                                            {index + 1}
                                                            </PaginationLink>
                                                    </PaginationItem> 
                                                    )
                                                }                    
                                                <PaginationItem>
                                                    <PaginationLink
                                                    onClick={() => {getMessageSent(maxMessagesSent, 25)}}
                                                    href="javascript:void(0)"
                                                    last
                                                    />
                                                </PaginationItem>
                                            </Pagination>
                                        </div>                                        
                                    </CardFooter>
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>           
            
    </div>;
}

export default HistoryTrans;