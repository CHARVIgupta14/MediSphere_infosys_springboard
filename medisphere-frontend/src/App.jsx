import { Link, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Patient360 from "./pages/Patient360";

function App() {
  return (
    <div className="app">
      <header className="navbar">
        <Link to="/" className="brand">
          <span className="brand-mark">M</span>
          <span>
            <strong>MediSphere</strong>
            <small>Healthcare Digital Twin</small>
          </span>
        </Link>

        <nav>
          <Link to="/">Patients</Link>
        </nav>
      </header>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Dashboard />} />
          <Route path="/patients/:patientId" element={<Patient360 />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
