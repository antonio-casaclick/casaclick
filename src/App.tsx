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
      .then(async (result: any) => {
        const user = result.user;

        await setDoc(doc(db, "usuarios", user.uid), {
          telefono: user.phoneNumber,
          fecha: new Date().toISOString(),
        });

        setUserId(user.uid);
        setUserLogged(true);
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

  const aplicarFiltro = async () => {
    if (!presupuesto) {
      alert("Ingresa tu presupuesto");
      return;
    }

    await updateDoc(doc(db, "usuarios", userId), {
      presupuesto: Number(presupuesto),
    });

    await obtenerPropiedades();
    setMostrarFiltro(false);
  };

  const propiedadesFiltradas = propiedades.filter(
    (casa) => casa.precio <= Number(presupuesto)
  );

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
      ) : mostrarFiltro ? (
        <>
          <h2>¿Cuál es tu presupuesto?</h2>

          <input
            placeholder="Ej: 1500000"
            value={presupuesto}
            onChange={(e) => setPresupuesto(e.target.value)}
          />

          <br /><br />

          <button onClick={aplicarFiltro}>
            Ver propiedades para mí
          </button>
        </>
      ) : (
        <>
          <h2>Propiedades que puedes comprar</h2>

          {propiedadesFiltradas.length === 0 ? (
            <p>No hay propiedades en tu rango</p>
          ) : (
            propiedadesFiltradas.map((casa) => {
              const mensualidad = Math.round(casa.precio * 0.01);

              return (
                <div
                  key={casa.id}
                  style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
                >
                  <h3>{casa.nombre}</h3>
                  <p>Precio: ${casa.precio}</p>
                  <p>Desde ${mensualidad} al mes</p>
                  <p>Recámaras: {casa.recamaras}</p>

                  <button
                    onClick={() => {
                      const mensaje = `Hola, me interesa ${casa.nombre}. Mi presupuesto es de $${presupuesto}`;
                      window.open(
                        `https://wa.me/525573304018?text=${encodeURIComponent(mensaje)}`
                      );
                    }}
                  >
                    Me interesa
                  </button>
                </div>
              );
            })
          )}
        </>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
}

export default App;
