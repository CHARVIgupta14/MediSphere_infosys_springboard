# MediSphere Frontend

React + Vite

Backend:
Spring Boot
HAPI FHIR R4
MongoDB
Apache Kafka

Backend URL:
http://localhost:8080

Frontend:
http://localhost:5173

## Setup

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

> Note: this project was generated in a sandboxed environment without internet
> access, so `npm install` / `npm run build` could not be run there to verify
> compilation. Run both locally before your demo — if anything doesn't
> compile, share the exact error and it can be fixed quickly.

## Demo patient

```
Patient ID: sindhu-syn-000006
Password:   1234
```

## Demo doctor

```
Username: doctor
Password: 1234
```

Doctor authentication is a **basic demo implementation** hardcoded on the
frontend, because no doctor login API currently exists on the backend. It is
**not production-grade security** — there is no JWT, no Spring Security, and
no server-side session. Patient authentication, by contrast, is real: it
calls `POST /api/auth/login` against your Spring Boot backend.

## What this frontend does

MediSphere is a patient-monitoring and Patient Twin platform. The frontend
only displays data and calls REST APIs — it never generates, mocks, or
randomizes vitals or patient data. All values come from:

```
HAPI FHIR R4 → Spring Boot FHIR Client → PatientTwin → MongoDB
   → Vital Simulator → Kafka → Kafka Consumer → MongoDB latestVitals
   → Spring Boot REST API → MediSphere React Frontend
```

The patient dashboard and doctor dashboard each poll the backend every 5
seconds to reflect the live vitals stream. The browser never connects to
Kafka directly.

## Routes

```
/          → redirects to /login
/login     → patient / doctor sign-in
/patient   → patient dashboard (requires role === "patient")
/doctor    → doctor dashboard (requires role === "doctor")
```

## API contract used

```
POST /api/auth/login
GET  /api/dashboard/{patientId}
GET  /api/consent/{patientId}
POST /api/consent/{patientId}/grant
POST /api/consent/{patientId}/revoke
GET  /api/doctor/dashboard
GET  /api/doctor/patients/{patientId}
```

No other backend endpoints are called or assumed.

## Project structure

```
src/
├── components/
│   ├── Sidebar.jsx
│   ├── Topbar.jsx
│   ├── VitalCard.jsx
│   ├── PatientInfoCard.jsx
│   ├── ConsentCard.jsx
│   ├── ConfirmModal.jsx
│   ├── PatientList.jsx
│   ├── PatientDetails.jsx
│   ├── ProtectedRoute.jsx
│   ├── Loading.jsx
│   └── ErrorMessage.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── PatientDashboard.jsx
│   └── DoctorDashboard.jsx
├── services/
│   ├── api.js
│   └── session.js
├── App.jsx
├── main.jsx
└── styles.css
```
