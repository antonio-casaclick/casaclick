import { useState } from "react";
import "./App.css";

import { auth, db } from "./firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { doc, setDoc, collection, getDocs, updateDoc } from "firebase/firestore";

function App() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<any>(null);
  const [userLogged, setUserLogged] = useState(false);
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [presupuesto, setPresupuesto] = useState("");
  const [tipoCredito, setTipoCredito] = useState("");
  const [subTipo, setSubTipo] = useState("");
  const [montoCredito, setMontoCredito] = useState("");
  const [mostrarFiltro, setMostrarFiltro] = useState(true);
  const [userId, setUserId] = useState("");

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
  };

  const sendCode = async () => {
    setupRecaptcha();
    let cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      alert("Número inválido");
      return;
    }

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      "+52" + cleanPhone,
      (window as any).recaptchaVerifier
    );

    setConfirmation(confirmationResult);
  };

  const verifyCode = () => {
    if (!confirmation) return;

    confirmation.confirm(code).then(async (result: any) => {
      const user = result.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        telefono: user.phoneNumber,
        fecha: new Date().toISOString(),
      });

      setUserId(user.uid);
      setUserLogged(true);
    });
  };

  const obtenerPropiedades = async () => {
    const querySnapshot = await getDocs(collection(db, "propiedades"));
    const lista: any[] = [];

    querySnapshot.forEach((doc) => {
      lista.push({ id: doc.id, ...doc.data() });
    });

    setPropiedades(lista);
  };

  const aplicarFiltro = async () => {
    await updateDoc(doc(db, "usuarios", userId), {
      presupuesto: Number(presupuesto),
      tipoCredito,
      subTipo,
      montoCredito,
    });

    await obtenerPropiedades();
    setMostrarFiltro(false);
  };

  const propiedadesFiltradas = propiedades.filter(
    (casa) => casa.precio <= Number(presupuesto || montoCredito)
  );

  const generarMensaje = (casa: any) => {
    return `Hola, me interesa ${casa.nombre}.
Tipo de crédito: ${tipoCredito}
Detalle: ${subTipo}
Monto: $${montoCredito || presupuesto}`;
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>CasaClick</h1>

      {!userLogged ? (
        <>
          {!confirmation ? (
            <>
              <input
                placeholder="Teléfono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button onClick={sendCode}>Enviar código</button>
            </>
          ) : (
            <>
              <input
                placeholder="Código"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button onClick={verifyCode}>Verificar</button>
            </>
          )}
        </>
      ) : mostrarFiltro ? (
        <>
          <h2>Cuéntanos sobre tu crédito</h2>

          <select onChange={(e) => setTipoCredito(e.target.value)}>
            <option value="">Selecciona crédito</option>
            <option value="Infonavit">Infonavit</option>
            <option value="Fovissste">Fovissste</option>
            <option value="Bancario">Bancario</option>
          </select>

          <br /><br />

          {/* INFONAVIT */}
          {tipoCredito === "Infonavit" && (
            <>
              <select onChange={(e) => setSubTipo(e.target.value)}>
                <option value="">Selecciona opción</option>
                <option value="Tradicional">Tradicional</option>
                <option value="Unamos crédito">Unamos crédito</option>
                <option value="No sé mi crédito">Necesito ayuda</option>
              </select>

              <br /><br />

              {subTipo === "Tradicional" && (
                <input
                  placeholder="Monto de crédito"
                  onChange={(e) => setMontoCredito(e.target.value)}
                />
              )}

              {subTipo === "Unamos crédito" && (
                <>
                  <input
                    placeholder="Tu monto"
                    onChange={(e) => setMontoCredito(e.target.value)}
                  />
                  <input placeholder="¿Con quién lo unes?" />
                </>
              )}
            </>
          )}

          {/* FOVISSSTE */}
          {tipoCredito === "Fovissste" && (
            <>
              <input
                placeholder="Monto de crédito"
                onChange={(e) => setMontoCredito(e.target.value)}
              />
              <p>Si no sabes tu monto escribe: Necesito ayuda</p>
            </>
          )}

          {/* BANCARIO */}
          {tipoCredito === "Bancario" && (
            <>
              <input
                placeholder="Monto autorizado"
                onChange={(e) => setMontoCredito(e.target.value)}
              />
              <p>Si no tienes, escribe: Necesito precalificación</p>
            </>
          )}

          <br /><br />

          <button onClick={aplicarFiltro}>Ver opciones</button>
        </>
      ) : (
        <>
          <h2>Opciones para ti</h2>

          {propiedadesFiltradas.map((casa) => (
            <div key={casa.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
              <h3>{casa.nombre}</h3>
              <p>${casa.precio}</p>

              <button
                onClick={() => {
                  window.open(
                    `https://wa.me/525573304018?text=${encodeURIComponent(
                      generarMensaje(casa)
                    )}`
                  );
                }}
              >
                Me interesa
              </button>
            </div>
          ))}
        </>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
}

export default App;
