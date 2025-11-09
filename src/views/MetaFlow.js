// src/views/MetaFlow.js
import React, { useState } from "react";
import { axios } from "../config/https";
import constants from "../util/constans";
import Loader from "../components/Loader/Loader";

import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Table,
  Alert,
  FormGroup,
  Label,
} from "reactstrap";

function MetaFlow() {
  const [loaderActive, setLoaderActive] = useState(false);

  // Paso 1: Suscribir
  const [wabaId, setWabaId] = useState(
    localStorage.getItem("meta_waba_id") || ""
  );
  const [subscribeMsg, setSubscribeMsg] = useState("");

  // Paso 2: Listar teléfonos
  const [numbers, setNumbers] = useState([]);
  const [listMsg, setListMsg] = useState("");

  // Paso 3: Selección y registro
  const [selectedPhoneId, setSelectedPhoneId] = useState("");
  const [pin, setPin] = useState("");
  const [registerMsg, setRegisterMsg] = useState("");

  const persistWaba = (val) => {
    setWabaId(val);
    if (val) localStorage.setItem("meta_waba_id", val);
    else localStorage.removeItem("meta_waba_id");
  };

  // 1) Suscribir app al WABA
  const handleSubscribe = async () => {
    setSubscribeMsg("");
    setRegisterMsg("");
    setListMsg("");

    if (!wabaId?.trim()) {
      setSubscribeMsg("Por favor ingresa el WABA ID.");
      return;
    }
    setLoaderActive(true);
    try {
      const url = `${constants.apiurl}/api/meta/${encodeURIComponent(
        wabaId.trim()
      )}/subscribed-apps`;
      const { data } = await axios.post(url);
      if (data?.ok) {
        setSubscribeMsg("✅ Suscripción realizada con éxito.");
      } else {
        setSubscribeMsg(
          `❌ Error al suscribir: ${data?.error?.message || "desconocido"}`
        );
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Error desconocido";
      setSubscribeMsg(`❌ Error al suscribir: ${msg}`);
    } finally {
      setLoaderActive(false);
    }
  };

  // 2) Listar teléfonos del WABA
  const handleListNumbers = async () => {
    setListMsg("");
    setRegisterMsg("");

    if (!wabaId?.trim()) {
      setListMsg("Por favor ingresa el WABA ID.");
      return;
    }
    setLoaderActive(true);
    try {
      const url = `${constants.apiurl}/api/meta/${encodeURIComponent(
        wabaId.trim()
      )}/phone-numbers`;
      const { data } = await axios.get(url);
      if (data?.ok) {
        const arr = Array.isArray(data.data) ? data.data : [];
        setNumbers(arr);
        setListMsg(`✅ ${arr.length} número(s) cargado(s).`);
        setSelectedPhoneId("");
      } else {
        setNumbers([]);
        setListMsg(
          `❌ Error al listar: ${data?.error?.message || "desconocido"}`
        );
      }
    } catch (err) {
      setNumbers([]);
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Error desconocido";
      setListMsg(`❌ Error al listar: ${msg}`);
    } finally {
      setLoaderActive(false);
    }
  };

  // 3) Registrar el número seleccionado (requiere PIN)
  const handleRegister = async () => {
    setRegisterMsg("");
    if (!selectedPhoneId) {
      setRegisterMsg("Por favor selecciona un número de la tabla.");
      return;
    }
    if (!pin || pin.length !== 6) {
      setRegisterMsg("El PIN debe tener 6 dígitos.");
      return;
    }

    setLoaderActive(true);
    try {
      const url = `${constants.apiurl}/api/meta/${encodeURIComponent(
        selectedPhoneId
      )}/register`;
      const { data } = await axios.post(url, { pin });
      if (data?.ok) {
        setRegisterMsg(
          "✅ Su registro se ha realizado con éxito y ya está siendo procesado por Meta."
        );
      } else {
        setRegisterMsg(
          `❌ Error al registrar: ${data?.error?.message || "desconocido"}`
        );
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Error desconocido";
      setRegisterMsg(`❌ Error al registrar: ${msg}`);
    } finally {
      setLoaderActive(false);
    }
  };

  return (
    <div className="content">
      <Loader active={loaderActive} />

      <Card>
        <CardHeader>
          <h5 className="title">Meta register WhatsApp</h5>
        </CardHeader>
        <CardBody>
          {/* Paso 1: Suscribir */}
          <section className="mb-4">
            <h6 className="mb-3">1) Suscribir App al WABA</h6>
            <div className="row g-2 align-items-end">
              <div className="col-md-4">
                <Label>WABA ID (número)</Label>
                <Input
                  type="number"
                  placeholder="Ej: 358141910705352"
                  value={wabaId}
                  onChange={(e) => persistWaba(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <Button color="primary" onClick={handleSubscribe}>
                  Suscribir
                </Button>
              </div>
              <div className="col-md-5">
                {subscribeMsg && (
                  <Alert
                    color={subscribeMsg.startsWith("✅") ? "success" : "danger"}
                    className="mb-0"
                  >
                    {subscribeMsg}
                  </Alert>
                )}
              </div>
            </div>
          </section>

          <hr />

          {/* Paso 2: Listar teléfonos */}
          <section className="mb-4">
            <h6 className="mb-3">2) Listar teléfonos del WABA</h6>
            <div className="d-flex gap-2 align-items-center mb-3">
              <Button color="secondary" onClick={handleListNumbers}>
                Listar teléfonos
              </Button>
              {listMsg && (
                <Alert
                  color={listMsg.startsWith("✅") ? "success" : "danger"}
                  className="mb-0"
                >
                  {listMsg}
                </Alert>
              )}
            </div>

            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}></th>
                    <th>Phone Number ID</th>
                    <th>Número</th>
                    <th>Nombre verificado</th>
                    <th>Quality</th>
                    <th>Code verification</th>
                  </tr>
                </thead>
                <tbody>
                  {(numbers || []).map((n) => (
                    <tr key={n.id}>
                      <td className="text-center">
                        <input
                            type="radio"
                            name="phone-select"
                            id={`pick-${n.id}`}
                            value={n.id}
                            checked={selectedPhoneId === n.id}
                            onChange={(e) => setSelectedPhoneId(e.target.value)}
                            className="form-check-input position-static"
                            style={{ margin: 0 }}
                        />
                        </td>
                      <td>{n.id}</td>
                      <td>{n.display_phone_number || "-"}</td>
                      <td>{n.verified_name || "-"}</td>
                      <td>{n.quality_rating || "-"}</td>
                      <td>{n.code_verification_status || "-"}</td>
                    </tr>
                  ))}
                  {(!numbers || numbers.length === 0) && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted">
                        Sin datos. Pulsa “Listar teléfonos”.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </section>

          <hr />

          {/* Paso 3: Registrar seleccionado */}
          <section>
            <h6 className="mb-3">3) Registrar número seleccionado</h6>
            <div className="row g-2 align-items-end">
              <div className="col-md-3">
                <Label>Phone Number ID</Label>
                <Input type="text" value={selectedPhoneId} disabled />
              </div>
              <div className="col-md-3">
                <Label>PIN (6 dígitos)</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="******"
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />
              </div>
              <div className="col-md-3">
                <Button color="success" onClick={handleRegister}>
                  Registrar
                </Button>
              </div>
              <div className="col-md-3">
                {registerMsg && (
                  <Alert
                    color={registerMsg.startsWith("✅") ? "success" : "danger"}
                    className="mb-0"
                  >
                    {registerMsg}
                  </Alert>
                )}
              </div>
            </div>
          </section>
        </CardBody>
      </Card>
    </div>
  );
}

export default MetaFlow;
