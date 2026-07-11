import React from 'react';
import MetaFlow from "./MetaFlow";

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
