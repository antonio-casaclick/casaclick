import { useState } from "react";
import app from "./firebase";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<any>(null);
  const [userLogged, setUserLogged] = useState(false);

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha", {
        size: "invisible"
      });
    }
  };

  const sendCode = () => {
    setupRecaptcha();

    let cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length < 10) {
      alert("Ingresa un número válido de 10 dígitos");
      return;
    }

    const formattedPhone = `+52${cleanPhone.slice(-10)}`;

    const appVerifier = (window as any).recaptchaVerifier;

    signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      .then((result) => {
        setConfirmation(result);
      })
      .catch((error) => {
        console.log(error);
        alert(error.message);
      });
  };

  const verifyCode = () => {
    if (!confirmation) return;

    confirmation.confirm(code)
      confirmation.confirm(code)
  .then(async (result) => {
    const user = result.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      telefono: user.phoneNumber,
      fecha: new Date().toISOString()
    });

    setUserLogged(true);
  })
      .catch(() => {
        alert("Código incorrecto");
      });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>CasaClick</h1>

      {userLogged ? (
        <>
          <h2>Bienvenido a CasaClick</h2>
          <p>Ya puedes comenzar tu búsqueda de hogar</p>
        </>
      ) : !confirmation ? (
        <>
          <p>Ingresa tu número</p>

          <input
            type="tel"
            placeholder="10 dígitos"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          />

          <br /><br />

          <button onClick={sendCode}>
            Enviar código
          </button>
        </>
      ) : (
        <>
          <p>Ingresa el código</p>

          <input
            type="text"
            placeholder="Código"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <br /><br />

          <button onClick={verifyCode}>
            Verificar código
          </button>
        </>
      )}

      <div id="recaptcha"></div>
    </div>
  );
}

export default App;
