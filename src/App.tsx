import { useState } from "react";
import "./App.css";

import { auth, db } from "./firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";

function App() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<any>(null);
  const [userLogged, setUserLogged] = useState(false);
  const [propiedades, setPropiedades] = useState<any[]>([]);

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }
  };

  const sendCode = async () => {
    setupRecaptcha();

    let cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      alert("Ingresa un número válido de 10 dígitos");
      return;
    }

    const formattedPhone = "+52" + cleanPhone;

    const appVerifier = (window as any).recaptchaVerifier;

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );
      setConfirmation(confirmationResult);
      alert("Código enviado (usa 123456)");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const verifyCode = () => {
    if (!confirmation) return;

    confirmation.confirm(code)
      .then(async (result) => {
        const user = result.user;

        await setDoc(doc(db, "usuarios", user.uid), {
          telefono: user.phoneNumber,
          fecha: new Date().toISOString(),
        });

        setUserLogged(true);
        obtenerPropiedades();
      })
      .catch(() => {
        alert("Código incorrecto");
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

  return (
    <div style={{ padding: 20 }}>
      <h1>CasaClick</h1>

      {!userLogged ? (
        <>
          {!confirmation ? (
            <>
              <h3>Ingresa tu número</h3>
              <input
                placeholder="10 dígitos"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <br /><br />
              <button onClick={sendCode}>Enviar código</button>
            </>
          ) : (
            <>
              <h3>Ingresa código</h3>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <br /><br />
              <button onClick={verifyCode}>Verificar</button>
            </>
          )}
        </>
      ) : (
        <>
          <h2>Casas disponibles</h2>

          {propiedades.map((casa) => (
            <div
              key={casa.id}
              style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
            >
              <h3>{casa.nombre}</h3>
              <p>Precio: ${casa.precio}</p>
              <p>Recámaras: {casa.recamaras}</p>
            </div>
          ))}
        </>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
}

export default App;
