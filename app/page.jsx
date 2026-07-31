"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { api } from "../lib/api";
import { eventCalendarHref, INTERESTS, normalizeCode, normalizeWhatsApp } from "../lib/pass";

const PRIZES = {
  G: { tier: "Golden Ticket", title: "฿2,000 Tempo credit", detail: "Yours for one unforgettable visit, for you and up to three friends.", expiry: "30 August 2026", className: "golden" },
  R: { tier: "Private Room Pass", title: "Two private-room hours on us", detail: "Valid Tuesday–Thursday for bookings starting from 5 PM–9 PM, subject to availability.", expiry: "27 August 2026", className: "room" },
  T: { tier: "Tempo Treat Pass", title: "One full Tempo treat", detail: "Pick one delicious dish when you register your pass.", expiry: "30 August 2026", className: "treat" },
};
const TREATS = ["Crispy chilli-lime shrimp bao tacos", "Miso butter corn ribs", "Cheesy potato croquettes", "Sweet potato truffle fries"];

export default function Home() {
  const [step, setStep] = useState(1), [rawCode, setRawCode] = useState(""), [code, setCode] = useState("");
  const [name, setName] = useState(""), [whatsapp, setWhatsapp] = useState(""), [treat, setTreat] = useState("");
  const [requiredConsent, setRequiredConsent] = useState(false), [marketingConsent, setMarketingConsent] = useState(false);
  const [entry, setEntry] = useState(null), [qr, setQr] = useState(""), [rsvp, setRsvp] = useState("unset"), [partySize, setPartySize] = useState(1);
  const [interests, setInterests] = useState([]), [waUpdates, setWaUpdates] = useState(false), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const [recovering,setRecovering]=useState(false),[recoverRef,setRecoverRef]=useState(""),[recoverWa,setRecoverWa]=useState("");
  const prize = useMemo(() => code ? PRIZES[code[0]] : null, [code]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("pass");
    if (!token) return;
    api(`/pass/${encodeURIComponent(token)}`).then(row => { setEntry({ ...row, manage_token: token }); setCode(row.shared_code); setRsvp(row.rsvp_status); setPartySize(row.party_size || 1); setInterests(row.interests || []); setStep(3); }).catch(() => setError("We couldn't find that pass. Use your entry reference and WhatsApp number to recover it."));
  }, []);

  useEffect(() => {
    if (!entry?.manage_token) return;
    QRCode.toDataURL(`${window.location.origin}${window.location.pathname}?pass=${entry.manage_token}`, { width: 360, margin: 1, color: { dark: "#08070b", light: "#fff4d9" } }).then(setQr);
  }, [entry]);

  function reveal(e) { e.preventDefault(); const value = normalizeCode(rawCode); if (!value) return setError("Use the shared code printed on your pass: G-001, R-001 or T-001."); setCode(value); setError(""); setStep(2); }
  async function register(e) {
    e.preventDefault(); const wa = normalizeWhatsApp(whatsapp);
    if (!name.trim()) return setError("Tell us what to call you.");
    if (!wa) return setError("Enter your WhatsApp number with country code, for example +66…");
    if (code[0] === "T" && !treat) return setError("Choose your Tempo treat.");
    if (!requiredConsent) return setError("We need your permission to manage your entry and prize.");
    setBusy(true); setError("");
    try {
      const data = await api("/register", { method:"POST", body:{ shared_code: code, preferred_name: name.trim(), whatsapp: wa, required_consent: true, marketing_consent: marketingConsent, treat_choice: treat || null }});
      setEntry(data); window.history.replaceState({},"",`?pass=${encodeURIComponent(data.manage_token)}`); setStep(3);
    } catch (e2) { setError(e2.message || "Registration was not saved. Please try again."); } finally { setBusy(false); }
  }
  async function savePreferences(nextStep) {
    setBusy(true); setError("");
    try { await api(`/pass/${encodeURIComponent(entry.manage_token)}`, { method:"PATCH", body:{ rsvp_status:rsvp, party_size:Number(partySize), interests, whatsapp_updates:waUpdates, reminder_choice:waUpdates?"whatsapp":"calendar" }}); setStep(nextStep); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  function toggleInterest(value) { setInterests(v => v.includes(value) ? v.filter(x => x !== value) : [...v, value]); }
  function downloadQr() { const a = document.createElement("a"); a.href = qr; a.download = `tempo-pass-${entry.entry_reference}.png`; a.click(); }
  async function recoverPass(e){e.preventDefault();setBusy(true);setError("");try{const r=await api("/recover",{method:"POST",body:{entry_reference:recoverRef,whatsapp:normalizeWhatsApp(recoverWa)}});if(!r.manage_token)throw new Error("If those details match, try again shortly or ask Tempo staff for help.");window.location.href=`?pass=${encodeURIComponent(r.manage_token)}`}catch(e2){setError(e2.message)}finally{setBusy(false)}}

  return <main className={prize ? `theme-${prize.className}` : ""}>
    <div className="glow glow-one"/><div className="glow glow-two"/>
    <header className="brandbar"><a className="wordmark" href="https://www.tempophuket.com/">TEMPO</a><span className="cross">×</span><span className="cult">CULT 2Y</span></header>
    <section className="pass-card"><div className="notch notch-left"/><div className="notch notch-right"/>
      {step === 1 && <div className="intro"><p className="eyebrow">YOU’RE HOLDING A WINNER</p><div className="seal"><span>T</span></div><h1>Let’s reveal<br/>your Tempo prize.</h1><p className="lead">Every pass wins something worth leaving the house for.</p><form className="lookup" onSubmit={reveal}><label>Your pass code</label><div className="code-row"><input value={rawCode} onChange={e=>setRawCode(e.target.value)} placeholder="G-001" maxLength={5}/><button>SHOW ME WHAT I WON →</button></div><p className="hint">Not a trap. Trust me, bro.</p></form></div>}
      {step === 1 && !recovering && <button className="secondary-button wide" onClick={()=>setRecovering(true)}>ALREADY REGISTERED? VIEW MY PASS</button>}
      {step === 1 && recovering && <form className="details recovery-card" onSubmit={recoverPass}><p className="form-title full">FIND MY PASS</p><div className="field"><label>Entry reference</label><input value={recoverRef} onChange={e=>setRecoverRef(e.target.value)} placeholder="TP-XXXXXXXX"/></div><div className="field"><label>WhatsApp number</label><input value={recoverWa} onChange={e=>setRecoverWa(e.target.value)} placeholder="+66…"/></div><button className="register-button full" disabled={busy}>RECOVER MY PASS</button><p className="privacy full">For privacy, we need both details. Name alone won’t do it.</p></form>}
      {step === 2 && <div className="registration"><button className="back" onClick={()=>setStep(1)}>← Use another code</button><p className="eyebrow">{prize.tier} · {code}</p><div className="prize-icon">✦</div><h1>{prize.title}</h1><p className="lead prize-copy">{prize.detail}</p><div className="terms-strip"><span><small>USE BY</small>{prize.expiry}</span><span><small>TIME NEEDED</small>About 15 seconds</span></div><form className="details" onSubmit={register}><p className="form-title full">TELL US WHO JUST GOT LUCKY</p><p className="hint full">Two tiny details. No password. No nonsense.</p><div className="field"><label>Preferred name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="What should we call you?"/></div><div className="field"><label>WhatsApp number</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="+66…" inputMode="tel"/></div>{code[0]==="T"&&<div className="field full"><label>Choose your treat</label><select value={treat} onChange={e=>setTreat(e.target.value)}><option value="">Pick one</option>{TREATS.map(x=><option key={x}>{x}</option>)}</select></div>}<label className="consent full required-consent"><input type="checkbox" checked={requiredConsent} onChange={e=>setRequiredConsent(e.target.checked)}/><span><strong>Required for entry</strong>Tempo may use these details to register and manage my pass, event entry, prize and redemption.</span></label><label className="consent full"><input type="checkbox" checked={marketingConsent} onChange={e=>setMarketingConsent(e.target.checked)}/><span><strong>Keep me in the loop ✨</strong>Send occasional Tempo WhatsApp updates and offers. Optional.</span></label><button className="register-button full" disabled={busy}>{busy?"SAVING…":"LOCK IN MY ENTRY — YOU KNOW YOU WANT TO"}</button><p className="privacy full">Not a trap. Trust me, bro. We just need to know who to give the ridiculous prize to.</p></form></div>}
      {step === 3 && <div className="registration success-screen"><p className="eyebrow">ENTRY {entry?.entry_reference}</p><h1>DAAAAMNN<br/>THAT WAS EASY!</h1><p className="lead">Your entry is safely saved. Keep this personal QR and your original physical Tempo Pass.</p>{qr&&<img className="personal-qr" src={qr} alt="Your personal Tempo Pass QR"/>}<div className="action-row"><button className="register-button" onClick={downloadQr}>SAVE MY PASS</button><button className="secondary-button" onClick={()=>setStep(4)}>VIEW EVENT DETAILS</button></div></div>}
      {step === 4 && <div className="registration"><p className="eyebrow">SATURDAY 22 AUGUST 2026 · TEMPO</p><h1>You’re in.<br/>Are you coming?</h1><p className="lead">RSVP helps us plan the party. It does not affect your eligibility.</p><div className="choice-grid"><button className={rsvp==="coming"?"selected":""} onClick={()=>setRsvp("coming")}>YES, COUNT ME IN</button><button className={rsvp==="remind_later"?"selected":""} onClick={()=>setRsvp("remind_later")}>REMIND ME CLOSER</button></div><div className="field compact"><label>Party size, including you</label><input type="number" min="1" max="20" value={partySize} onChange={e=>setPartySize(e.target.value)}/></div><button className="register-button wide" onClick={()=>savePreferences(5)} disabled={busy}>SAVE RSVP</button></div>}
      {step === 5 && <div className="registration"><p className="eyebrow">OPTIONAL · TAP ALL THAT APPLY</p><h1>What gets you<br/>out of the house?</h1><div className="chips">{INTERESTS.map(x=><button key={x} className={interests.includes(x)?"selected":""} onClick={()=>toggleInterest(x)}>{x}</button>)}</div><div className="action-row"><button className="secondary-button" onClick={()=>{setInterests([]);savePreferences(6)}}>SKIP</button><button className="register-button" onClick={()=>savePreferences(6)}>THAT’S ME</button></div></div>}
      {step === 6 && <div className="registration"><p className="eyebrow">ONE EPIC NIGHT</p><h1>Don’t accidentally miss the ridiculous prize.</h1><div className="draw-card"><p className="draw-kicker">TOP 3 LIVE PRIZES</p><h2>฿20,000</h2><p className="draw-title">1st · Epic-night credit</p><p>2nd: ฿5,000 credit · 3rd: chicken or duck dinner. Credits must be spent in one epic night.</p></div><label className="consent reminder"><input type="checkbox" checked={waUpdates} onChange={e=>setWaUpdates(e.target.checked)}/><span><strong>I’d like event updates on WhatsApp</strong>No spam. We have standards.</span></label><div className="action-row"><a className="register-button link-button" href={eventCalendarHref()} download="tempo-ultimate-party-night.ics">ADD TO CALENDAR</a><button className="secondary-button" onClick={()=>savePreferences(3)}>SAVE CHOICES</button></div><div className="ticket-warning"><span>!</span><p><strong>Bring your original Tempo Pass and this personal QR.</strong> You need both to check in and play live.</p></div></div>}
      {error&&<p className="error" role="alert">{error}</p>}<footer><span>ORIGINAL PASS REQUIRED</span><i/><span>PERSONAL QR</span><i/><span>PHUKET · 2026</span></footer>
    </section><p className="outside-note">A little luck. A much better night out.</p>
  </main>;
}
