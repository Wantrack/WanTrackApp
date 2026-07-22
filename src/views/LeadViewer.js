import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader/Loader';
import TablePagination, { useClientPagination } from '../components/Pagination/TablePagination';
import { axios } from '../config/https';
import constants from '../util/constans';
import {
    CardHeader,
    CardBody,
    Card
  } from "reactstrap";

function LeadViewer (props) {
    const [body, setBody] = useState([]);
    const [header, setHeader] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [currentleadName, setCurrentleadName] = useState('');
    const pagination = useClientPagination(body);
    
    useEffect(() => {  
        setLoaderActive(true);
        const currentleadID = localStorage.getItem('currentleadID');
        const _currentleadName = localStorage.getItem('currentleadName');
        setCurrentleadName(_currentleadName);
        axios.get(`${constants.apiurl}/api/leadsflows/${currentleadID}`).then(result => {
            const headers = [];
            let body = [];
            const data = result.data;

            if(data && Array.isArray(data) && data.length > 0) {
                const answer = JSON.parse(data[0].answer);
                for (const [key] of Object.entries(answer)) {
                    headers.push(key);
                }

                const tempdata = data.map(d => JSON.parse(d.answer));
                body =  tempdata.map(tmpdata => headers.map(header => tmpdata[header]));
            }
            setHeader(headers);
            setBody(body);
            setLoaderActive(false);            
        });
    }, []);       
    
    return <div className="content">
                <Loader active={loaderActive} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Visor de lead - {currentleadName}</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">                           
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>       
                                        {
                                        header.map((item, index) => 
                                            <th  key={index}> {item}</th>
                                        )}                      
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagination.paginatedItems.map((item, index) => 
                                        <tr key={index}>
                                             {                                                
                                                item.map((i, index2) => 
                                                    <td  key={index2}> {i}</td>
                                            )}
                                        </tr>
                                    )}
                                </tbody>          
                            </table>
                        </div> 
                        <TablePagination {...pagination} />
                    </CardBody>
                </Card>
    </div>;
}

export default LeadViewer;
