"use client";

import { useMemo, useState } from "react";

const PRIZES = {
  G: {
    tier: "Golden Ticket",
    title: "฿2,000 Tempo credit",
    detail: "Yours for one unforgettable visit, for you and up to three friends.",
    expiry: "30 August 2026",
    className: "golden",
  },
  R: {
    tier: "Private Room Pass",
    title: "Two private-room hours on us",
    detail: "Valid Tuesday–Thursday for bookings starting from 5 PM–9 PM, subject to availability.",
    expiry: "27 August 2026",
    className: "room",
  },
  T: {
    tier: "Tempo Treat Pass",
    title: "One full Tempo treat",
    detail: "Pick one delicious dish when you register your pass.",
    expiry: "30 August 2026",
    className: "treat",
  },
};

const TREATS = [
  "Crispy chilli-lime shrimp bao tacos",
  "Miso butter corn ribs",
  "Cheesy potato croquettes",
  "Sweet potato truffle fries",
];

function normalizeCode(value) {
  const compact = value.toUpperCase().replace(/[^GRT0-9]/g, "");
  if (!/^[GRT]\d{3}$/.test(compact)) return "";
  const number = Number(compact.slice(1));
  const limits = { G: 4, R: 36, T: 60 };
  if (number < 1 || number > limits[compact[0]]) return "";
  return `${compact[0]}-${String(number).padStart(3, "0")}`;
}

export default function Home() {
  const [rawCode, setRawCode] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [treat, setTreat] = useState("");
  const [entryConsent, setEntryConsent] = useState(false);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [entryReference, setEntryReference] = useState("");

  const prize = useMemo(() => (code ? PRIZES[code[0]] : null), [code]);

  function reveal(event) {
    event.preventDefault();
    const normalized = normalizeCode(rawCode);
    if (!normalized) {
      setError("That code doesn’t match one of our passes. Check the ticket and try again.");
      return;
    }
    setCode(normalized);
    setRawCode(normalized);
    setError("");
  }

  function register(event) {
    event.preventDefault();
    if (!name.trim()) return setError("Tell us what to call you.");
    if (!/^\+?[1-9]\d{7,14}$/.test(phone.replace(/[^\d+]/g, ""))) {
      return setError("Enter a valid WhatsApp number with country code.");
    }
    if (code.startsWith("T-") && !treat) return setError("Choose your Tempo treat.");
    if (!entryConsent) return setError("Please agree so Tempo can manage your prize and draw entry.");

    const reference = Date.now().toString(36).toUpperCase();
    const lines = [
      "Hi Tempo, I’d like to register my CULT 2Y pass.",
      `Entry reference: ${reference}`,
      `Code: ${code}`,
      `Name: ${name.trim()}`,
      `WhatsApp: ${phone.trim()}`,
      code.startsWith("T-") ? `Treat: ${treat}` : "",
      "Prize/draw data consent: Yes",
      `Guest list consent: ${consent ? "Yes" : "No"}`,
    ].filter(Boolean);
    setEntryReference(reference);
    setSubmitted(true);
    window.open(`https://wa.me/66627261098?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
  }

  function reset() {
    setCode("");
    setRawCode("");
    setName("");
    setPhone("");
    setTreat("");
    setEntryConsent(false);
    setConsent(false);
    setSubmitted(false);
    setEntryReference("");
    setError("");
  }

  return (
    <main className={prize ? `theme-${prize.className}` : ""}>
      <div className="glow glow-one" />
      <div className="glow glow-two" />
      <header className="brandbar">
        <a className="wordmark" href="https://www.tempophuket.com/" aria-label="Tempo Phuket">TEMPO</a>
        <span className="cross">×</span>
        <span className="cult">CULT 2Y</span>
      </header>

      <section className="pass-card">
        <div className="notch notch-left" />
        <div className="notch notch-right" />
        {submitted ? (
          <div className="registration success-screen">
            <p className="eyebrow">ENTRY {entryReference}</p>
            <div className="prize-icon" aria-hidden="true">✦</div>
            <h1>You’re in.<br />Keep the ticket.</h1>
            <p className="lead prize-copy">Send the prepared WhatsApp message to finish your registration. Then keep your original physical ticket safe—you must hand it to Tempo staff when you redeem your prize.</p>

            <div className="draw-card">
              <p className="draw-kicker">THE ULTIMATE TEMPO NIGHT</p>
              <h2>฿25,000</h2>
              <p className="draw-title">Tempo party-credit prize pool</p>
              <p>One seriously good night at Tempo, made to spend with your friends.</p>
            </div>

            <div className="mystery-copy">
              <strong>Finalists drawn 15 August</strong>
              <p>Selected entrants will face one small, fun mystery challenge. We’re keeping the details secret for now. Bring your ticket and your game face.</p>
            </div>

            <div className="ticket-warning"><span>!</span><p><strong>Do not lose your physical ticket.</strong> Registration alone is not enough for redemption. No original ticket, no prize.</p></div>
            <button className="secondary-button" type="button" onClick={reset}>Register another ticket</button>
          </div>
        ) : !prize ? (
          <div className="intro">
            <p className="eyebrow">YOU’RE HOLDING A WINNER</p>
            <div className="seal" aria-hidden="true"><span>T</span></div>
            <h1>Let’s reveal<br />your Tempo prize.</h1>
            <p className="lead">Enter the code printed on your pass. Every ticket wins something worth leaving the house for.</p>
            <form className="lookup" onSubmit={reveal}>
              <label htmlFor="code">Your pass code</label>
              <div className="code-row">
                <input
                  id="code"
                  value={rawCode}
                  onChange={(e) => setRawCode(e.target.value)}
                  placeholder="G-001"
                  maxLength={5}
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck="false"
                  aria-describedby="code-help"
                />
                <button type="submit">Reveal prize <span>→</span></button>
              </div>
              <p id="code-help" className="hint">Look beside the QR code on your physical ticket.</p>
            </form>
          </div>
        ) : (
          <div className="registration">
            <button className="back" type="button" onClick={reset}>← Use another code</button>
            <p className="eyebrow">{prize.tier} · {code}</p>
            <div className="prize-icon" aria-hidden="true">{code[0] === "G" ? "✦" : code[0] === "R" ? "♫" : "✹"}</div>
            <h1>{prize.title}</h1>
            <p className="lead prize-copy">{prize.detail}</p>

            <div className="terms-strip">
              <span><small>USE BY</small>{prize.expiry}</span>
              <span><small>STATUS</small>Ready to register</span>
            </div>

            <form className="details" onSubmit={register}>
              <div className="field">
                <label htmlFor="name">Preferred name</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="What should we call you?" />
              </div>
              <div className="field">
                <label htmlFor="phone">WhatsApp number</label>
                <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" placeholder="+66…" />
              </div>
              {code.startsWith("T-") && (
                <div className="field full">
                  <label htmlFor="treat">Choose your treat</label>
                  <select id="treat" value={treat} onChange={(e) => setTreat(e.target.value)}>
                    <option value="">Pick one delicious thing</option>
                    {TREATS.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
              )}
              <label className="consent full required-consent">
                <input type="checkbox" checked={entryConsent} onChange={(e) => setEntryConsent(e.target.checked)} />
                <span><strong>Required for entry</strong> I agree that Tempo may use these details to register and manage my pass, draw entry, prize and redemption.</span>
              </label>
              <label className="consent full">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span><strong>Add me to Tempo’s guest list ✨</strong> Send me occasional WhatsApp drops with giveaways, invitations and rewards. I can leave anytime.</span>
              </label>
              <button className="register-button full" type="submit">Continue to WhatsApp <span>↗</span></button>
              <p className="privacy full">Each pass holder registers separately, even when tickets share a colour code. Send the prepared WhatsApp message to complete your entry. Keep your original physical ticket: staff will collect it when you redeem. Marketing consent is optional.</p>
            </form>
          </div>
        )}
        {error && <p className="error" role="alert">{error}</p>}
        <footer>
          <span>ORIGINAL PASS REQUIRED</span><i /> <span>ONE USE ONLY</span><i /> <span>PHUKET · 2026</span>
        </footer>
      </section>

      <p className="outside-note">A little luck. A much better night out.</p>
    </main>
  );
}
