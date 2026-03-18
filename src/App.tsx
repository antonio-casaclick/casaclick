import { useState } from "react";
import app from "./firebase";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";

const auth = getAuth(app);

function App() {
  const [phone, setPhone] = useState("");

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha", {
        size: "invisible"
      });
    }
  };

  const sendCode = () => {
    setupRecaptcha();

    const appVerifier = (window as any).recaptchaVerifier;

    signInWithPhoneNumber(auth, phone, appVerifier)
      .then(() => {
        alert("Código enviado");
      })
      .catch((error) => {
        console.log(error);
        alert(error.message);
      });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>CasaClick</h1>
      <p>Ingresa tu número para comenzar</p>

      <input
        type="text"
        placeholder="+521XXXXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <br /><br />

      <button onClick={sendCode}>
        Enviar código
      </button>

      <div id="recaptcha"></div>
    </div>
  );
}

export default App;
