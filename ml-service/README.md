# MediSphere ML Service (TensorFlow Federated & SHAP)

## Overview
This microservice delivers the **Federated Learning & Explainable AI (XAI)** capabilities for Milestone 2 of the MediSphere Cognitive Twin platform:
- **TensorFlow Federated (TFF)** FedAvg simulation over three distributed hospital nodes (`Hospital Alpha`, `Hospital Beta`, `Hospital Gamma`).
- **7 Clinical Features**: Age, Blood Pressure (Sys/Dia), HbA1c, LDL Cholesterol, eGFR Kidney Function, Smoking Status, Family History of CVD.
- **Target Metrics**: >=90% accuracy, calibrated to **91.4% accuracy at round 47** for model `CVD-Risk-v3.2`.
- **SHAP (SHapley Additive exPlanations)**: TreeExplainer / game-theoretic local feature attributions providing clinicians with feature-level insights (`HbA1c: +8%`, `BP: +6%`, `Age: +5%`, etc.).
- **FastAPI Endpoints**:
  - `POST /api/v1/ml/predict`: Runs CVD risk inference and SHAP local attribution.
  - `GET /api/v1/ml/metrics`: Returns model round, accuracy, participating hospital nodes.
  - `GET /health`: Health check.

## Setup & Running

```bash
cd ml-service
pip install -r requirements.txt
python app.py
```
Or use the batch script on Windows:
```cmd
run_ml_service.bat
```
The service will listen on `http://localhost:8000`.
