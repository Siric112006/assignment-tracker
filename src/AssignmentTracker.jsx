import { useState, useEffect, useCallback } from "react";

/* ─── Inline styles (no external CSS needed) ─────────────────────────────── */
const G = {
  // Palette
  indigo:    "#4f46e5",
  indigoD:   "#3730a3",
  indigoL:   "#eef2ff",
  indigoBd:  "#c7d2fe",
  violet:    "#7c3aed",
  bg:        "#f8f7ff",
  surface:   "#ffffff",
  card:      "#ffffff",
  border:    "#e5e7eb",
  border2:   "#d1d5db",
  text:      "#111827",
  text2:     "#374151",
  text3:     "#6b7280",
  text4:     "#9ca3af",
  green:     "#059669",
  greenBg:   "#d1fae5",
  greenText: "#065f46",
  amber:     "#d97706",
  amberBg:   "#fef3c7",
  amberText: "#92400e",
  red:       "#dc2626",
  redBg:     "#fee2e2",
  redText:   "#991b1b",
  blue:      "#2563eb",
  blueBg:    "#dbeafe",
  blueText:  "#1e40af",
  purple:    "#7c3aed",
  purpleBg:  "#ede9fe",
  purpleText:"#5b21b6",
};

/* ─── Toast system ───────────────────────────────────────────────────────── */
let _setToasts = null;
function toast(msg, type = "success") {
  if (_setToasts) _setToasts(prev => [...prev, { id: Date.now() + Math.random(), msg, type }]);
}

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { _setToasts = setToasts; return () => { _setToasts = null; }; }, []);
  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => setToasts(p => p.slice(1)), 3200);
    return () => clearTimeout(t);
  }, [toasts]);

  const colors = {
    success: { bg: G.greenBg, text: G.greenText, border: "#6ee7b7", icon: "✓" },
    error:   { bg: G.redBg,   text: G.redText,   border: "#fca5a5", icon: "✕" },
    info:    { bg: G.blueBg,  text: G.blueText,  border: "#93c5fd", icon: "ℹ" },
    warning: { bg: G.amberBg, text: G.amberText, border: "#fcd34d", icon: "⚠" },
  };

  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:9999, display:"flex", flexDirection:"column", gap:10 }}>
      {toasts.map(t => {
        const c = colors[t.type] || colors.success;
        return (
          <div key={t.id} style={{
            background: c.bg, color: c.text, border: `1px solid ${c.border}`,
            borderRadius: 10, padding: "12px 16px", minWidth: 280, maxWidth: 360,
            display:"flex", alignItems:"center", gap:10,
            boxShadow:"0 4px 16px rgba(0,0,0,0.12)",
            fontFamily:"'Inter',system-ui,sans-serif", fontSize:14, fontWeight:500,
            animation:"slideIn 0.2s ease"
          }}>
            <span style={{ fontSize:16, fontWeight:700 }}>{c.icon}</span>
            {t.msg}
          </div>
        );
      })}
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}

/* ─── localStorage helpers ───────────────────────────────────────────────── */
const LS = {
  users: () => JSON.parse(localStorage.getItem("at_users") || "[]"),
  saveUsers: u => localStorage.setItem("at_users", JSON.stringify(u)),
  session: () => JSON.parse(localStorage.getItem("at_session") || "null"),
  saveSession: s => localStorage.setItem("at_session", JSON.stringify(s)),
  clearSession: () => localStorage.removeItem("at_session"),
  assignments: email => JSON.parse(localStorage.getItem(`at_asgn_${email}`) || "[]"),
  saveAssignments: (email, d) => localStorage.setItem(`at_asgn_${email}`, JSON.stringify(d)),
};

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

/* ─── Input component ────────────────────────────────────────────────────── */
function Input({ label, error, icon, type="text", ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ display:"block", fontSize:13, fontWeight:600, color: G.text2, marginBottom:5, letterSpacing:"0.02em" }}>{label}</label>}
      <div style={{ position:"relative" }}>
        {icon && <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color: G.text4, fontSize:16, pointerEvents:"none" }}>{icon}</span>}
        <input
          type={type} {...props}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width:"100%", padding: icon ? "11px 13px 11px 40px" : "11px 14px",
            border: `1.5px solid ${error ? G.red : focused ? G.indigo : G.border2}`,
            borderRadius:9, fontSize:14.5, color: G.text, background:"#fff",
            outline:"none", transition:"border-color 0.15s, box-shadow 0.15s",
            boxSizing:"border-box", fontFamily:"inherit",
            boxShadow: focused ? `0 0 0 3px ${error ? "#fecaca" : G.indigoL}` : "none",
          }}
        />
      </div>
      {error && <p style={{ margin:"4px 0 0", fontSize:12.5, color: G.red }}>{error}</p>}
    </div>
  );
}

function Select({ label, error, children, ...props }) {
  return (
    <div style={{ marginBottom:18 }}>
      {label && <label style={{ display:"block", fontSize:13, fontWeight:600, color:G.text2, marginBottom:5 }}>{label}</label>}
      <select {...props} style={{
        width:"100%", padding:"11px 14px", border:`1.5px solid ${error ? G.red : G.border2}`,
        borderRadius:9, fontSize:14.5, color:G.text, background:"#fff",
        outline:"none", fontFamily:"inherit", cursor:"pointer", boxSizing:"border-box"
      }}>{children}</select>
      {error && <p style={{ margin:"4px 0 0", fontSize:12.5, color:G.red }}>{error}</p>}
    </div>
  );
}

function Btn({ children, variant="primary", size="md", style:s={}, ...props }) {
  const [hov, setHov] = useState(false);
  const bases = {
    primary:   { bg: G.indigo, hbg: G.indigoD, color:"#fff", border:"transparent" },
    secondary: { bg:"#fff", hbg: G.indigoL, color: G.indigo, border: G.indigoBd },
    danger:    { bg: G.redBg, hbg:"#fecaca", color: G.redText, border:"transparent" },
    ghost:     { bg:"transparent", hbg:"#f3f4f6", color: G.text2, border: G.border },
    success:   { bg: G.greenBg, hbg:"#a7f3d0", color: G.greenText, border:"transparent" },
  };
  const v = bases[variant] || bases.primary;
  const pad = size === "sm" ? "6px 14px" : size === "lg" ? "14px 28px" : "10px 22px";
  const fs = size === "sm" ? 12.5 : size === "lg" ? 16 : 14.5;
  return (
    <button
      {...props}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? v.hbg : v.bg, color: v.color,
        border: `1.5px solid ${v.border}`,
        borderRadius:9, padding:pad, fontSize:fs, fontWeight:600,
        fontFamily:"inherit", cursor:"pointer", transition:"all 0.15s",
        display:"inline-flex", alignItems:"center", gap:7,
        ...s
      }}
    >{children}</button>
  );
}

function Badge({ label, color }) {
  const map = {
    high:      { bg: G.redBg,    text: G.redText,    border:"#fca5a5" },
    medium:    { bg: G.amberBg,  text: G.amberText,  border:"#fcd34d" },
    low:       { bg: G.greenBg,  text: G.greenText,  border:"#6ee7b7" },
    pending:   { bg: G.amberBg,  text: G.amberText,  border:"#fcd34d" },
    "in-progress":{ bg: G.blueBg, text: G.blueText, border:"#93c5fd" },
    completed: { bg: G.greenBg,  text: G.greenText,  border:"#6ee7b7" },
    overdue:   { bg: G.redBg,    text: G.redText,    border:"#fca5a5" },
    Math:      { bg:"#ede9fe", text:"#5b21b6", border:"#c4b5fd" },
    Science:   { bg: G.blueBg,   text: G.blueText,   border:"#93c5fd" },
    English:   { bg:"#fce7f3", text:"#9d174d", border:"#f9a8d4" },
    History:   { bg: G.amberBg,  text: G.amberText,  border:"#fcd34d" },
    CS:        { bg: G.greenBg,  text: G.greenText,  border:"#6ee7b7" },
    Art:       { bg:"#fff1f2", text:"#be123c", border:"#fda4af" },
    Other:     { bg:"#f3f4f6", text:"#374151", border:"#d1d5db" },
  };
  const c = map[color || label] || map.Other;
  return (
    <span style={{
      background:c.bg, color:c.text, border:`1px solid ${c.border}`,
      borderRadius:99, padding:"2px 10px", fontSize:11.5, fontWeight:600,
      whiteSpace:"nowrap", display:"inline-block"
    }}>{label}</span>
  );
}

/* ─── Validate helpers ───────────────────────────────────────────────────── */
function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function validatePassword(p) { return p.length >= 6; }
function validateStudentId(s) { return /^[A-Za-z0-9]{4,12}$/.test(s); }

/* ═══════════════════════════════════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
function Login({ onLogin, onGoSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  function validate() {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!validateEmail(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    return e;
  }

  async function handleLogin(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const users = LS.users();
    const user = users.find(u => u.email === email.toLowerCase() && u.password === password);
    if (!user) {
      setErrors({ password: "Incorrect email or password" });
      toast("Login failed — check your credentials", "error");
      setLoading(false); return;
    }
    LS.saveSession(user);
    toast(`Welcome back, ${user.name.split(" ")[0]}! 👋`, "success");
    setLoading(false);
    onLogin(user);
  }

  const pageStyle = {
    minHeight:"100vh", background:`linear-gradient(135deg, ${G.indigoL} 0%, #f5f3ff 50%, #fdf4ff 100%)`,
    display:"flex", alignItems:"center", justifyContent:"center",
    fontFamily:"'Inter',system-ui,sans-serif", padding:16
  };

  return (
    <div style={pageStyle}>
      <div style={{ width:"100%", maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{
            width:60, height:60, borderRadius:16, background:`linear-gradient(135deg,${G.indigo},${G.violet})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:28, margin:"0 auto 14px", boxShadow:`0 8px 24px rgba(79,70,229,0.3)`
          }}>🎓</div>
          <h1 style={{ fontSize:26, fontWeight:800, color:G.text, margin:"0 0 4px", letterSpacing:"-0.5px" }}>
            Assignment Tracker
          </h1>
          <p style={{ color:G.text3, fontSize:14, margin:0 }}>Manage your academics, effortlessly</p>
        </div>

        {/* Card */}
        <div style={{ background:"#fff", borderRadius:18, padding:"32px 36px", boxShadow:"0 4px 32px rgba(79,70,229,0.10), 0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:G.text, margin:"0 0 6px" }}>Sign in</h2>
          <p style={{ color:G.text3, fontSize:13.5, margin:"0 0 24px" }}>Don't have an account? <button onClick={onGoSignup} style={{ background:"none",border:"none",color:G.indigo,fontWeight:600,cursor:"pointer",fontSize:13.5,padding:0 }}>Create one →</button></p>

          <form onSubmit={handleLogin} noValidate>
            <Input label="Email address" icon="✉" type="email" placeholder="you@university.edu"
              value={email} onChange={e => { setEmail(e.target.value); setErrors(p=>({...p,email:""})); }}
              error={errors.email} />
            <div style={{ position:"relative" }}>
              <Input label="Password" icon="🔒" type={showPw?"text":"password"} placeholder="••••••••"
                value={password} onChange={e => { setPassword(e.target.value); setErrors(p=>({...p,password:""})); }}
                error={errors.password} />
              <button type="button" onClick={() => setShowPw(p=>!p)}
                style={{ position:"absolute", right:13, top:35, background:"none", border:"none", cursor:"pointer", color:G.text4, fontSize:13 }}>
                {showPw?"Hide":"Show"}
              </button>
            </div>

            <Btn type="submit" variant="primary" size="lg" style={{ width:"100%", marginTop:4, justifyContent:"center" }} disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Btn>
          </form>
        </div>

        <p style={{ textAlign:"center", marginTop:20, fontSize:12.5, color:G.text4 }}>
          Demo: register first, then log in with your credentials.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SIGNUP PAGE
═══════════════════════════════════════════════════════════════════════════ */
function Signup({ onGoLogin }) {
  const [form, setForm] = useState({ name:"", studentId:"", email:"", department:"", password:"", confirm:"" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  function set(k) { return v => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:""})); } }

  function validate() {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Enter your full name (min 2 chars)";
    if (!validateStudentId(form.studentId)) e.studentId = "Student ID: 4–12 alphanumeric characters";
    if (!validateEmail(form.email)) e.email = "Enter a valid email address";
    if (!form.department.trim()) e.department = "Department is required";
    if (!validatePassword(form.password)) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  }

  async function handleSignup(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); toast("Fix the errors below", "error"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const users = LS.users();
    if (users.find(u => u.email === form.email.toLowerCase())) {
      setErrors({ email: "An account with this email already exists" });
      toast("Email already registered", "error");
      setLoading(false); return;
    }
    if (users.find(u => u.studentId === form.studentId)) {
      setErrors({ studentId: "This Student ID is already registered" });
      setLoading(false); return;
    }
    const user = { id: uid(), name: form.name.trim(), studentId: form.studentId.trim(), email: form.email.toLowerCase(), department: form.department.trim(), password: form.password, joinedAt: new Date().toISOString() };
    LS.saveUsers([...users, user]);
    toast("Account created! Please sign in.", "success");
    setLoading(false);
    onGoLogin();
  }

  const DEPT = ["Computer Science","Mathematics","Physics","Chemistry","Biology","English","History","Economics","Business","Art & Design","Other"];

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg,${G.indigoL} 0%,#f5f3ff 50%,#fdf4ff 100%)`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',system-ui,sans-serif", padding:16 }}>
      <div style={{ width:"100%", maxWidth:460 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:56, height:56, borderRadius:14, background:`linear-gradient(135deg,${G.indigo},${G.violet})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 12px", boxShadow:`0 8px 24px rgba(79,70,229,0.3)` }}>🎓</div>
          <h1 style={{ fontSize:24, fontWeight:800, color:G.text, margin:"0 0 4px", letterSpacing:"-0.5px" }}>Create your account</h1>
          <p style={{ color:G.text3, fontSize:13.5, margin:0 }}>Join thousands of students staying on top of their work</p>
        </div>

        <div style={{ background:"#fff", borderRadius:18, padding:"30px 36px", boxShadow:"0 4px 32px rgba(79,70,229,0.10)" }}>
          <p style={{ color:G.text3, fontSize:13.5, margin:"0 0 22px" }}>Already have an account? <button onClick={onGoLogin} style={{ background:"none",border:"none",color:G.indigo,fontWeight:600,cursor:"pointer",fontSize:13.5,padding:0 }}>Sign in →</button></p>

          <form onSubmit={handleSignup} noValidate>
            <Input label="Full name" icon="👤" placeholder="Enter your name" value={form.name} onChange={e=>set("name")(e.target.value)} error={errors.name} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Input label="Student ID" icon="🪪" placeholder="2440110" value={form.studentId} onChange={e=>set("studentId")(e.target.value)} error={errors.studentId} />
              <Select label="Department" value={form.department} onChange={e=>set("department")(e.target.value)} error={errors.department}>
                <option value="">Select…</option>
                {DEPT.map(d=><option key={d}>{d}</option>)}
              </Select>
            </div>
            <Input label="Email address" icon="✉" type="email" placeholder="" value={form.email} onChange={e=>set("email")(e.target.value)} error={errors.email} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={{ position:"relative" }}>
                <Input label="Password" icon="🔒" type={showPw?"text":"password"} placeholder="Min 6 chars" value={form.password} onChange={e=>set("password")(e.target.value)} error={errors.password} />
                <button type="button" onClick={()=>setShowPw(p=>!p)} style={{ position:"absolute",right:13,top:35,background:"none",border:"none",cursor:"pointer",color:G.text4,fontSize:12 }}>{showPw?"Hide":"Show"}</button>
              </div>
              <Input label="Confirm password" icon="🔒" type={showPw?"text":"password"} placeholder="Repeat password" value={form.confirm} onChange={e=>set("confirm")(e.target.value)} error={errors.confirm} />
            </div>
            <Btn type="submit" variant="primary" size="lg" style={{ width:"100%", justifyContent:"center" }} disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Btn>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ASSIGNMENT MODAL
═══════════════════════════════════════════════════════════════════════════ */
function AssignmentModal({ existing, onSave, onClose }) {
  const today = new Date().toISOString().slice(0,10);
  const blank = { title:"", subject:"CS", type:"Assignment", due:"", priority:"medium", status:"pending", notes:"" };
  const [form, setForm] = useState(existing || blank);
  const [errors, setErrors] = useState({});

  function set(k) { return v => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:""})); } }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.due) e.due = "Due date is required";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, title: form.title.trim(), notes: form.notes.trim(), id: existing?.id || uid(), createdAt: existing?.createdAt || new Date().toISOString() });
  }

  const overlay = { position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16, fontFamily:"'Inter',system-ui,sans-serif" };
  const modal = { background:"#fff", borderRadius:18, padding:"28px 32px", width:"100%", maxWidth:500, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" };

  const SUBJECTS = ["Cloud Computing","Computer Network","Design Analysis and Algorithm","Linear Algebra","Graph theory","Discrete math","Analytical Solid Geometry","Other"];
  const TYPES = ["Assignment","Essay","Project","Lab Report","Exam","Quiz","Presentation","Reading","Other"];

  return (
    <div style={overlay} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={modal}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h2 style={{ fontSize:19, fontWeight:700, color:G.text, margin:0 }}>{existing?"Edit assignment":"New assignment"}</h2>
          <button onClick={onClose} style={{ background:"#f3f4f6", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:18, color:G.text3, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        <Input label="Title *" placeholder="e.g. Chapter 5 Analysis Essay" value={form.title} onChange={e=>set("title")(e.target.value)} error={errors.title} />

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Select label="Subject" value={form.subject} onChange={e=>set("subject")(e.target.value)}>
            {SUBJECTS.map(s=><option key={s}>{s}</option>)}
          </Select>
          <Select label="Type" value={form.type} onChange={e=>set("type")(e.target.value)}>
            {TYPES.map(t=><option key={t}>{t}</option>)}
          </Select>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:G.text2, marginBottom:5 }}>Due date *</label>
            <input type="date" value={form.due} min={today} onChange={e=>{ set("due")(e.target.value); }}
              style={{ width:"100%", padding:"11px 10px", border:`1.5px solid ${errors.due?G.red:G.border2}`, borderRadius:9, fontSize:13.5, fontFamily:"inherit", color:G.text, outline:"none", boxSizing:"border-box" }} />
            {errors.due && <p style={{ margin:"4px 0 0", fontSize:12.5, color:G.red }}>{errors.due}</p>}
          </div>
          <Select label="Priority" value={form.priority} onChange={e=>set("priority")(e.target.value)}>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </Select>
          <Select label="Status" value={form.status} onChange={e=>set("status")(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </Select>
        </div>

        <div style={{ marginBottom:18 }}>
          <label style={{ display:"block", fontSize:13, fontWeight:600, color:G.text2, marginBottom:5 }}>Notes</label>
          <textarea value={form.notes} onChange={e=>set("notes")(e.target.value)} placeholder="Any details, links, or reminders…" rows={3}
            style={{ width:"100%", padding:"10px 13px", border:`1.5px solid ${G.border2}`, borderRadius:9, fontSize:14, fontFamily:"inherit", color:G.text, outline:"none", resize:"vertical", boxSizing:"border-box" }} />
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave}>{existing?"Save changes":"Add assignment"}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */
function Dashboard({ user, onLogout }) {
  const [assignments, setAssignments] = useState(() => {
    // seed demo data if empty
    const stored = LS.assignments(user.email);
    if (stored.length) return stored;
    const d = n => { const x = new Date(); x.setDate(x.getDate()+n); return x.toISOString().slice(0,10); };
    return [
      {
        id: uid(),
        title: "Cloud Architecture Assignment",
        subject: "Cloud Computing",
        type: "Assignment",
        due: d(2),
        priority: "high",
        status: "pending",
        notes: "Study AWS cloud models and deployment strategies",
        createdAt: new Date().toISOString()
      },
      {
        id: uid(),
        title: "Network Protocol Analysis",
        subject: "Computer Network",
        type: "Assignment",
        due: d(1),
        priority: "high",
        status: "in-progress",
        notes: "Analyze TCP/IP and routing protocols",
        createdAt: new Date().toISOString()
      },
      {
        id: uid(),
        title: "Sorting Algorithm Implementation",
        subject: "Design Analysis and Algorithm",
        type: "Project",
        due: d(5),
        priority: "medium",
        status: "pending",
        notes: "Implement merge sort and analyze complexity",
        createdAt: new Date().toISOString()
      },
      {
        id: uid(),
        title: "Matrix Operations Problem Set",
        subject: "Linear Algebra",
        type: "Assignment",
        due: d(7),
        priority: "medium",
        status: "pending",
        notes: "Solve vector spaces and matrix problems",
        createdAt: new Date().toISOString()
      },
      {
        id: uid(),
        title: "Graph Traversal Algorithms",
        subject: "Graph theory",
        type: "Assignment",
        due: d(3),
        priority: "high",
        status: "in-progress",
        notes: "Study BFS and DFS algorithms",
        createdAt: new Date().toISOString()
      },
      {
        id: uid(),
        title: "Logic and Proof Techniques",
        subject: "Discrete math",
        type: "Notes",
        due: d(-1),
        priority: "low",
        status: "completed",
        notes: "Review propositions and mathematical proofs",
        createdAt: new Date().toISOString()
      },
      {
        id: uid(),
        title: "3D Geometry Problem Solving",
        subject: "Analytical Solid Geometry",
        type: "Assignment",
        due: d(14),
        priority: "medium",
        status: "completed",
        notes: "Practice planes, lines and vectors in 3D space",
        createdAt: new Date().toISOString()
      },
      {
        id: uid(),
        title: "Other Academic Task",
        subject: "Other",
        type: "Project",
        due: d(10),
        priority: "medium",
        status: "pending",
        notes: "Additional coursework activity",
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [modal, setModal] = useState(null); // null | "add" | assignment object
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("due");
  const [view, setView] = useState("list"); // list | grid
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => { LS.saveAssignments(user.email, assignments); }, [assignments, user.email]);

  const today = new Date(); today.setHours(0,0,0,0);
  function daysUntil(due) { return Math.round((new Date(due) - today) / 86400000); }

  function effectiveStatus(a) {
    if (a.status === "completed") return "completed";
    if (daysUntil(a.due) < 0) return "overdue";
    return a.status;
  }

  const filtered = assignments.filter(a => {
    if (filter !== "all" && effectiveStatus(a) !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q) || a.type.toLowerCase().includes(q);
    }
    return true;
  }).sort((a,b) => {
    if (sortBy === "due") return new Date(a.due) - new Date(b.due);
    if (sortBy === "priority") { const order = {high:0,medium:1,low:2}; return order[a.priority]-order[b.priority]; }
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return 0;
  });

  // Stats
  const total = assignments.length;
  const done = assignments.filter(a=>a.status==="completed").length;
  const overdue = assignments.filter(a=>effectiveStatus(a)==="overdue").length;
  const soon = assignments.filter(a=>{ const n=daysUntil(a.due); return n>=0&&n<=3&&a.status!=="completed"; }).length;
  const inProgress = assignments.filter(a=>a.status==="in-progress").length;
  const pct = total ? Math.round(done/total*100) : 0;

  function saveAssignment(data) {
    setAssignments(prev => {
      const exists = prev.find(a=>a.id===data.id);
      const next = exists ? prev.map(a=>a.id===data.id?data:a) : [...prev, data];
      return next;
    });
    toast(modal?.id ? "Assignment updated ✓" : "Assignment added ✓", "success");
    setModal(null);
  }

  function deleteAssignment(id) {
    setAssignments(prev=>prev.filter(a=>a.id!==id));
    toast("Assignment deleted", "info");
    setDeleteConfirm(null);
  }

  function quickStatus(id, status) {
    setAssignments(prev=>prev.map(a=>a.id===id?{...a,status}:a));
    toast(status==="completed"?"Marked as complete 🎉":"Status updated","success");
  }

  function handleLogout() {
    LS.clearSession();
    toast("Signed out. See you soon!", "info");
    setTimeout(onLogout, 400);
  }

  // ── Layout
  const layout = {
    app: { display:"flex", minHeight:"100vh", background:G.bg, fontFamily:"'Inter',system-ui,sans-serif" },
    sidebar: { width:sidebarOpen?240:0, minWidth:sidebarOpen?240:0, background:"#fff", borderRight:`1px solid ${G.border}`, display:"flex", flexDirection:"column", transition:"width 0.2s, min-width 0.2s", overflow:"hidden", flexShrink:0 },
    main: { flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 },
    topbar: { background:"#fff", borderBottom:`1px solid ${G.border}`, padding:"0 24px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 },
    content: { flex:1, padding:24, overflowY:"auto" },
  };

  const navItems = [
    { id:"dashboard", icon:"📊", label:"Dashboard" },
    { id:"assignments", icon:"📋", label:"Assignments" },
    { id:"calendar", icon:"📅", label:"Calendar" },
    { id:"progress", icon:"📈", label:"Progress" },
  ];

  const SUBJECTS_LIST = ["Cloud Computing","Computer Network","Design Analysis and Algorithm","Linear Algebra","Graph theory","Discrete math","Analytical Solid Geometry","Other"];
  const SUBJ_DOTS = { 
    "Cloud Computing":"#4f46e5", 
    "Computer Network":"#2563eb", 
    "Design Analysis and Algorithm":"#7c3aed", 
    "Linear Algebra":"#d97706", 
    "Graph theory":"#059669", 
    "Discrete math":"#e11d48",
    "Analytical Solid Geometry":"#e11d48", 
    "Other":"#6b7280" 
  };

  // ── Calendar helpers
  const [calDate, setCalDate] = useState(new Date());
  function renderCalendar() {
    const y = calDate.getFullYear(), m = calDate.getMonth();
    const firstDay = new Date(y,m,1).getDay();
    const daysInMonth = new Date(y,m+1,0).getDate();
    const cells = [];
    const startDow = (firstDay+6)%7;
    for(let i=0;i<startDow;i++) cells.push(null);
    for(let i=1;i<=daysInMonth;i++) cells.push(i);
    while(cells.length%7!==0) cells.push(null);

    const monthStr = calDate.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <Btn variant="ghost" size="sm" onClick={()=>setCalDate(d=>{const x=new Date(d);x.setMonth(x.getMonth()-1);return x;})}>← Prev</Btn>
          <span style={{ fontWeight:700, fontSize:16 }}>{monthStr}</span>
          <Btn variant="ghost" size="sm" onClick={()=>setCalDate(d=>{const x=new Date(d);x.setMonth(x.getMonth()+1);return x;})}>Next →</Btn>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>(
            <div key={d} style={{ textAlign:"center", fontSize:11.5, fontWeight:700, color:G.text3, padding:"6px 0", textTransform:"uppercase", letterSpacing:"0.05em" }}>{d}</div>
          ))}
          {cells.map((day,i) => {
            if(!day) return <div key={i} />;
            const dateStr = `${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const dayAsgns = assignments.filter(a=>a.due===dateStr);
            const isToday = new Date(y,m,day).toDateString()===today.toDateString();
            return (
              <div key={i} style={{ minHeight:72, background:isToday?G.indigoL:"#fff", border:`1px solid ${isToday?G.indigoBd:G.border}`, borderRadius:8, padding:5, boxSizing:"border-box" }}>
                <div style={{ fontSize:12.5, fontWeight:isToday?700:500, color:isToday?G.indigo:G.text2, marginBottom:3 }}>{day}</div>
                {dayAsgns.slice(0,2).map(a=>(
                  <div key={a.id} style={{ fontSize:10.5, fontWeight:500, padding:"2px 5px", borderRadius:4, background: SUBJ_DOTS[a.subject]+"22", color: SUBJ_DOTS[a.subject], marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.title}</div>
                ))}
                {dayAsgns.length>2&&<div style={{ fontSize:10, color:G.text4 }}>+{dayAsgns.length-2} more</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Progress page
  function renderProgress() {
    const bySubject = SUBJECTS_LIST.map(s => {
      const all = assignments.filter(a=>a.subject===s);
      const done = all.filter(a=>a.status==="completed").length;
      return { subject:s, total:all.length, done, pct: all.length?Math.round(done/all.length*100):0 };
    }).filter(r=>r.total>0);

    return (
      <div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:24 }}>
          {[
            { label:"Completion rate", value:`${pct}%`, color:G.indigo, icon:"🎯" },
            { label:"On-time submissions", value:`${assignments.filter(a=>a.status==="completed"&&daysUntil(a.due)>=0).length}`, color:G.green, icon:"⏰" },
            { label:"Current streak", value:`${Math.min(done,7)} days`, color:G.amber, icon:"🔥" },
            { label:"This week", value:`${assignments.filter(a=>{ const n=daysUntil(a.due); return n>=0&&n<=7; }).length} due`, color:G.purple, icon:"📅" },
          ].map(s=>(
            <div key={s.label} style={{ background:"#fff", border:`1px solid ${G.border}`, borderRadius:14, padding:"18px 20px" }}>
              <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:11, fontWeight:700, color:G.text3, textTransform:"uppercase", letterSpacing:"0.05em" }}>{s.label}</div>
              <div style={{ fontSize:26, fontWeight:800, color:s.color, letterSpacing:"-1px", marginTop:4 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"#fff", border:`1px solid ${G.border}`, borderRadius:14, padding:"20px 24px" }}>
          <h3 style={{ fontSize:15, fontWeight:700, margin:"0 0 18px" }}>Progress by subject</h3>
          {bySubject.length===0 ? <p style={{ color:G.text3 }}>No assignments yet.</p> : bySubject.map(r=>(
            <div key={r.subject} style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", background: SUBJ_DOTS[r.subject], display:"inline-block" }} />
                  <span style={{ fontSize:14, fontWeight:600 }}>{r.subject}</span>
                </div>
                <span style={{ fontSize:12.5, color:G.text3 }}>{r.done}/{r.total} complete · <strong>{r.pct}%</strong></span>
              </div>
              <div style={{ height:8, background:G.border, borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${r.pct}%`, background: SUBJ_DOTS[r.subject], borderRadius:99, transition:"width 0.5s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Assignment card (list row)
  function AssignmentRow({ a }) {
    const n = daysUntil(a.due);
    const es = effectiveStatus(a);
    const dueLabel = es==="overdue" ? `${Math.abs(n)}d overdue` : n===0 ? "Due today" : n===1 ? "Due tomorrow" : `Due in ${n}d`;
    const dueCls = es==="overdue" ? G.red : n<=1 ? G.amber : G.green;

    return (
      <div style={{ background:"#fff", border:`1px solid ${G.border}`, borderRadius:12, padding:"14px 18px", display:"grid", gridTemplateColumns:"auto 1fr auto auto auto", alignItems:"center", gap:14, transition:"box-shadow 0.15s" }}
        onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.07)"}
        onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>

        {/* Checkbox */}
        <div onClick={()=>quickStatus(a.id, a.status==="completed"?"pending":"completed")}
          style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${a.status==="completed"?G.green:G.border2}`, background:a.status==="completed"?G.green:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, color:"#fff", fontSize:13, transition:"all 0.15s" }}>
          {a.status==="completed"&&"✓"}
        </div>

        {/* Info */}
        <div style={{ minWidth:0, opacity: a.status==="completed"?0.6:1 }}>
          <div style={{ fontSize:14.5, fontWeight:600, color:G.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textDecoration:a.status==="completed"?"line-through":"none", marginBottom:4 }}>{a.title}</div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <Badge label={a.subject} color={a.subject} />
            <span style={{ fontSize:12, color:G.text4 }}>·</span>
            <span style={{ fontSize:12, color:G.text3 }}>{a.type}</span>
            {a.notes && <><span style={{ fontSize:12, color:G.text4 }}>·</span><span style={{ fontSize:12, color:G.text4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:180 }}>{a.notes}</span></>}
          </div>
        </div>

        {/* Priority */}
        <Badge label={a.priority} color={a.priority} />

        {/* Status + due */}
        <div style={{ textAlign:"right" }}>
          <Badge label={es} color={es} />
          <div style={{ fontSize:12, color:dueCls, fontWeight:600, marginTop:4 }}>{a.status!=="completed"?dueLabel:"Done"}</div>
        </div>

        {/* Actions */}
        <div style={{ display:"flex", gap:6 }}>
          <Btn variant="ghost" size="sm" onClick={()=>setModal(a)} style={{ padding:"5px 11px", fontSize:12 }}>Edit</Btn>
          <Btn variant="danger" size="sm" onClick={()=>setDeleteConfirm(a.id)} style={{ padding:"5px 11px", fontSize:12 }}>Delete</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={layout.app}>
      {/* Sidebar */}
      <aside style={layout.sidebar}>
        <div style={{ padding:"18px 16px 14px", borderBottom:`1px solid ${G.border}`, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${G.indigo},${G.violet})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>🎓</div>
          <div>
            <div style={{ fontWeight:800, fontSize:14, color:G.text, letterSpacing:"-0.3px" }}>StudyTrack</div>
            <div style={{ fontSize:11, color:G.text4 }}>Assignment Manager</div>
          </div>
        </div>

        <nav style={{ padding:"12px 10px", flex:1 }}>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>setActivePage(item.id)} style={{
              width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:500, textAlign:"left", transition:"all 0.12s",
              background: activePage===item.id ? G.indigoL : "transparent",
              color: activePage===item.id ? G.indigo : G.text2
            }}>
              <span style={{ fontSize:17 }}>{item.icon}</span>{item.label}
            </button>
          ))}

          <div style={{ fontSize:10.5, fontWeight:700, color:G.text4, textTransform:"uppercase", letterSpacing:"0.07em", padding:"18px 12px 6px" }}>By Subject</div>
          {SUBJECTS_LIST.map(s=>{
            const count = assignments.filter(a=>a.subject===s&&a.status!=="completed").length;
            return (
              <button key={s} onClick={()=>{ setActivePage("assignments"); setSearch(""); setFilter("all"); /* handled by filter */ }} style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"7px 12px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13.5,color:G.text2,background:"transparent",textAlign:"left" }}
                onMouseEnter={e=>e.currentTarget.style.background=G.indigoL} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span style={{ width:9,height:9,borderRadius:"50%",background:SUBJ_DOTS[s],flexShrink:0 }} />
                <span style={{ flex:1 }}>{s}</span>
                {count>0&&<span style={{ fontSize:11,fontWeight:700,color:G.indigo,background:G.indigoL,borderRadius:99,padding:"1px 8px" }}>{count}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding:"14px 16px", borderTop:`1px solid ${G.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:G.bg, borderRadius:10 }}>
            <div style={{ width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${G.indigo},${G.violet})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0 }}>
              {user.name.split(" ").map(p=>p[0]).slice(0,2).join("")}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:13,fontWeight:600,color:G.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name}</div>
              <div style={{ fontSize:11,color:G.text4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.department}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={layout.main}>
        {/* Topbar */}
        <div style={layout.topbar}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={()=>setSidebarOpen(p=>!p)} style={{ background:"none",border:`1px solid ${G.border}`,borderRadius:8,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>☰</button>
            <div style={{ fontSize:17, fontWeight:700, color:G.text }}>
              { activePage==="dashboard"&&"Dashboard" }
              { activePage==="assignments"&&"All Assignments" }
              { activePage==="calendar"&&"Calendar" }
              { activePage==="progress"&&"Progress" }
            </div>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {overdue>0&&<span style={{ fontSize:12,fontWeight:700,background:G.redBg,color:G.redText,borderRadius:99,padding:"3px 11px" }}>⚠ {overdue} overdue</span>}
            <Btn variant="ghost" size="sm" onClick={handleLogout}>Sign out</Btn>
            <Btn variant="primary" size="sm" onClick={()=>setModal("add")}>+ Add assignment</Btn>
          </div>
        </div>

        {/* Content */}
        <div style={layout.content}>

          {/* DASHBOARD PAGE */}
          {activePage==="dashboard"&&<>
            {/* Welcome */}
            <div style={{ marginBottom:22 }}>
              <h2 style={{ fontSize:22, fontWeight:800, color:G.text, margin:"0 0 4px", letterSpacing:"-0.5px" }}>
                Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {user.name.split(" ")[0]} 👋
              </h2>
              <p style={{ color:G.text3, margin:0, fontSize:14.5 }}>
                {overdue>0 ? `You have ${overdue} overdue assignment${overdue>1?"s":" "} — let's tackle them!` : soon>0 ? `${soon} assignment${soon>1?"s are":" is"} due in the next 3 days.` : "You're all caught up! Great work."}
              </p>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:22 }}>
              {[
                { label:"Total", value:total, sub:"assignments", color:G.indigo, icon:"📋" },
                { label:"Completed", value:done, sub:`${pct}% done`, color:G.green, icon:"✅" },
                { label:"Overdue", value:overdue, sub:"need attention", color:G.red, icon:"⚠️" },
                { label:"Due soon", value:soon, sub:"within 3 days", color:G.amber, icon:"⏰" },
                { label:"In progress", value:inProgress, sub:"started", color:G.blue, icon:"🔄" },
              ].map(s=>(
                <div key={s.label} style={{ background:"#fff", border:`1px solid ${G.border}`, borderRadius:14, padding:"16px 18px" }}>
                  <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:G.text4, textTransform:"uppercase", letterSpacing:"0.05em" }}>{s.label}</div>
                  <div style={{ fontSize:28, fontWeight:800, color:s.color, letterSpacing:"-1px", lineHeight:1.1, margin:"4px 0 4px" }}>{s.value}</div>
                  <div style={{ fontSize:12, color:G.text4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ background:"#fff", border:`1px solid ${G.border}`, borderRadius:14, padding:"16px 20px", marginBottom:22 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:14, fontWeight:700 }}>Overall progress</span>
                <span style={{ fontSize:14, fontWeight:700, color:G.indigo }}>{pct}%</span>
              </div>
              <div style={{ height:10, background:G.border, borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${G.indigo},${G.violet})`, borderRadius:99, transition:"width 0.5s ease" }} />
              </div>
            </div>

            {/* Upcoming */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <h3 style={{ fontSize:15, fontWeight:700, margin:0 }}>Upcoming assignments</h3>
              <Btn variant="ghost" size="sm" onClick={()=>setActivePage("assignments")}>View all →</Btn>
            </div>
            {assignments.filter(a=>a.status!=="completed").sort((a,b)=>new Date(a.due)-new Date(b.due)).slice(0,5).map((a,i)=>(
              <div key={a.id} style={{ marginBottom: i < 4 ? 8 : 0 }}>
                <AssignmentRow a={a} />
              </div>
            ))}
            {assignments.filter(a=>a.status!=="completed").length===0&&<div style={{ textAlign:"center", padding:"3rem 2rem", color:G.text3 }}><div style={{ fontSize:40,marginBottom:12 }}>🎉</div><div style={{ fontWeight:700,fontSize:16,color:G.text }}>You're all caught up!</div><div style={{ fontSize:14,marginTop:4 }}>Add an assignment to start tracking.</div></div>}
          </>}

          {/* ASSIGNMENTS PAGE */}
          {activePage==="assignments"&&<>
            {/* Filters */}
            <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:16, flexWrap:"wrap" }}>
              {["all","pending","in-progress","completed","overdue"].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{ padding:"6px 16px", borderRadius:99, border:`1.5px solid ${filter===f?G.indigo:G.border2}`, background:filter===f?G.indigo:"#fff", color:filter===f?"#fff":G.text2, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.12s", textTransform:"capitalize" }}>
                  {f==="all"?"All":f==="in-progress"?"In progress":f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
              <div style={{ marginLeft:"auto", display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", background:"#fff", border:`1px solid ${G.border}`, borderRadius:9, padding:"7px 13px", gap:8 }}>
                  <span style={{ color:G.text4, fontSize:15 }}>🔍</span>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{ border:"none", outline:"none", fontSize:13.5, fontFamily:"inherit", color:G.text, width:160, background:"transparent" }} />
                </div>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"7px 12px", border:`1px solid ${G.border}`, borderRadius:9, fontSize:13.5, fontFamily:"inherit", outline:"none", color:G.text }}>
                  <option value="due">Sort: Due date</option>
                  <option value="priority">Sort: Priority</option>
                  <option value="title">Sort: Title</option>
                </select>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {filtered.length===0
                ? <div style={{ textAlign:"center", padding:"4rem 2rem", color:G.text3 }}><div style={{ fontSize:40,marginBottom:12 }}>📭</div><div style={{ fontWeight:700,fontSize:16,color:G.text }}>No assignments found</div><div style={{ fontSize:14,marginTop:4 }}>Try a different filter or search term.</div></div>
                : filtered.map(a=><AssignmentRow key={a.id} a={a}/>)}
            </div>
          </>}

          {/* CALENDAR */}
          {activePage==="calendar"&&<div style={{ background:"#fff", border:`1px solid ${G.border}`, borderRadius:14, padding:"20px 24px" }}>{renderCalendar()}</div>}

          {/* PROGRESS */}
          {activePage==="progress"&&renderProgress()}

        </div>
      </main>

      {/* Modal */}
      {modal && <AssignmentModal existing={modal==="add"?null:modal} onSave={saveAssignment} onClose={()=>setModal(null)} />}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif" }}>
          <div style={{ background:"#fff",borderRadius:16,padding:"28px 32px",maxWidth:380,width:"90%",boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🗑️</div>
            <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 8px" }}>Delete assignment?</h3>
            <p style={{ color:G.text3, fontSize:14, margin:"0 0 22px" }}>This can't be undone.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <Btn variant="ghost" onClick={()=>setDeleteConfirm(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={()=>deleteAssignment(deleteConfirm)}>Delete</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("login"); // login | signup | dashboard
  const [user, setUser] = useState(() => LS.session());

  useEffect(() => {
    if (user) setPage("dashboard");
  }, []);

  function handleLogin(u) { setUser(u); setPage("dashboard"); }
  function handleLogout() { setUser(null); setPage("login"); }

  return (
    <>
      <ToastContainer />
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>
      {page==="login"    && <Login onLogin={handleLogin} onGoSignup={()=>setPage("signup")} />}
      {page==="signup"   && <Signup onGoLogin={()=>setPage("login")} />}
      {page==="dashboard"&& user && <Dashboard user={user} onLogout={handleLogout} />}
    </>
  );
}