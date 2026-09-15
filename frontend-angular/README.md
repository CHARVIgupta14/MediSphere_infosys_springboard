# MediSphere Angular 20 Frontend Component - Milestone 2

## Component Overview
Standalone Angular 20 component implementing the **AI Risk Prediction Engine** for Milestone 2: Federated Learning & Risk Models.

### Features
1. **3 KPI Cards**:
   - Risk Predictions Today: 342
   - Model Accuracy: 91.4% (Round 47)
   - High Risk Patients: 23 (Require intervention)
2. **Main Card: TensorFlow Federated - Cardiovascular Risk Prediction**:
   - Patient header: John Doe | Model: CVD-Risk-v3.2 | Federated Round: 47
   - 7 Clinical Features chips (Age, BP, HbA1c, LDL, eGFR, Smoking, FH)
   - Risk Output: 10-year CVD Risk: 24.3% (High Risk)
   - SHAP explanations: HbA1c (+8%), BP (+6%), Age (+5%), LDL (+3%), Smoking (+2%), FH (+1.5%), eGFR (-1%)
   - Comparison bar/stat: Population average 12.1% vs Patient 2x higher risk
   - Recommendation text: Intensify statin, BP target <130/80
   - Action buttons: [Generate Careplan], [Alert Provider], [Schedule Follow-up]
3. **Dark Mode Theme**: Deep clinical slate palette (`#080c16`, `#111827`, `#1e293b`), vibrant risk indicators, and glassmorphic touches.

### Usage
Import the standalone component directly in your Angular routing or bootstrap:
```typescript
import { RiskPredictionDashboardComponent } from './risk-prediction-dashboard/risk-prediction-dashboard.component';
```
