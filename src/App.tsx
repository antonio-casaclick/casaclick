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

  // limpiar todo (solo números)
  let cleanPhone = phone.replace(/\D/g, "");

  // validar que sean 10 dígitos
  if (cleanPhone.length !== 10) {
    alert("Ingresa un número válido de 10 dígitos");
    return;
  }

  // formato México
  const formattedPhone = `+52${cleanPhone.slice(-10)}`;

  const appVerifier = (window as any).recaptchaVerifier;

  signInWithPhoneNumber(auth, formattedPhone, appVerifier)
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
  type="tel"
  placeholder="Ingresa tu número (10 dígitos)"
  value={phone}
  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
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
