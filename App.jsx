import { useState, useEffect, useCallback } from "react";

// ── API Configuration ─────────────────────────────────────────────────────
const API_BASE = "http://localhost:5000/api";

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}/${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
};

const apiGet    = (path)         => apiFetch(path);
const apiPost   = (path, body)   => apiFetch(path, { method: "POST",   body: JSON.stringify(body) });
const apiPut    = (path, id, body) => apiFetch(`${path}/${id}`, { method: "PUT", body: JSON.stringify(body) });
const apiDelete = (path, id)     => apiFetch(`${path}/${id}`, { method: "DELETE" });

const matchId = (a, b) => {
  const idA = a && typeof a === "object" ? (a.id || a._id) : a;
  const idB = b && typeof b === "object" ? (b.id || b._id) : b;
  return idA && idB && idA.toString() === idB.toString();
};

// ── Credentials (auth stays client-side as in original) ───────────────────
const USERS = [
  { username: "admin",  password: "admin123",  role: "Administrator", badge: "KA-ADM"  },
  { username: "sharma", password: "sharma123", role: "Inspector",     badge: "KA-1001" },
  { username: "verma",  password: "verma123",  role: "Sub-Inspector", badge: "KA-1002" },
  { username: "ramesh", password: "ramesh123", role: "ACP",           badge: "KA-1021" },
];

// ── Status colour map ──────────────────────────────────────────────────────
const statusColor = {
  Open: "#ff4444", Closed: "#44cc88", Pending: "#ffaa00",
  Registered: "#4488ff", "Under Investigation": "#ff8800",
};

// ── Reusable UI ───────────────────────────────────────────────────────────
const Badge = ({ text, color }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
    {text}
  </span>
);

const Modal = ({ title, children, onClose }) => (
  <div style={{ position: "fixed", inset: 0, background: "#00000088", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
    <div style={{ background: "#0f1923", border: "1px solid #1e3a5f", borderRadius: 12, padding: 28, minWidth: 440, maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ color: "#e0ecff", margin: 0, fontSize: 16, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#6688aa", cursor: "pointer", fontSize: 20 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", color: "#6688aa", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, type = "text", placeholder }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width: "100%", background: "#0a1420", border: "1px solid #1e3a5f", borderRadius: 6, padding: "8px 12px", color: "#c8deff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
);

const Select = ({ value, onChange, children }) => (
  <select value={value} onChange={onChange}
    style={{ width: "100%", background: "#0a1420", border: "1px solid #1e3a5f", borderRadius: 6, padding: "8px 12px", color: "#c8deff", fontSize: 13, outline: "none" }}>
    {children}
  </select>
);

const Textarea = ({ value, onChange, placeholder }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3}
    style={{ width: "100%", background: "#0a1420", border: "1px solid #1e3a5f", borderRadius: 6, padding: "8px 12px", color: "#c8deff", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
);

const Btn = ({ onClick, children, color = "#1a6cff", style = {}, disabled = false }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ background: disabled ? "#1a3050" : color, color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: disabled ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, opacity: disabled ? 0.6 : 1, ...style }}>
    {children}
  </button>
);

const Table = ({ headers, children }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>{headers.map((h) => <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#4488aa", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid #1a3050", whiteSpace: "nowrap" }}>{h}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const TR = ({ children }) => (
  <tr style={{ borderBottom: "1px solid #0d2035" }}
    onMouseEnter={(e) => (e.currentTarget.style.background = "#0a1e30")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
    {children}
  </tr>
);

const TD = ({ children, style = {} }) => (
  <td style={{ padding: "10px 14px", color: "#c8deff", verticalAlign: "middle", ...style }}>{children}</td>
);

// Loading Spinner
const Spinner = ({ message = "Loading data from database…" }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 16 }}>
    <div style={{ width: 40, height: 40, border: "3px solid #1a3050", borderTop: "3px solid #1a6cff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <div style={{ color: "#6688aa", fontSize: 13 }}>{message}</div>
  </div>
);

// Error Banner
const ErrorBanner = ({ message, onRetry }) => (
  <div style={{ background: "#ff444422", border: "1px solid #ff444444", borderRadius: 8, padding: "14px 18px", color: "#ff6666", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
    <span>⚠️ {message}</span>
    {onRetry && <Btn onClick={onRetry} color="#5f1a1a" style={{ fontSize: 11 }}>Retry</Btn>}
  </div>
);

// ── Login Page ─────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = () => {
    if (!username || !password) { setError("Please enter username and password."); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      const user = USERS.find((u) => u.username === username && u.password === password);
      if (user) { onLogin(user); }
      else       { setError("Invalid credentials. Please try again."); setLoading(false); }
    }, 800);
  };
  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={{ minHeight: "100vh", background: "#070e18", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#0d2035 1px, transparent 1px), linear-gradient(90deg, #0d2035 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.4 }} />
      <div style={{ position: "absolute", top: "15%", left: "10%",   width: 300, height: 300, background: "#1a6cff", borderRadius: "50%", filter: "blur(120px)", opacity: 0.07 }} />
      <div style={{ position: "absolute", bottom: "10%", right: "8%", width: 250, height: 250, background: "#0044aa", borderRadius: "50%", filter: "blur(100px)", opacity: 0.08 }} />

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420, animation: "fadeIn 0.5s ease forwards" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, #0a1e30, #0d2a4a)", border: "2px solid #1a6cff44", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 0 30px #1a6cff22" }}>🛡️</div>
            <div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 26, color: "#e0ecff", letterSpacing: 4 }}>CRMS</div>
              <div style={{ color: "#4488aa", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>Crime Record Management System</div>
            </div>
          </div>
        </div>

        <div style={{ background: "#0d1e2e", border: "1px solid #1a3050", borderRadius: 16, padding: "32px 36px", position: "relative", overflow: "hidden" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: "#e0ecff", fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>Officer Sign In</div>
            <div style={{ color: "#445566", fontSize: 12 }}>Karnataka Police Department — Secure Access</div>
          </div>

          <div style={{ background: "#0a1825", border: "1px solid #1a3050", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 11, color: "#4488aa" }}>
            <b style={{ color: "#6688aa" }}>Demo accounts:</b> admin / admin123 &nbsp;|&nbsp; sharma / sharma123
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "#6688aa", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Username</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#446688" }}>👤</span>
              <input value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} onKeyDown={handleKey} placeholder="Enter username"
                style={{ width: "100%", background: "#0a1420", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 12px 10px 36px", color: "#c8deff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "#6688aa", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#446688" }}>🔒</span>
              <input value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} onKeyDown={handleKey} type={showPw ? "text" : "password"} placeholder="Enter password"
                style={{ width: "100%", background: "#0a1420", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 40px 10px 36px", color: "#c8deff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              <button onClick={() => setShowPw((v) => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#446688", cursor: "pointer", fontSize: 14 }}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "#ff444422", border: "1px solid #ff444444", borderRadius: 8, padding: "10px 14px", color: "#ff6666", fontSize: 12, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading}
            style={{ width: "100%", background: loading ? "#1a3a5f" : "linear-gradient(135deg, #1a6cff, #0055dd)", color: "#fff", border: "none", borderRadius: 8, padding: "12px", cursor: loading ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700, letterSpacing: 1, fontFamily: "'Rajdhani', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? "Authenticating…" : "🔐  Sign In"}
          </button>
          <div style={{ marginTop: 16, textAlign: "center", color: "#2a4060", fontSize: 11 }}>Authorized personnel only · All access is logged</div>
        </div>
        <div style={{ textAlign: "center", marginTop: 20, color: "#1a3050", fontSize: 11 }}>Karnataka Police Dept. · CRMS v2.0.0 (MongoDB)</div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ db }) {
  const stats = [
    { label: "Police Stations", value: db.stations.length,                                   icon: "🏛️", color: "#1a6cff" },
    { label: "Officers",        value: db.officers.length,                                   icon: "👮", color: "#44cc88" },
    { label: "FIRs Filed",      value: db.firs.length,                                       icon: "📋", color: "#ffaa00" },
    { label: "Active Cases",    value: db.cases.filter((c) => c.status === "Open").length,   icon: "⚖️", color: "#ff4444" },
    { label: "Criminals",       value: db.criminals.length,                                  icon: "🔍", color: "#cc44ff" },
    { label: "Closed Cases",    value: db.cases.filter((c) => c.status === "Closed").length, icon: "✅", color: "#44cc88" },
  ];
  return (
    <div>
      <h2 style={{ color: "#e0ecff", fontFamily: "'Rajdhani', sans-serif", fontSize: 22, letterSpacing: 2, marginBottom: 24, textTransform: "uppercase" }}>System Overview</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#0d1e2e", border: `1px solid ${s.color}33`, borderRadius: 10, padding: "20px 18px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color, fontFamily: "'Rajdhani', sans-serif" }}>{s.value}</div>
            <div style={{ color: "#6688aa", fontSize: 12, letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <h3 style={{ color: "#6688aa", fontFamily: "'Rajdhani', sans-serif", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Recent FIRs</h3>
      <div style={{ background: "#0d1e2e", borderRadius: 10, border: "1px solid #1a3050", overflow: "hidden" }}>
        <Table headers={["FIR #", "Date", "Crime", "Station", "Status"]}>
          {[...db.firs].reverse().slice(0, 5).map((f) => {
            const ct = db.crimeTypes.find((c) => matchId(c.id, f.crime_id));
            const st = db.stations.find((s) => matchId(s.id, f.station_id));
            return (
              <TR key={f.id}>
                <TD><span style={{ color: "#4488ff" }}>FIR-{String(f.id).slice(-4).toUpperCase()}</span></TD>
                <TD>{f.date}</TD>
                <TD>{ct?.name ?? "—"}</TD>
                <TD>{st?.name ?? "—"}</TD>
                <TD><Badge text={f.status} color={statusColor[f.status] || "#888"} /></TD>
              </TR>
            );
          })}
        </Table>
      </div>
    </div>
  );
}

// ── Stations ──────────────────────────────────────────────────────────────
function Stations({ db, setDb }) {
  const blank = { name: "", location: "", contact: "", incharge: "" };
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(blank);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState("");

  const openAdd  = () => { setForm(blank); setEditId(null); setErr(""); setShowModal(true); };
  const openEdit = (s) => { setForm(s); setEditId(s.id); setErr(""); setShowModal(true); };

  const save = async () => {
    if (!form.name) return;
    setSaving(true); setErr("");
    try {
      const { id, ...body } = form;
      if (editId) {
        const updated = await apiPut("stations", editId, body);
        setDb((d) => ({ ...d, stations: d.stations.map((s) => s.id === editId ? updated : s) }));
      } else {
        const created = await apiPost("stations", body);
        setDb((d) => ({ ...d, stations: [...d.stations, created] }));
      }
      setShowModal(false);
    } catch (e) { setErr(e.message); }
    finally     { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this station?")) return;
    try {
      await apiDelete("stations", id);
      setDb((d) => ({ ...d, stations: d.stations.filter((s) => s.id !== id) }));
    } catch (e) { alert("Delete failed: " + e.message); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#e0ecff", fontFamily: "'Rajdhani', sans-serif", fontSize: 20, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>Police Stations</h2>
        <Btn onClick={openAdd}>+ Add Station</Btn>
      </div>
      <div style={{ background: "#0d1e2e", borderRadius: 10, border: "1px solid #1a3050", overflow: "hidden" }}>
        <Table headers={["ID", "Station Name", "Location", "Contact", "In-Charge", "Actions"]}>
          {db.stations.map((s) => (
            <TR key={s.id}>
              <TD><span style={{ color: "#4488ff", fontFamily: "monospace", fontSize: 11 }}>…{s.id.slice(-6)}</span></TD>
              <TD><b style={{ color: "#e0ecff" }}>{s.name}</b></TD>
              <TD>{s.location}</TD>
              <TD>{s.contact}</TD>
              <TD>{s.incharge}</TD>
              <TD>
                <Btn onClick={() => openEdit(s)} color="#1a3a5f" style={{ marginRight: 6, fontSize: 11 }}>Edit</Btn>
                <Btn onClick={() => del(s.id)}   color="#5f1a1a" style={{ fontSize: 11 }}>Delete</Btn>
              </TD>
            </TR>
          ))}
        </Table>
      </div>
      {showModal && (
        <Modal title={editId ? "Edit Station" : "Add Station"} onClose={() => setShowModal(false)}>
          {err && <div style={{ color: "#ff6666", background: "#ff444422", border: "1px solid #ff444444", borderRadius: 6, padding: "8px 12px", marginBottom: 14, fontSize: 12 }}>⚠️ {err}</div>}
          <Field label="Station Name"><Input value={form.name}     onChange={(e) => setForm({ ...form, name:     e.target.value })} placeholder="Enter station name"  /></Field>
          <Field label="Location">    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City / Area"          /></Field>
          <Field label="Contact">     <Input value={form.contact}  onChange={(e) => setForm({ ...form, contact:  e.target.value })} placeholder="Phone number"         /></Field>
          <Field label="In-Charge Officer"><Input value={form.incharge} onChange={(e) => setForm({ ...form, incharge: e.target.value })} placeholder="Name of DCP/SHO" /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
            <Btn onClick={() => setShowModal(false)} color="#2a3a4a">Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Officers ──────────────────────────────────────────────────────────────
function Officers({ db, setDb }) {
  const ranks = ["Inspector General","Deputy Commissioner","Assistant Commissioner","Inspector","Sub-Inspector","Assistant Sub-Inspector","Head Constable","Constable"];
  const blank  = { name: "", rank: "", station_id: db.stations[0]?.id || "", badge: "", contact: "" };
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(blank);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState("");

  const openAdd  = () => { setForm({ ...blank, station_id: db.stations[0]?.id || "" }); setEditId(null); setErr(""); setShowModal(true); };
  const openEdit = (o) => { setForm({ ...o }); setEditId(o.id); setErr(""); setShowModal(true); };

  const save = async () => {
    if (!form.name) return;
    setSaving(true); setErr("");
    try {
      const { id, ...body } = form;
      if (editId) {
        const updated = await apiPut("officers", editId, body);
        setDb((d) => ({ ...d, officers: d.officers.map((o) => o.id === editId ? updated : o) }));
      } else {
        const created = await apiPost("officers", body);
        setDb((d) => ({ ...d, officers: [...d.officers, created] }));
      }
      setShowModal(false);
    } catch (e) { setErr(e.message); }
    finally     { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this officer?")) return;
    try {
      await apiDelete("officers", id);
      setDb((d) => ({ ...d, officers: d.officers.filter((o) => o.id !== id) }));
    } catch (e) { alert("Delete failed: " + e.message); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#e0ecff", fontFamily: "'Rajdhani', sans-serif", fontSize: 20, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>Officers</h2>
        <Btn onClick={openAdd}>+ Add Officer</Btn>
      </div>
      <div style={{ background: "#0d1e2e", borderRadius: 10, border: "1px solid #1a3050", overflow: "hidden" }}>
        <Table headers={["Badge", "Name", "Rank", "Station", "Contact", "Actions"]}>
          {db.officers.map((o) => {
            const st = db.stations.find((s) => matchId(s.id, o.station_id));
            return (
              <TR key={o.id}>
                <TD><span style={{ color: "#ffaa00", fontFamily: "monospace" }}>{o.badge}</span></TD>
                <TD><b style={{ color: "#e0ecff" }}>{o.name}</b></TD>
                <TD><Badge text={o.rank} color="#4488ff" /></TD>
                <TD>{st?.name || "—"}</TD>
                <TD>{o.contact}</TD>
                <TD>
                  <Btn onClick={() => openEdit(o)} color="#1a3a5f" style={{ marginRight: 6, fontSize: 11 }}>Edit</Btn>
                  <Btn onClick={() => del(o.id)}   color="#5f1a1a" style={{ fontSize: 11 }}>Delete</Btn>
                </TD>
              </TR>
            );
          })}
        </Table>
      </div>
      {showModal && (
        <Modal title={editId ? "Edit Officer" : "Add Officer"} onClose={() => setShowModal(false)}>
          {err && <div style={{ color: "#ff6666", background: "#ff444422", border: "1px solid #ff444444", borderRadius: 6, padding: "8px 12px", marginBottom: 14, fontSize: 12 }}>⚠️ {err}</div>}
          <Field label="Full Name"><Input value={form.name}    onChange={(e) => setForm({ ...form, name:    e.target.value })} placeholder="Officer name"    /></Field>
          <Field label="Badge No."><Input value={form.badge}   onChange={(e) => setForm({ ...form, badge:   e.target.value })} placeholder="e.g. KA-1004"    /></Field>
          <Field label="Contact">  <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Phone number"     /></Field>
          <Field label="Rank">
            <Select value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })}>
              <option value="">Select rank</option>
              {ranks.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="Station">
            <Select value={form.station_id} onChange={(e) => setForm({ ...form, station_id: e.target.value })}>
              {db.stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
            <Btn onClick={() => setShowModal(false)} color="#2a3a4a">Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Criminals ─────────────────────────────────────────────────────────────
function Criminals({ db, setDb }) {
  const blank = { name: "", dob: "", address: "", gender: "Male", crimes: "", status: "At Large" };
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(blank);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState("");

  const openAdd  = () => { setForm(blank); setEditId(null); setErr(""); setShowModal(true); };
  const openEdit = (c) => { setForm({ ...c }); setEditId(c.id); setErr(""); setShowModal(true); };

  const save = async () => {
    if (!form.name) return;
    setSaving(true); setErr("");
    try {
      const { id, ...body } = form;
      if (editId) {
        const updated = await apiPut("criminals", editId, body);
        setDb((d) => ({ ...d, criminals: d.criminals.map((c) => c.id === editId ? updated : c) }));
      } else {
        const created = await apiPost("criminals", body);
        setDb((d) => ({ ...d, criminals: [...d.criminals, created] }));
      }
      setShowModal(false);
    } catch (e) { setErr(e.message); }
    finally     { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this criminal record?")) return;
    try {
      await apiDelete("criminals", id);
      setDb((d) => ({ ...d, criminals: d.criminals.filter((c) => c.id !== id) }));
    } catch (e) { alert("Delete failed: " + e.message); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#e0ecff", fontFamily: "'Rajdhani', sans-serif", fontSize: 20, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>Criminals</h2>
        <Btn onClick={openAdd}>+ Add Criminal</Btn>
      </div>
      <div style={{ background: "#0d1e2e", borderRadius: 10, border: "1px solid #1a3050", overflow: "hidden" }}>
        <Table headers={["ID", "Name", "DOB", "Gender", "Status", "Crime History", "Actions"]}>
          {db.criminals.map((c) => (
            <TR key={c.id}>
              <TD><span style={{ color: "#cc44ff", fontFamily: "monospace", fontSize: 11 }}>…{c.id.slice(-6)}</span></TD>
              <TD><b style={{ color: "#e0ecff" }}>{c.name}</b></TD>
              <TD>{c.dob}</TD>
              <TD>{c.gender}</TD>
              <TD><Badge text={c.status} color={c.status === "Arrested" ? "#44cc88" : "#ff4444"} /></TD>
              <TD style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.crimes}</TD>
              <TD>
                <Btn onClick={() => openEdit(c)} color="#1a3a5f" style={{ marginRight: 6, fontSize: 11 }}>Edit</Btn>
                <Btn onClick={() => del(c.id)}   color="#5f1a1a" style={{ fontSize: 11 }}>Delete</Btn>
              </TD>
            </TR>
          ))}
        </Table>
      </div>
      {showModal && (
        <Modal title={editId ? "Edit Criminal Record" : "Add Criminal Record"} onClose={() => setShowModal(false)}>
          {err && <div style={{ color: "#ff6666", background: "#ff444422", border: "1px solid #ff444444", borderRadius: 6, padding: "8px 12px", marginBottom: 14, fontSize: 12 }}>⚠️ {err}</div>}
          <Field label="Full Name">    <Input value={form.name}    onChange={(e) => setForm({ ...form, name:    e.target.value })} placeholder="Criminal's name" /></Field>
          <Field label="Date of Birth"><Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></Field>
          <Field label="Gender">
            <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option>Male</option><option>Female</option><option>Other</option>
            </Select>
          </Field>
          <Field label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" /></Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>At Large</option><option>Arrested</option><option>Convicted</option><option>Released</option>
            </Select>
          </Field>
          <Field label="Crime History"><Textarea value={form.crimes} onChange={(e) => setForm({ ...form, crimes: e.target.value })} placeholder="e.g. Theft (2022), Burglary (2023)" /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
            <Btn onClick={() => setShowModal(false)} color="#2a3a4a">Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── FIR ───────────────────────────────────────────────────────────────────
function FIRSection({ db, setDb }) {
  const blank = { date: new Date().toISOString().slice(0, 10), crime_id: "", description: "", officer_id: "", station_id: "", victim_id: "", status: "Registered" };
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(blank);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState("");

  const openAdd = () => {
    setForm({ ...blank, crime_id: db.crimeTypes[0]?.id || "", officer_id: db.officers[0]?.id || "", station_id: db.stations[0]?.id || "", victim_id: db.victims[0]?.id || "" });
    setEditId(null); setErr(""); setShowModal(true);
  };
  const openEdit = (f) => { setForm({ ...f }); setEditId(f.id); setErr(""); setShowModal(true); };

  const save = async () => {
    setSaving(true); setErr("");
    try {
      const { id, ...body } = form;
      if (editId) {
        const updated = await apiPut("firs", editId, body);
        setDb((d) => ({ ...d, firs: d.firs.map((f) => f.id === editId ? updated : f) }));
      } else {
        const created = await apiPost("firs", body);
        setDb((d) => ({ ...d, firs: [...d.firs, created] }));
      }
      setShowModal(false);
    } catch (e) { setErr(e.message); }
    finally     { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this FIR?")) return;
    try {
      await apiDelete("firs", id);
      setDb((d) => ({ ...d, firs: d.firs.filter((f) => f.id !== id) }));
    } catch (e) { alert("Delete failed: " + e.message); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#e0ecff", fontFamily: "'Rajdhani', sans-serif", fontSize: 20, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>FIR Records</h2>
        <Btn onClick={openAdd}>+ File FIR</Btn>
      </div>
      <div style={{ background: "#0d1e2e", borderRadius: 10, border: "1px solid #1a3050", overflow: "hidden" }}>
        <Table headers={["FIR No.", "Date", "Crime", "Victim", "Officer", "Station", "Status", "Actions"]}>
          {db.firs.map((f) => {
            const ct  = db.crimeTypes.find((c)  => matchId(c.id, f.crime_id));
            const st  = db.stations.find((s)  => matchId(s.id, f.station_id));
            const off = db.officers.find((o)  => matchId(o.id, f.officer_id));
            const vic = db.victims.find((v)   => matchId(v.id, f.victim_id));
            return (
              <TR key={f.id}>
                <TD><span style={{ color: "#4488ff", fontWeight: 700 }}>FIR-{f.id.slice(-4).toUpperCase()}</span></TD>
                <TD>{f.date}</TD>
                <TD>{ct?.name  ?? "—"}</TD>
                <TD>{vic?.name ?? "—"}</TD>
                <TD>{off?.name ?? "—"}</TD>
                <TD>{st?.name  ?? "—"}</TD>
                <TD><Badge text={f.status} color={statusColor[f.status] || "#888"} /></TD>
                <TD>
                  <Btn onClick={() => openEdit(f)} color="#1a3a5f" style={{ marginRight: 6, fontSize: 11 }}>Edit</Btn>
                  <Btn onClick={() => del(f.id)}   color="#5f1a1a" style={{ fontSize: 11 }}>Delete</Btn>
                </TD>
              </TR>
            );
          })}
        </Table>
      </div>
      {showModal && (
        <Modal title={editId ? "Edit FIR" : "File New FIR"} onClose={() => setShowModal(false)}>
          {err && <div style={{ color: "#ff6666", background: "#ff444422", border: "1px solid #ff444444", borderRadius: 6, padding: "8px 12px", marginBottom: 14, fontSize: 12 }}>⚠️ {err}</div>}
          <Field label="Date of Incident"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Crime Type">
            <Select value={form.crime_id} onChange={(e) => setForm({ ...form, crime_id: e.target.value })}>
              {db.crimeTypes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.ipc})</option>)}
            </Select>
          </Field>
          <Field label="Victim">
            <Select value={form.victim_id} onChange={(e) => setForm({ ...form, victim_id: e.target.value })}>
              {db.victims.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </Select>
          </Field>
          <Field label="Investigating Officer">
            <Select value={form.officer_id} onChange={(e) => setForm({ ...form, officer_id: e.target.value })}>
              {db.officers.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.rank})</option>)}
            </Select>
          </Field>
          <Field label="Police Station">
            <Select value={form.station_id} onChange={(e) => setForm({ ...form, station_id: e.target.value })}>
              {db.stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Registered</option><option>Under Investigation</option><option>Chargesheet Filed</option><option>Closed</option>
            </Select>
          </Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the incident…" /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save FIR"}</Btn>
            <Btn onClick={() => setShowModal(false)} color="#2a3a4a">Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Cases ─────────────────────────────────────────────────────────────────
function Cases({ db, setDb }) {
  const blank = { fir_id: "", criminal_id: "", status: "Open", court_date: "", verdict: "", notes: "" };
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(blank);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState("");

  const openAdd  = () => { setForm({ ...blank, fir_id: db.firs[0]?.id || "", criminal_id: db.criminals[0]?.id || "" }); setEditId(null); setErr(""); setShowModal(true); };
  const openEdit = (c) => { setForm({ ...c }); setEditId(c.id); setErr(""); setShowModal(true); };

  const save = async () => {
    setSaving(true); setErr("");
    try {
      const { id, ...body } = form;
      if (editId) {
        const updated = await apiPut("cases", editId, body);
        setDb((d) => ({ ...d, cases: d.cases.map((c) => c.id === editId ? updated : c) }));
      } else {
        const created = await apiPost("cases", body);
        setDb((d) => ({ ...d, cases: [...d.cases, created] }));
      }
      setShowModal(false);
    } catch (e) { setErr(e.message); }
    finally     { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this case?")) return;
    try {
      await apiDelete("cases", id);
      setDb((d) => ({ ...d, cases: d.cases.filter((c) => c.id !== id) }));
    } catch (e) { alert("Delete failed: " + e.message); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#e0ecff", fontFamily: "'Rajdhani', sans-serif", fontSize: 20, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>Case Tracking</h2>
        <Btn onClick={openAdd}>+ Add Case</Btn>
      </div>
      <div style={{ background: "#0d1e2e", borderRadius: 10, border: "1px solid #1a3050", overflow: "hidden" }}>
        <Table headers={["Case ID", "FIR No.", "Accused", "Status", "Court Date", "Verdict", "Notes", "Actions"]}>
          {db.cases.map((c) => {
            const fir  = db.firs.find((f)      => matchId(f.id, c.fir_id));
            const crim = db.criminals.find((cr) => matchId(cr.id, c.criminal_id));
            return (
              <TR key={c.id}>
                <TD><span style={{ color: "#44cc88", fontWeight: 700 }}>CASE-{c.id.slice(-4).toUpperCase()}</span></TD>
                <TD><span style={{ color: "#4488ff" }}>{fir ? `FIR-${fir.id.slice(-4).toUpperCase()}` : "—"}</span></TD>
                <TD><b style={{ color: "#e0ecff" }}>{crim?.name || "—"}</b></TD>
                <TD><Badge text={c.status} color={statusColor[c.status] || "#888"} /></TD>
                <TD>{c.court_date || "—"}</TD>
                <TD>{c.verdict || <span style={{ color: "#445566" }}>Pending</span>}</TD>
                <TD style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.notes || "—"}</TD>
                <TD>
                  <Btn onClick={() => openEdit(c)} color="#1a3a5f" style={{ marginRight: 6, fontSize: 11 }}>Edit</Btn>
                  <Btn onClick={() => del(c.id)}   color="#5f1a1a" style={{ fontSize: 11 }}>Delete</Btn>
                </TD>
              </TR>
            );
          })}
        </Table>
      </div>
      {showModal && (
        <Modal title={editId ? "Edit Case" : "Add New Case"} onClose={() => setShowModal(false)}>
          {err && <div style={{ color: "#ff6666", background: "#ff444422", border: "1px solid #ff444444", borderRadius: 6, padding: "8px 12px", marginBottom: 14, fontSize: 12 }}>⚠️ {err}</div>}
          <Field label="Linked FIR">
            <Select value={form.fir_id} onChange={(e) => setForm({ ...form, fir_id: e.target.value })}>
              {db.firs.map((f) => <option key={f.id} value={f.id}>FIR-{f.id.slice(-4).toUpperCase()} ({f.date})</option>)}
            </Select>
          </Field>
          <Field label="Accused">
            <Select value={form.criminal_id} onChange={(e) => setForm({ ...form, criminal_id: e.target.value })}>
              {db.criminals.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Case Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Open</option><option>Pending</option><option>Closed</option><option>Dismissed</option>
            </Select>
          </Field>
          <Field label="Court Date"><Input type="date" value={form.court_date} onChange={(e) => setForm({ ...form, court_date: e.target.value })} /></Field>
          <Field label="Verdict"><Input value={form.verdict} onChange={(e) => setForm({ ...form, verdict: e.target.value })} placeholder="e.g. Convicted - 3 years" /></Field>
          <Field label="Notes"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Case notes…" /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Case"}</Btn>
            <Btn onClick={() => setShowModal(false)} color="#2a3a4a">Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Victims ───────────────────────────────────────────────────────────────
function Victims({ db, setDb }) {
  const blank = { name: "", dob: "", address: "", contact: "", gender: "Male" };
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(blank);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState("");

  const openAdd  = () => { setForm(blank); setEditId(null); setErr(""); setShowModal(true); };
  const openEdit = (v) => { setForm({ ...v }); setEditId(v.id); setErr(""); setShowModal(true); };

  const save = async () => {
    if (!form.name) return;
    setSaving(true); setErr("");
    try {
      const { id, ...body } = form;
      if (editId) {
        const updated = await apiPut("victims", editId, body);
        setDb((d) => ({ ...d, victims: d.victims.map((v) => v.id === editId ? updated : v) }));
      } else {
        const created = await apiPost("victims", body);
        setDb((d) => ({ ...d, victims: [...d.victims, created] }));
      }
      setShowModal(false);
    } catch (e) { setErr(e.message); }
    finally     { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this victim record?")) return;
    try {
      await apiDelete("victims", id);
      setDb((d) => ({ ...d, victims: d.victims.filter((v) => v.id !== id) }));
    } catch (e) { alert("Delete failed: " + e.message); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#e0ecff", fontFamily: "'Rajdhani', sans-serif", fontSize: 20, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>Victims</h2>
        <Btn onClick={openAdd}>+ Add Victim</Btn>
      </div>
      <div style={{ background: "#0d1e2e", borderRadius: 10, border: "1px solid #1a3050", overflow: "hidden" }}>
        <Table headers={["ID", "Name", "DOB", "Gender", "Contact", "Address", "Actions"]}>
          {db.victims.map((v) => (
            <TR key={v.id}>
              <TD><span style={{ color: "#ff8844", fontFamily: "monospace", fontSize: 11 }}>…{v.id.slice(-6)}</span></TD>
              <TD><b style={{ color: "#e0ecff" }}>{v.name}</b></TD>
              <TD>{v.dob}</TD>
              <TD>{v.gender}</TD>
              <TD>{v.contact}</TD>
              <TD>{v.address}</TD>
              <TD>
                <Btn onClick={() => openEdit(v)} color="#1a3a5f" style={{ marginRight: 6, fontSize: 11 }}>Edit</Btn>
                <Btn onClick={() => del(v.id)}   color="#5f1a1a" style={{ fontSize: 11 }}>Delete</Btn>
              </TD>
            </TR>
          ))}
        </Table>
      </div>
      {showModal && (
        <Modal title={editId ? "Edit Victim" : "Add Victim"} onClose={() => setShowModal(false)}>
          {err && <div style={{ color: "#ff6666", background: "#ff444422", border: "1px solid #ff444444", borderRadius: 6, padding: "8px 12px", marginBottom: 14, fontSize: 12 }}>⚠️ {err}</div>}
          <Field label="Full Name">    <Input value={form.name}    onChange={(e) => setForm({ ...form, name:    e.target.value })} placeholder="Victim's name"  /></Field>
          <Field label="Date of Birth"><Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></Field>
          <Field label="Gender">
            <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option>Male</option><option>Female</option><option>Other</option>
            </Select>
          </Field>
          <Field label="Contact"><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Phone number"  /></Field>
          <Field label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address"   /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
            <Btn onClick={() => setShowModal(false)} color="#2a3a4a">Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
const EMPTY_DB = { stations: [], officers: [], criminals: [], victims: [], crimeTypes: [], firs: [], cases: [] };

export default function App() {
  const [user,    setUser]    = useState(null);
  const [db,      setDb]      = useState(EMPTY_DB);
  const [active,  setActive]  = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState("");
  const [seeding, setSeeding] = useState(false);

  // ── Load all data from backend ──
  const loadAll = useCallback(async () => {
    setLoading(true); setDbError("");
    try {
      const [stations, officers, criminals, victims, crimeTypes, firs, cases] = await Promise.all([
        apiGet("stations"),
        apiGet("officers"),
        apiGet("criminals"),
        apiGet("victims"),
        apiGet("crime-types"),
        apiGet("firs"),
        apiGet("cases"),
      ]);
      setDb({ stations, officers, criminals, victims, crimeTypes, firs, cases });
    } catch (e) {
      setDbError("Cannot reach backend at " + API_BASE + ". Is the server running? (" + e.message + ")");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user) loadAll(); }, [user, loadAll]);

  // ── Seed handler ──
  const handleSeed = async () => {
    if (!window.confirm("This will RESET the database with sample data. Continue?")) return;
    setSeeding(true);
    try {
      await apiFetch("seed", { method: "POST" });
      await loadAll();
    } catch (e) { alert("Seed failed: " + e.message); }
    finally { setSeeding(false); }
  };

  if (!user) return <LoginPage onLogin={setUser} />;

  const nav = [
    { id: "dashboard", label: "Dashboard",     icon: "📊" },
    { id: "fir",       label: "FIR Records",   icon: "📋" },
    { id: "cases",     label: "Case Tracking", icon: "⚖️" },
    { id: "criminals", label: "Criminals",      icon: "🔍" },
    { id: "victims",   label: "Victims",        icon: "🧑" },
    { id: "officers",  label: "Officers",       icon: "👮" },
    { id: "stations",  label: "Stations",       icon: "🏛️" },
  ];

  const sections = {
    dashboard: <Dashboard  db={db} />,
    stations:  <Stations   db={db} setDb={setDb} />,
    officers:  <Officers   db={db} setDb={setDb} />,
    criminals: <Criminals  db={db} setDb={setDb} />,
    victims:   <Victims    db={db} setDb={setDb} />,
    fir:       <FIRSection db={db} setDb={setDb} />,
    cases:     <Cases      db={db} setDb={setDb} />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #070e18; font-family: 'Inter', sans-serif; color: #c8deff; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0a1420; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
        input, select, textarea { font-family: 'Inter', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* ── Sidebar ── */}
        <div style={{ width: 220, background: "#070e18", borderRight: "1px solid #0d2035", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100 }}>
          <div style={{ padding: "22px 16px 16px", borderBottom: "1px solid #0d2035" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #1a6cff, #0044aa)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛡️</div>
              <div>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, color: "#e0ecff", letterSpacing: 1 }}>CRMS</div>
                <div style={{ color: "#4488aa", fontSize: 10, letterSpacing: 1 }}>CRIME RECORDS</div>
              </div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: "12px 8px" }}>
            {nav.map((n) => (
              <button key={n.id} onClick={() => setActive(n.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", background: active === n.id ? "#0d2035" : "transparent", color: active === n.id ? "#4488ff" : "#6688aa", cursor: "pointer", fontSize: 13, fontWeight: active === n.id ? 600 : 400, borderLeft: active === n.id ? "3px solid #4488ff" : "3px solid transparent", marginBottom: 2, textAlign: "left" }}>
                <span>{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

          {/* Seed Button */}
          <div style={{ padding: "8px 16px", borderTop: "1px solid #0d2035" }}>
            <button onClick={handleSeed} disabled={seeding}
              style={{ width: "100%", background: "#0a1e10", border: "1px solid #1a4030", borderRadius: 6, padding: "7px", color: "#44cc88", fontSize: 11, cursor: seeding ? "not-allowed" : "pointer", fontWeight: 600, letterSpacing: 0.5, opacity: seeding ? 0.6 : 1 }}>
              {seeding ? "⏳ Seeding…" : "🌱 Seed Sample Data"}
            </button>
          </div>

          {/* User + Sign Out */}
          <div style={{ padding: "14px 16px", borderTop: "1px solid #0d2035" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #1a6cff, #0044aa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>👤</div>
              <div>
                <div style={{ color: "#c8deff", fontSize: 12, fontWeight: 600 }}>{user.username}</div>
                <div style={{ color: "#4488aa", fontSize: 10 }}>{user.role}</div>
              </div>
            </div>
            <button onClick={() => { setUser(null); setDb(EMPTY_DB); }}
              style={{ width: "100%", background: "#1a0808", border: "1px solid #5f1a1a", borderRadius: 6, padding: "7px", color: "#ff6666", fontSize: 11, cursor: "pointer", fontWeight: 600, letterSpacing: 0.5 }}>
              🚪 Sign Out
            </button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Topbar */}
          <div style={{ background: "#070e18", borderBottom: "1px solid #0d2035", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
            <div>
              <div style={{ color: "#6688aa", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>Crime Record Management System</div>
              <div style={{ color: "#e0ecff", fontFamily: "'Rajdhani', sans-serif", fontSize: 18, letterSpacing: 1, fontWeight: 700 }}>
                {nav.find((n) => n.id === active)?.label}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* DB status dot */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: dbError ? "#ff6666" : "#44cc88" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: dbError ? "#ff4444" : "#44cc88", boxShadow: `0 0 6px ${dbError ? "#ff4444" : "#44cc88"}` }} />
                {dbError ? "Offline" : "MongoDB"}
              </div>
              <div style={{ color: "#4488aa", fontSize: 12 }}>{new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</div>
              <div style={{ background: "#0d2035", border: "1px solid #1a3050", borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#c8deff", fontWeight: 600 }}>{user.username}</span>
                <Badge text={user.role} color="#4488ff" />
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div style={{ padding: 28, flex: 1 }}>
            {dbError && <ErrorBanner message={dbError} onRetry={loadAll} />}
            {loading ? <Spinner /> : sections[active]}
          </div>
        </div>
      </div>
    </>
  );
}
