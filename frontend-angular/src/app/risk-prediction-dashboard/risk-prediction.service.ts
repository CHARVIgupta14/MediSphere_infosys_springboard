import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface PredictionSummary {
  totalPredictionsToday: number;
  modelAccuracy: number;
  round: number;
  highRiskCount: number;
  modelName: string;
  timestamp: string;
}

export interface FLModelMetrics {
  modelId: string;
  modelName: string;
  round: number;
  accuracy: number;
  status: string;
  participatingNodes: number;
  loss: number;
  timestamp: string;
}

export interface RiskPrediction {
  predid: string;
  condition: string;
  probability: number;
  patientId: string;
  shapValues: { [key: string]: number };
  riskCategory: string;
  modelVersion: string;
  federatedRound: number;
  recommendation: string;
  comparisonStat: string;
  inputFeatures?: { [key: string]: any };
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RiskPredictionService {

  private readonly baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<PredictionSummary> {
    return this.http.get<PredictionSummary>(`${this.baseUrl}/predictions/summary`).pipe(
      catchError(() => of({
        totalPredictionsToday: 342,
        modelAccuracy: 0.914,
        round: 47,
        highRiskCount: 23,
        modelName: 'CVD-Risk-v3.2',
        timestamp: new Date().toISOString()
      }))
    );
  }

  getLatestFLMetrics(): Observable<FLModelMetrics> {
    return this.http.get<FLModelMetrics>(`${this.baseUrl}/models/fl/latest-metrics`).pipe(
      catchError(() => of({
        modelId: 'c7b5f12e-8a9d-4e2b-9f0a-1a2b3c4d5e6f',
        modelName: 'CVD-Risk-v3.2',
        round: 47,
        accuracy: 0.914,
        status: 'ACTIVE',
        participatingNodes: 3,
        loss: 0.218,
        timestamp: new Date().toISOString()
      }))
    );
  }

  predictForPatient(patientId: string, features?: any): Observable<RiskPrediction> {
    return this.http.post<RiskPrediction>(`${this.baseUrl}/predictions/predict/${patientId}`, features || {}).pipe(
      catchError(() => of({
        predid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        condition: 'Cardiovascular Disease',
        probability: 0.243,
        patientId: patientId,
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
      }))
    );
  }
}
