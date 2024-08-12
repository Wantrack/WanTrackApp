import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import { decode } from "../util/base64";
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
    
    useEffect(() => {  
        setLoaderActive(true);
        const currentleadID = localStorage.getItem('currentleadID');
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
                        <h5 className="title">Visor de lead</h5>
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
                                    {body.map((item, index) => 
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
                    </CardBody>
                </Card>
    </div>;
}

export default LeadViewer;