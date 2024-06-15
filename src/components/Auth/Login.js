import React, { useCallback, useState } from 'react';
import { axios } from '../../config/https';
import { encode } from '../../util/base64';
import constants from '../../util/constans';
import {
  useNavigate  
} from "react-router-dom";

let _user = {};

function Login(props) {
  const navigate = useNavigate ();
  const [formData, setFormData] = useState({})

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    _user = {
        ..._user,
        [name]: value 
        
    }
    setFormData(_user);
  }

const disabledLoginButton = !formData['email'] || !formData['password']

  const login = useCallback(() => {  
    axios.post(`${constants.apiurl}/api/login`,_user).then(async (result) => {
      if(result && result.data) {
        localStorage.setItem(constants.token, result.data);
        const userinfo = await axios.get(`${constants.apiurl}/api/users/getByEmail/${_user.email}`);
        localStorage.setItem(constants.userinfo, encode(JSON.stringify(userinfo.data)));
        navigate('/admin');
      }
    }).catch(error => {
        //TODO message error here
    });
    setFormData({
      email: '',
      password: '',
    });
  }, [navigate]);

 
 
    return  <div className="container">
      <section className="vh-100 center-div" style={{display:"flex"}}>
        <div className="container-fluid h-custom">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-xs-12 col-md-6" style={{backgroundColor:"#fff", padding: 70, borderRadius: '30px'}}>
                <div className="form-outline mb-4">
                <label className="form-label">Email</label>
                  <input type="email" name="email" value={formData['email'] || ''} onChange={onHandleChange} className="form-control form-control-lg color_black" placeholder="Ingresa un email valido" style={{paddingLeft: '5px'}} />            
                </div>

                <div className="form-outline mb-3">
                <label className="form-label">Contraseña</label>
                  <input type="password" name="password" value={formData['password'] || ''} onChange={onHandleChange} className="form-control form-control-lg color_black" placeholder="Ingresa una contraseña" style={{paddingLeft: '5px'}} />           
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div className="form-check mb-0">
                    <input className="form-check-input me-2" type="checkbox" value=""/>
                    <label className="form-check-label" htmlFor="form2Example3">
                      Recuerdame
                    </label>
                  </div>
                  <a href="#!" className="text-body">Olvide mi contraseña</a>
                </div>

                <div className="text-center text-lg-start mt-4 pt-2">
                  <button type="button" className="btn bg-primaryPink text-gray-300 btn-lg" disabled={disabledLoginButton} onClick={login}>Iniciar sesion</button>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
}

export default Login;