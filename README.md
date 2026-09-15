# 🏥 MediSphere — Healthcare Digital Twin Platform

MediSphere is a **Healthcare Digital Twin platform** designed to create a unified digital representation of a patient's health data by integrating **FHIR-based healthcare records, MongoDB, and Apache Kafka**.

The platform follows an event-driven backend architecture where patient information can be imported from FHIR, stored as a digital patient twin, and updated through real-time vital-sign events.

---

## 🎯 Project Objective

Healthcare data is often distributed across different systems. MediSphere aims to provide a centralized **Patient 360° view** by combining:

* Patient demographic information
* Medical conditions
* Active medications
* Clinical observations
* Vital signs
* Event-driven health-data updates

The goal is to create a foundation that can later support **health-risk prediction and clinical decision support**.

---

## 🏗️ Architecture

```text
              FHIR / EHR System
                     │
                     ▼
              HAPI FHIR Server
                     │
                     ▼
             Spring Boot Backend
                     │
              FHIR Patient Data
                     │
                     ▼
            FHIR → PatientTwin
                     │
                     ▼
                MongoDB
             Patient Twin Store
                     │
                     │
          Live Vital Sign Event
                     │
                     ▼
             Kafka Producer
                     │
                     ▼
       medisphere-patient-events
                     │
                     ▼
             Kafka Consumer
                     │
                     ▼
                MongoDB
                     │
                     ▼
              Patient 360°
                 Dashboard
```

---

## 🚀 Key Features

### 1. FHIR Integration

MediSphere integrates with a **FHIR R4 server** to retrieve patient information.

The current implementation uses the public HAPI FHIR test server:

```text
https://hapi.fhir.org/baseR4
```

FHIR Patient resources are retrieved and transformed into the application's internal `PatientTwin` model.

---

### 2. Digital Patient Twin

Patient data is represented using a `PatientTwin` model containing information such as:

* Patient ID
* Name
* Age
* Gender
* Blood group
* Medical conditions
* Medications
* Latest vital signs

The patient twin is persisted in MongoDB.

---

### 3. MongoDB Patient Twin Store

MediSphere uses **MongoDB** to store patient digital twins.

Example structure:

```text
PatientTwin
│
├── patientId
├── name
├── age
├── gender
├── bloodGroup
├── conditions
├── medications
└── latestVitals
    ├── heartRate
    ├── spo2
    ├── temperature
    └── timestamp
```

---

### 4. Event-Driven Architecture with Apache Kafka

MediSphere uses **Apache Kafka** for patient events and real-time vital-sign updates.

Kafka topic:

```text
medisphere-patient-events
```

Example event types:

```text
PATIENT_CREATED
VITALS_UPDATED
```

The intended flow is:

```text
Vital Update
     ↓
Kafka Producer
     ↓
Kafka Topic
     ↓
Kafka Consumer
     ↓
PatientTwin Update
     ↓
MongoDB
```

This allows the backend to follow an event-driven architecture rather than tightly coupling every component.

---

### 5. Patient 360° Dashboard

The frontend provides a clinician-oriented Patient 360° view containing information such as:

* Patient demographics
* Medical conditions
* Medications
* Latest vitals
* FHIR integration status
* Kafka event pipeline status

The dashboard communicates with the Spring Boot backend through REST APIs.

---

## 🛠️ Technology Stack

### Backend

* **Java 21**
* **Spring Boot 4.1.1**
* Spring WebMVC
* Spring Data MongoDB
* Spring Kafka
* Maven

### Healthcare Interoperability

* **FHIR R4**
* HAPI FHIR 8.4.0

### Database

* **MongoDB Atlas**

### Messaging

* **Apache Kafka 4.3.1**
* KRaft mode

### Frontend

* React
* Vite
* JavaScript
* CSS

---

## 📂 Project Structure

```text
MediSphere
│
├── backend
│   ├── config
│   │   ├── KafkaConsumerConfig.java
│   │   ├── KafkaProducerConfig.java
│   │   └── KafkaTopicConfig.java
│   │
│   ├── controller
│   │   ├── FhirController.java
│   │   └── PatientController.java
│   │
│   ├── dto
│   │   └── PatientRequest.java
│   │
│   ├── FHIR
│   │   ├── fhirconfi.java
│   │   └── fhirService.java
│   │
│   ├── kafka
│   │   ├── PatientEvent.java
│   │   ├── PatientEventConsumer.java
│   │   └── PatientEventProducer.java
│   │
│   ├── mapper
│   │   └── FhirPatientMapper.java
│   │
│   ├── model
│   │   ├── PatientTwin.java
│   │   └── VitalSigns.java
│   │
│   ├── repository
│   │   └── PatientRepository.java
│   │
│   └── service
│       └── PatientService.java
│
└── frontend
    └── React + Vite application
```

---

## 🔌 REST APIs

### Get all patients

```http
GET /api/patients
```

### Get a patient

```http
GET /api/patients/{patientId}
```

### Patient 360°

```http
GET /api/patients/{patientId}/360
```

### Update patient vitals

```http
PUT /api/patients/{patientId}/vitals
```

Example request:

```json
{
  "heartRate": 82,
  "spo2": 98,
  "temperature": 36.8
}
```

---

## 🔄 FHIR Workflow

```text
FHIR Patient Resource
        ↓
HAPI FHIR Client
        ↓
Spring Boot FHIR Service
        ↓
FHIR Patient
        ↓
FhirPatientMapper
        ↓
PatientTwin
        ↓
MongoDB
```

This allows standardized healthcare data to be transformed into a format suitable for the MediSphere digital-twin system.

---

## ⚡ Kafka Workflow

Patient events are published to:

```text
medisphere-patient-events
```

A Kafka consumer listens to the topic and processes incoming events.

For vital updates:

```text
VITALS_UPDATED
       ↓
PatientEventProducer
       ↓
Kafka
       ↓
PatientEventConsumer
       ↓
PatientTwin
       ↓
MongoDB
```

---

## 🧪 Example Patient

A sample patient can be represented as:

```text
Patient ID: P001
Name: Aarav Sharma
Age: 25
Gender: Male
Blood Group: O+

Conditions:
- Hypertension

Medications:
- Amlodipine

Latest Vitals:
- Heart Rate
- SpO₂
- Temperature
```

Test FHIR data is obtained from the HAPI FHIR public test server.

---

## ▶️ Running the Project

### Prerequisites

Install:

* Java 21
* Maven
* MongoDB / MongoDB Atlas
* Apache Kafka 4.3.1
* Node.js and npm

---

### 1. Start Kafka

MediSphere uses Kafka in **KRaft mode**, so ZooKeeper is not required.

Start Kafka using:

```bat
bin\windows\kafka-server-start.bat config\server.properties
```

Kafka runs on:

```text
localhost:9092
```

---

### 2. Configure MongoDB

Set the MongoDB connection string through an environment variable:

```text
MONGODB_URI
```

Do **not** commit database credentials to GitHub.

---

### 3. Start the Spring Boot Backend

From the backend project:

```bash
mvn spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

---

### 4. Start the Frontend

From the frontend directory:

```bash
npm install
npm run dev
```

The Vite development server will provide the local frontend URL.

---

## 🔐 Security Note

This project is a development/prototype implementation.

Production deployment would require additional security measures including:

* Authentication and authorization
* Proper healthcare-data access controls
* Consent management
* Secure secrets management
* Encryption
* Audit logging
* Production-grade FHIR infrastructure

MediSphere should **not be considered HIPAA-compliant or production-ready healthcare software** in its current form.

---

## 🔮 Future Enhancements

Planned extensions include:

* SMART on FHIR authentication
* More complete FHIR resource mapping
* FHIR Observation → vital-sign mapping
* Real-time vital data ingestion
* Risk prediction models
* Clinical alerts
* Care-plan management
* Advanced Patient 360° visualization
* Role-based access control
* Audit trails
* Cloud deployment

---

## 📌 Project Status

**Current milestone: FHIR Integration & Digital Twin Foundation**

Implemented foundation:

* ✅ Spring Boot backend
* ✅ FHIR R4 integration
* ✅ FHIR Patient retrieval
* ✅ FHIR → PatientTwin mapping
* ✅ MongoDB Patient Twin storage
* ✅ REST APIs
* ✅ Apache Kafka integration
* ✅ Patient event producer
* ✅ Patient event consumer
* ✅ Patient 360° dashboard foundation

The project is being developed incrementally toward a complete **event-driven healthcare digital twin platform**.

---

 👩‍💻 Author

Charvi Gupta

B.Tech — Computer Science & Engineering

MediSphere is developed as a healthcare technology project exploring **FHIR interoperability, digital twins, event-driven systems, and backend engineering with Java/Spring Boot**.
