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

  const [tipoCredito, setTipoCredito] = useState("");
  const [sabeMonto, setSabeMonto] = useState("");
  const [monto, setMonto] = useState("");

  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [mostrarFlujo, setMostrarFlujo] = useState(true);

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

      setMostrarFlujo(true);
      setTipoCredito("");
      setSabeMonto("");
      setMonto("");
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

  const continuar = async () => {
    if (!tipoCredito || !sabeMonto) {
      alert("Completa los datos");
      return;
    }

    if (sabeMonto === "no") {
      const mensaje = `Hola, necesito ayuda para revisar mi crédito (${tipoCredito})`;
      window.open(
        `https://wa.me/525573304018?text=${encodeURIComponent(mensaje)}`
      );
      return;
    }

    if (!monto) {
      alert("Ingresa tu monto");
      return;
    }

    await updateDoc(doc(db, "usuarios", userId), {
      tipoCredito,
      monto: Number(monto),
    });

    await obtenerPropiedades();
    setMostrarFlujo(false);
  };

  const propiedadesFiltradas = propiedades.filter(
    (casa) => casa.precio <= Number(monto)
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>CasaClick</h1>

      {userLogged && (
        <button
          onClick={() => {
            setMostrarFlujo(true);
            setTipoCredito("");
            setSabeMonto("");
            setMonto("");
          }}
        >
          Reiniciar
        </button>
      )}

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
      ) : mostrarFlujo ? (
        <>
          <h2>¿Qué tipo de crédito tienes?</h2>

          <select
            value={tipoCredito}
            onChange={(e) => setTipoCredito(e.target.value)}
          >
            <option value="">Selecciona</option>
            <option value="Infonavit">Infonavit</option>
            <option value="Fovissste">Fovissste</option>
            <option value="Bancario">Bancario</option>
          </select>

          {tipoCredito && (
            <>
              <br /><br />
              <h3>¿Sabes cuánto te prestan?</h3>

              <button onClick={() => setSabeMonto("si")}>Sí</button>
              <button onClick={() => setSabeMonto("no")}>No</button>
            </>
          )}

          {sabeMonto === "si" && (
            <>
              <br /><br />
              <input
                placeholder="Ej: 1200000"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </>
          )}

          <br /><br />

          {tipoCredito && sabeMonto && (
            <button onClick={continuar}>Continuar</button>
          )}
        </>
      ) : (
        <>
          <h2>Opciones para ti</h2>

          {propiedadesFiltradas.map((casa) => (
            <div
              key={casa.id}
              style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
            >
              <h3>{casa.nombre}</h3>
              <p>${casa.precio}</p>

              <button
                onClick={() => {
                  const mensaje = `Hola, me interesa ${casa.nombre}. Tengo ${tipoCredito} con un monto de $${monto}`;
                  window.open(
                    `https://wa.me/525573304018?text=${encodeURIComponent(mensaje)}`
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
