function App() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#0f172a",
      color: "white",
      flexDirection: "column",
      fontFamily: "Arial"
    }}>
      <h1>CasaClick</h1>
      <p>Tu hogar en un click</p>
      <p>Lo mejor es tener un hogar para compartir</p>

      <button style={{
        marginTop: "20px",
        padding: "12px 24px",
        backgroundColor: "#22c55e",
        border: "none",
        borderRadius: "10px",
        color: "white",
        fontSize: "16px",
        cursor: "pointer"
      }}>
        Comenzar
      </button>
    </div>
  );
}

export default App;
