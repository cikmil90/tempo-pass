import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main>
      <section className="card">
        <div className="eyebrow">TEMPO × CULT 2Y</div>
        <div className="seal" aria-hidden="true">T</div>
        <h1>Your Tempo pass<br />has found its home.</h1>
        <p className="lead">
          Keep your physical ticket safe. Registration and redemption will open
          here shortly.
        </p>
        <div className="status">
          <span className="dot" />
          Official pass page is live
        </div>
        <p className="small">
          Golden Ticket · Private Room Pass · Treat Pass
        </p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
