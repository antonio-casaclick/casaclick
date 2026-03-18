import { useState } from "react";
import app from "./firebase";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";

const auth = getAuth(app);

function App() {
  const [phone, setPhone] = useState("");

  const sendCode = () => {
    const recaptcha = new RecaptchaVerifier(auth, "recaptcha", {});
    
    signInWithPhoneNumber(auth, phone, recaptcha)
      .then(() => {
        alert("Código enviado");
      })
      .catch((error) => {
        console.log(error);
        alert("Error al enviar código");
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
        style={{ padding: 10, marginBottom: 10 }}
      />

      <br />

      <button onClick={sendCode}>
        Enviar código
      </button>

      <div id="recaptcha"></div>
    </div>
  );
}

export default App;
