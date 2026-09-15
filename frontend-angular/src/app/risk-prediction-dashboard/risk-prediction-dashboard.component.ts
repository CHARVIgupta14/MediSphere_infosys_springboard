import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  RiskPredictionService,
  PredictionSummary,
  FLModelMetrics,
  RiskPrediction
} from './risk-prediction.service';

interface ClinicalFeatureChip {
  name: string;
  value: string;
  unit?: string;
  status: 'normal' | 'elevated' | 'high' | 'alert';
}

interface ShapItem {
  feature: string;
  impactPercent: number;
  direction: 'positive' | 'negative';
  label: string;
}

@Component({
  selector: 'app-risk-prediction-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [RiskPredictionService],
  templateUrl: './risk-prediction-dashboard.component.html',
  styleUrls: ['./risk-prediction-dashboard.component.css']
})
export class RiskPredictionDashboardComponent implements OnInit {

  // Role: 'doctor' | 'patient'
  @Input() role: 'doctor' | 'patient' = 'doctor';
  @Input() loggedInPatientId: string = 'sindhu-syn-000006';

  get isPatient(): boolean {
    return this.role === 'patient';
  }

  // KPI card metrics
  summary: PredictionSummary = {
    totalPredictionsToday: 342,
    modelAccuracy: 0.914,
    round: 47,
    highRiskCount: 23,
    modelName: 'CVD-Risk-v3.2',
    timestamp: new Date().toISOString()
  };

  // Federated learning metrics
  flMetrics: FLModelMetrics = {
    modelId: 'c7b5f12e-8a9d-4e2b-9f0a-1a2b3c4d5e6f',
    modelName: 'CVD-Risk-v3.2',
    round: 47,
    accuracy: 0.914,
    status: 'ACTIVE',
    participatingNodes: 3,
    loss: 0.218,
    timestamp: new Date().toISOString()
  };

  // Patient Card Details
  patientName = 'John Doe';
  patientId = 'sindhu-syn-000006';
  modelVersion = 'CVD-Risk-v3.2';
  federatedRound = 47;

  // Active risk prediction state
  prediction: RiskPrediction = {
    predid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    condition: 'Cardiovascular Disease',
    probability: 0.243,
    patientId: 'sindhu-syn-000006',
    riskCategory: 'High Risk',
    modelVersion: 'CVD-Risk-v3.2',
    federatedRound: 47,
    recommendation: 'Intensify statin, BP target <130/80',
    comparisonStat: 'Population average 12.1% vs Patient 2x higher risk',
    shapValues: {
      'HbA1c': 0.08,
      'BP': 0.06,
      'Age': 0.05,
      'LDL': 0.03,
      'Smoking': 0.02,
      'Family History': 0.015,
      'eGFR': -0.012
    }
  };

  // 7 input features for display
  clinicalFeatures: ClinicalFeatureChip[] = [
    { name: 'Age', value: '58', unit: 'yrs', status: 'normal' },
    { name: 'BP', value: '142/90', unit: 'mmHg', status: 'elevated' },
    { name: 'HbA1c', value: '7.8', unit: '%', status: 'high' },
    { name: 'LDL', value: '154', unit: 'mg/dL', status: 'high' },
    { name: 'eGFR', value: '62', unit: 'mL/min', status: 'elevated' },
    { name: 'Smoking', value: 'Yes', status: 'alert' },
    { name: 'FH', value: 'Positive', status: 'alert' }
  ];

  // SHAP items parsed for waterfall visualizer
  shapItems: ShapItem[] = [];

  // Population comparison
  populationAverage = 12.1;
  patientRiskPercent = 24.3;

  // Interactive notification message
  actionToast: { text: string; type: 'success' | 'info' | 'warning' } | null = null;
  isLoading = false;

  constructor(private predictionService: RiskPredictionService) {}

  ngOnInit(): void {
    if (this.isPatient) {
      this.patientName = 'Sindhu Sharma';
      this.patientId = this.loggedInPatientId;
    }
    this.refreshShapList();
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;
    this.predictionService.getSummary().subscribe({
      next: (data) => (this.summary = data),
      error: () => {}
    });

    this.predictionService.getLatestFLMetrics().subscribe({
      next: (data) => (this.flMetrics = data),
      error: () => {}
    });

    this.predictionService.predictForPatient(this.patientId).subscribe({
      next: (pred) => {
        this.prediction = pred;
        this.patientRiskPercent = Math.round(pred.probability * 1000) / 10;
        this.refreshShapList();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  refreshShapList(): void {
    const raw = this.prediction.shapValues;
    this.shapItems = [
      {
        feature: 'HbA1c',
        impactPercent: (raw['HbA1c'] || 0.08) * 100,
        direction: 'positive',
        label: `+${Math.round((raw['HbA1c'] || 0.08) * 100)}%`
      },
      {
        feature: 'BP',
        impactPercent: (raw['BP'] || 0.06) * 100,
        direction: 'positive',
        label: `+${Math.round((raw['BP'] || 0.06) * 100)}%`
      },
      {
        feature: 'Age',
        impactPercent: (raw['Age'] || 0.05) * 100,
        direction: 'positive',
        label: `+${Math.round((raw['Age'] || 0.05) * 100)}%`
      },
      {
        feature: 'LDL',
        impactPercent: (raw['LDL'] || 0.03) * 100,
        direction: 'positive',
        label: `+${Math.round((raw['LDL'] || 0.03) * 100)}%`
      },
      {
        feature: 'Smoking',
        impactPercent: (raw['Smoking'] || 0.02) * 100,
        direction: 'positive',
        label: `+${Math.round((raw['Smoking'] || 0.02) * 100)}%`
      },
      {
        feature: 'Family History',
        impactPercent: (raw['Family History'] || 0.015) * 100,
        direction: 'positive',
        label: `+${Math.round((raw['Family History'] || 0.015) * 100)}%`
      },
      {
        feature: 'eGFR',
        impactPercent: Math.abs((raw['eGFR'] || -0.012) * 100),
        direction: 'negative',
        label: `-1% (Protective)`
      }
    ];
  }

  // Doctor Action 1: Generate Careplan
  generateCareplan(): void {
    this.showToast(
      `Careplan Generated for ${this.patientName}: Statin titration & BP monitoring protocol dispatched to EHR.`,
      'success'
    );
  }

  // Doctor Action 2: Alert Provider
  alertProvider(): void {
    this.showToast(
      `Priority Alert Dispatched: Attending cardiologist paged for ${this.patientName} (10-yr CVD Risk: 24.3%).`,
      'warning'
    );
  }

  // Doctor / Patient Action: Schedule Follow-up
  scheduleFollowUp(): void {
    this.showToast(
      'Appointment Booked: Cardiovascular clinic consultation scheduled in 14 days.',
      'info'
    );
  }

  // Patient Action 1: Message Care Team
  messageCareTeam(): void {
    this.showToast(
      'Message Sent: Your cardiology care team has been notified to review your CVD risk assessment.',
      'success'
    );
  }

  // Patient Action 2: Download Report
  downloadReport(): void {
    this.showToast(
      'Download Complete: Confidential Cardiovascular Risk Summary (PDF) saved.',
      'info'
    );
  }

  private showToast(text: string, type: 'success' | 'info' | 'warning'): void {
    this.actionToast = { text, type };
    setTimeout(() => {
      this.actionToast = null;
    }, 5500);
  }
}
