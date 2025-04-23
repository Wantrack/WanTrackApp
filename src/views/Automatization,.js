import React, { useCallback, useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import ReactFlow, {
    MiniMap,
    ReactFlowProvider,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Position,
    Handle
} from 'reactflow';
import 'reactflow/dist/style.css';

import { axios } from '../config/https';
import constants from '../util/constans';

function Automatization (props) {

  const [loaderActive, setLoaderActive] = useState(false);

const CustomNode = ({ data, selected }) => (
    <div className={`bg-white border-2 rounded-xl shadow-lg px-4 py-3 min-w-[200px] text-sm ${
      selected ? 'border-blue-500' : 'border-gray-300'
    }`}
    style={{ pointerEvents: 'all' }}>
      <Handle type="source" id='right' position={Position.Right} />
      <Handle type="target" id='left' position={Position.Left} />
      <Handle type="target" id='right' position={Position.Right} />
      <Handle type="source" id='left' position={Position.Left} />
      <h6 className="text-base font-semibold text-gray-800">
          {data.label} 
          {data.icon && ( <i style={{marginTop: '0px', marginLeft: '10px'}} className={`${data.icon} my-float`}></i> )}
      </h6>
      {data.description && (
          <p className="text-xs text-gray-500 mt-1">{data.description}</p>
        )}
         <Handle type="source" id='top' position={Position.Top} />
         <Handle type="target" id='top' position={Position.Top} />
         <Handle type="target" id='bottom' position={Position.Bottom} />
         <Handle type="source" id='bottom' position={Position.Bottom} />      
    </div>
  );

  async function send(event) {
    event.preventDefault();
    setLoaderActive(true)
    await axios.post(`${constants.apiurl}/api/executeFlow/117`);
    setLoaderActive(false)
  }
  
  const nodeTypes = {
    custom: CustomNode,
  };
  
  const _nodes = [
    {
      id: '1',
      type: 'custom',
      position: { x: 0, y: 200 },
      data: { label: 'Base de datos de clientes' },
      style: { backgroundColor: '#3FAE2A', color: '#000' },
    },
    {
      id: '2',
      type: 'custom',
      position: { x: 400, y: 200 },
      data: { label: 'Envio mensajes de Whatsapp', description: 'pocrigs', icon: 'fa-brands fa-whatsapp'},
    },
    {
      id: '3',
      type: 'custom',
      position: { x: 400, y: 0 },
      data: { label: 'Solicitud de agendamiento de cita' },
    },
    {
      id: '4',
      type: 'custom',
      position: { x: 950, y: 200 },
      data: { label: 'Esperar 2 horas', description: 'lambda timer 2 hours', icon: 'fa-solid fa-clock' },
    },
    {
      id: '5',
      type: 'custom',
      position: { x: 450, y: 400 },
      data: { label: 'Envio de email', description: 'pocrigs', icon: 'fa-solid fa-envelope' },
    },
    {
      id: '6',
      type: 'custom',
      position: { x: 400, y: 600 },
      data: { label: 'Solicitud de agendamiento de cita' },
    },
  ];
  
  
  const _edges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      label: 'Envío Exitoso y leído',
      sourceHandle: 'top',
      targetHandle: 'bottom',
      animated: true,
      labelBgPadding: [8, 4],
  
    },
    {
      id: 'e2-4',
      source: '2',
      target: '4',
      label: 'Envío Exitoso y no leído',
      animated: true,
      labelBgPadding: [8, 4],
    },
    {
      id: 'e2-5',
      source: '2',
      target: '5',
      label: 'Mensaje fallido',
      sourceHandle: 'bottom',
      targetHandle: 'top',
      animated: true,
      labelBgPadding: [8, 4],
    },
    {
      id: 'e4-3',
      source: '4',
      target: '3',
      label: 'Leído',
      sourceHandle: 'top',
      targetHandle: 'right',
      animated: true,
      labelBgPadding: [8, 4],
    },
    {
      id: 'e4-5',
      source: '4',
      target: '5',
      label: 'No leído',
      sourceHandle: 'bottom',
      targetHandle: 'right',
      animated: true,
      labelBgPadding: [8, 4],
    },
    {
      id: 'e5-6',
      source: '5',
      target: '6',
      sourceHandle: 'bottom',
      animated: true,
      targetHandle: 'top',
    },
  ];

    const [nodes, setNodes, onNodesChange] = useNodesState(_nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(_edges);
    
    useEffect(() => { 
         
    }, []);

    const handleNodesChange = useCallback(
        (changes) => {
          const updated = onNodesChange(changes);
          localStorage.setItem('flow-nodes', JSON.stringify(updated));
          return updated;
        },
        [onNodesChange]
    );
    
    return (
        <div className="content" style={{display: 'flex', height: '100%'}}>
          <Loader active={loaderActive} text='Enviando' />
          <ReactFlowProvider>
            <div style={{flex: 1, position: 'relative'}}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    >
                    {/* <MiniMap /> */}
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>            
        </ReactFlowProvider>
        <Link to="/" title="Guardar y cerrar" href="#" className="float"  onClick={send} >
            <i className="fa-solid fa-play my-float"></i>
        </Link>
      </div>
      );
}

export default Automatization;