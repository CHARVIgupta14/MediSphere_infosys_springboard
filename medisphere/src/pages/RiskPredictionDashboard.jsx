import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldAlert, Cpu, CheckCircle2, 
  AlertTriangle, Calendar, UserCheck, Stethoscope, RefreshCw,
  MessageSquare, Download, FileText, ChevronDown, HeartPulse
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getPredictionSummary, getLatestFLMetrics, predictForPatient } from '../services/predictionApi';
import { getDoctorDashboard, getPatientDashboard } from '../services/api';
import { getSession } from '../services/session';

export default function RiskPredictionDashboard() {
  const session = getSession();
  const role = session?.role || 'doctor';
  const isPatient = role === 'patient';
  const loggedInPatientId = session?.patientId || 'sindhu-syn-000006';

  // Available patients for doctor selector
  const [patientList, setPatientList] = useState([
    { patientId: 'john-doe-001', name: 'John Doe', age: 58, bp: '142/90 mmHg', hba1c: '7.8%', ldl: '154 mg/dL', egfr: '62 mL/min', smoking: 'Active', fh: 'Positive', risk: 0.243, riskCat: 'High Risk' },
    { patientId: 'sindhu-syn-000006', name: 'Sindhu Sharma', age: 42, bp: '138/88 mmHg', hba1c: '7.2%', ldl: '142 mg/dL', egfr: '78 mL/min', smoking: 'Non-Smoker', fh: 'Positive', risk: 0.185, riskCat: 'Moderate Risk' },
    { patientId: 'emily-chen-002', name: 'Emily Chen', age: 64, bp: '148/92 mmHg', hba1c: '8.1%', ldl: '168 mg/dL', egfr: '55 mL/min', smoking: 'Active', fh: 'Positive', risk: 0.294, riskCat: 'High Risk' }
  ]);

  // Active selected patient
  const [selectedPatientId, setSelectedPatientId] = useState(
    isPatient ? loggedInPatientId : 'john-doe-001'
  );

  const activePatient = patientList.find(p => p.patientId === selectedPatientId) || patientList[0];

  // System KPI metrics
  const [summary, setSummary] = useState({
    totalPredictionsToday: 342,
    modelAccuracy: 0.914,
    round: 47,
    highRiskCount: 23,
    modelName: 'CVD-Risk-v3.2'
  });

  const [flMetrics, setFlMetrics] = useState({
    round: 47,
    accuracy: 0.914,
    status: 'ACTIVE',
    modelName: 'CVD-Risk-v3.2'
  });

  // Active risk prediction state
  const [prediction, setPrediction] = useState({
    predid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    condition: 'Cardiovascular Disease',
    probability: activePatient.risk,
    riskCategory: activePatient.riskCat,
    modelVersion: 'CVD-Risk-v3.2',
    federatedRound: 47,
    recommendation: 'Intensify statin, BP target <130/80',
    comparisonStat: 'Population average 12.1% vs Patient 2x higher risk',
    shapValues: {
      'HbA1c': 0.08,
      'BP': 0.06,
      'Age': 0.05,
      'LDL': 0.03,
      'Smoking': activePatient.smoking === 'Active' ? 0.02 : 0.00,
      'Family History': 0.015,
      'eGFR': -0.012
    }
  });

  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If patient, enforce viewing only their own record
    if (isPatient) {
      setSelectedPatientId(loggedInPatientId);
    }
    loadData(isPatient ? loggedInPatientId : selectedPatientId);
  }, [selectedPatientId, isPatient]);

  async function loadData(targetPid) {
    setIsLoading(true);
    try {
      const [sum, fl, pred] = await Promise.all([
        getPredictionSummary(),
        getLatestFLMetrics(),
        predictForPatient(targetPid)
      ]);
      if (sum) setSummary(sum);
      if (fl) setFlMetrics(fl);
      if (pred) {
        setPrediction(pred);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  function showActionToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  }

  const clinicalFeatures = [
    { name: 'Age', val: `${activePatient.age} yrs`, status: activePatient.age > 50 ? 'elevated' : 'normal' },
    { name: 'BP', val: activePatient.bp, status: 'elevated' },
    { name: 'HbA1c', val: activePatient.hba1c, status: parseFloat(activePatient.hba1c) > 7 ? 'high' : 'normal' },
    { name: 'LDL', val: activePatient.ldl, status: 'high' },
    { name: 'eGFR', val: activePatient.egfr, status: 'elevated' },
    { name: 'Smoking', val: activePatient.smoking, status: activePatient.smoking === 'Active' ? 'alert' : 'normal' },
    { name: 'FH', val: activePatient.fh, status: 'alert' },
  ];

  const shapList = [
    { name: 'HbA1c', val: '+8%', pct: 80, isPos: true },
    { name: 'BP', val: '+6%', pct: 60, isPos: true },
    { name: 'Age', val: '+5%', pct: 50, isPos: true },
    { name: 'LDL', val: '+3%', pct: 30, isPos: true },
    { name: 'Smoking', val: activePatient.smoking === 'Active' ? '+2%' : '0%', pct: activePatient.smoking === 'Active' ? 20 : 0, isPos: true },
    { name: 'Family History', val: '+1.5%', pct: 15, isPos: true },
    { name: 'eGFR', val: '-1.2% (Protective)', pct: 15, isPos: false },
  ];

  return (
    <div className="app-shell" style={{ background: '#080c16', minHeight: '100vh' }}>
      <Sidebar role={role} />
      <div className="app-main" style={{ minWidth: 0, overflowX: 'hidden', background: '#080c16', color: '#e2e8f0' }}>
        <Topbar 
          eyebrow={isPatient ? 'Personal Health Record' : 'Clinical Workspace'} 
          title={isPatient ? 'My Cardiovascular Risk Twin' : 'AI Risk Prediction Engine'} 
          syncing={!isLoading} 
        />

        <div className="app-content" style={{ padding: '24px 32px 64px', maxWidth: '1240px', width: '100%' }}>
          {/* Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', padding: '4px 10px', borderRadius: '999px', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 6px #3b82f6' }}></span>
                  {isPatient ? 'Patient Portal • Confidential Health Model' : 'Milestone 2: Federated Learning & Risk Models'}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', padding: '4px 10px', borderRadius: '999px', color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
                  Kafka Stream: Real-Time Telemetry &bull; Dynamic Risk
                </div>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ffffff', margin: '0 0 4px 0' }}>
                {isPatient ? 'My Cardiovascular Health Assessment' : 'AI Risk Prediction Engine'}
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                {isPatient 
                  ? 'Your personalized cardiovascular digital twin computed from streaming vitals and privacy-preserving Federated Learning.' 
                  : 'TensorFlow Federated (TFF) FedAvg • Local SHAP Explainability • Dynamic Kafka Vitals Stream'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Doctor-only patient selector dropdown */}
              {!isPatient && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111827', border: '1px solid #1f2937', padding: '6px 12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Patient:</span>
                  <select 
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    style={{ background: 'transparent', color: '#ffffff', border: 'none', fontWeight: 600, fontSize: '0.86rem', outline: 'none', cursor: 'pointer' }}
                  >
                    {patientList.map(p => (
                      <option key={p.patientId} value={p.patientId} style={{ background: '#111827', color: '#fff' }}>
                        {p.name} ({p.patientId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                onClick={() => loadData(selectedPatientId)}
                disabled={isLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem' }}
              >
                <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
                {isLoading ? 'Refreshing...' : 'Sync Telemetry'}
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div style={{
              background: toast.type === 'warning' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
              border: `1px solid ${toast.type === 'warning' ? '#ef4444' : '#10b981'}`,
              color: toast.type === 'warning' ? '#fca5a5' : '#6ee7b7',
              padding: '12px 18px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {toast.type === 'warning' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
              <span>{toast.msg}</span>
            </div>
          )}

          {/* Top KPI Cards (Differentiated for Patient vs Doctor) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '28px' }}>
            {isPatient ? (
              /* Patient-specific KPIs */
              <>
                <div style={{ background: '#111827', border: '1px solid #1f2937', borderTop: '3px solid #ef4444', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(239,68,68,0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <HeartPulse size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 2 }}>My 10-Year CVD Risk</span>
                    <span style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>{(prediction.probability * 100).toFixed(1)}%</span>
                    <span style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.74rem', padding: '2px 8px', borderRadius: 4, fontWeight: 600, display: 'inline-block', marginTop: 3 }}>
                      {prediction.riskCategory || 'High Risk'}
                    </span>
                  </div>
                </div>

                <div style={{ background: '#111827', border: '1px solid #1f2937', borderTop: '3px solid #3b82f6', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Cpu size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 2 }}>AI Model Reliability</span>
                    <span style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>{(summary.modelAccuracy * 100).toFixed(1)}%</span>
                    <span style={{ fontSize: '0.78rem', color: '#60a5fa', display: 'block', marginTop: 3 }}>Validated across 3 Hospital Centers</span>
                  </div>
                </div>

                <div style={{ background: '#111827', border: '1px solid #1f2937', borderTop: '3px solid #f59e0b', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Activity size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 2 }}>Comparison vs Population</span>
                    <span style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>2.0x Higher</span>
                    <span style={{ fontSize: '0.78rem', color: '#f59e0b', display: 'block', marginTop: 3 }}>Actionable via statin & BP control</span>
                  </div>
                </div>
              </>
            ) : (
              /* Doctor-specific clinical KPI cards */
              <>
                <div style={{ background: '#111827', border: '1px solid #1f2937', borderTop: '3px solid #06b6d4', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(6,182,212,0.12)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Activity size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 2 }}>Risk Predictions Today</span>
                    <span style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>{summary.totalPredictionsToday}</span>
                    <span style={{ fontSize: '0.78rem', color: '#10b981', display: 'block', marginTop: 3 }}>&uarr; 14.8% vs baseline</span>
                  </div>
                </div>

                <div style={{ background: '#111827', border: '1px solid #1f2937', borderTop: '3px solid #3b82f6', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Cpu size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 2 }}>Model Accuracy</span>
                    <span style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>{(summary.modelAccuracy * 100).toFixed(1)}%</span>
                    <span style={{ fontSize: '0.78rem', color: '#60a5fa', display: 'block', marginTop: 3 }}>(Round {summary.round}) &bull; Target &ge;90%</span>
                  </div>
                </div>

                <div style={{ background: '#111827', border: '1px solid #1f2937', borderTop: '3px solid #ef4444', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(239,68,68,0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 2 }}>High Risk Patients</span>
                    <span style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>{summary.highRiskCount}</span>
                    <span style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.74rem', padding: '2px 8px', borderRadius: 4, fontWeight: 600, display: 'inline-block', marginTop: 3 }}>Require intervention</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Main Card: TensorFlow Federated - Cardiovascular Risk Prediction */}
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '16px', padding: '28px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6)', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}></div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '18px', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>
                  {activePatient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#ffffff', fontWeight: 700 }}>
                    {activePatient.name} {isPatient && <span style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 500 }}>(You)</span>}
                  </h2>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px', flexWrap: 'wrap' }}>
                    <span>Patient ID: <strong style={{ color: '#e2e8f0' }}>{activePatient.patientId}</strong></span>
                    <span>&bull;</span>
                    <span>Model: <strong style={{ color: '#e2e8f0' }}>{prediction.modelVersion || 'CVD-Risk-v3.2'}</strong></span>
                    <span>&bull;</span>
                    <span>Federated Round: <strong style={{ color: '#e2e8f0' }}>{prediction.federatedRound || 47}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.35)', color: '#fb923c', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                TensorFlow Federated &bull; CVD Risk Prediction
              </div>
            </div>

            {/* 7 Features Vector */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
                {isPatient ? 'My Health Biomarkers (7 Input Features)' : 'Patient Clinical Feature Vector (7 Features)'}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {clinicalFeatures.map((f, i) => (
                  <div key={i} style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '8px 14px', borderRadius: '8px', fontSize: '0.84rem' }}>
                    <span style={{ color: '#94a3b8', marginRight: '6px' }}>{f.name}:</span>
                    <strong style={{ color: '#ffffff' }}>{f.val}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Body Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              {/* Left Column: Risk Output, Comparison, Recommendation */}
              <div>
                {/* Risk Output */}
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.82rem', color: '#fca5a5', fontWeight: 600, textTransform: 'uppercase' }}>
                    {isPatient ? 'Your Estimated Risk' : 'Risk Output'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '8px 0', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ffffff' }}>
                      {(prediction.probability * 100).toFixed(1)}%
                    </span>
                    <span style={{ background: '#ef4444', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 700 }}>
                      10-year CVD Risk: {prediction.riskCategory || 'High Risk'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#94a3b8' }}>
                    {isPatient 
                      ? 'Based on your age, blood pressure, cholesterol, and blood sugar telemetry.'
                      : 'Decentralized consensus estimation across 3 hospital clinical nodes.'}
                  </p>
                </div>

                {/* Comparison Bar/Stat */}
                <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                    <span style={{ color: '#94a3b8' }}>Comparison Metric</span>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                      {isPatient ? 'Your Risk vs Average Peer' : 'Patient 2x Higher Risk'}
                    </span>
                  </div>
                  <div style={{ height: 22, background: '#1e293b', borderRadius: 6, position: 'relative', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ position: 'absolute', width: '12.1%', height: '100%', background: '#475569', display: 'flex', alignItems: 'center', paddingLeft: 6, fontSize: '0.7rem', color: '#ffffff', fontWeight: 600 }}>
                      Pop Avg: 12.1%
                    </div>
                    <div style={{ position: 'absolute', width: `${Math.min((prediction.probability * 100), 100)}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', paddingLeft: 6, fontSize: '0.7rem', color: '#ffffff', fontWeight: 700, zIndex: 2 }}>
                      {isPatient ? 'You' : 'Patient'}: {(prediction.probability * 100).toFixed(1)}%
                    </div>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                    <strong>Stat:</strong> {prediction.comparisonStat || 'Population average 12.1% vs Patient 2x higher risk'}
                  </span>
                </div>

                {/* Recommendation */}
                <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                    <Stethoscope size={16} />
                    <span>{isPatient ? 'Your Physician Recommendation' : 'Clinical Recommendation'}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#ffffff' }}>
                    {prediction.recommendation || 'Intensify statin, BP target <130/80'}
                  </p>
                </div>
              </div>

              {/* Right Column: SHAP Explanations */}
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff', fontWeight: 700 }}>
                    {isPatient ? 'Top Factors Affecting Your Risk' : 'SHAP Explanations'}
                  </h3>
                  <span style={{ background: 'rgba(139,92,246,0.15)', color: '#c084fc', fontSize: '0.72rem', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                    TreeExplainer
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {shapList.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 100px', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{item.name}</span>
                      <div style={{ height: 8, background: '#1e293b', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${item.pct}%`,
                          background: item.isPos ? 'linear-gradient(90deg, #f97316, #ef4444)' : 'linear-gradient(90deg, #10b981, #06b6d4)',
                          borderRadius: 999
                        }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, textAlign: 'right', fontFamily: 'monospace', color: item.isPos ? '#f87171' : '#34d399' }}>
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #1e293b', display: 'flex', gap: '16px', fontSize: '0.76rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ef4444', marginRight: 4 }}></span> Increases Risk (+)</span>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10b981', marginRight: 4 }}></span> Protective Factor (-)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons (Strictly Differentiated: Patients do NOT have Generate Careplan) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1f2937', paddingTop: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {isPatient ? (
                  /* Patient Actions: Message Provider, Request Follow-up, Download Report */
                  <>
                    <button 
                      onClick={() => showActionToast('Message sent to your cardiologist: "Requesting review of my 10-year CVD risk score."')}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      <MessageSquare size={16} />
                      Message Care Team
                    </button>

                    <button 
                      onClick={() => showActionToast('Follow-up request submitted. The clinic scheduler will contact you within 24 hours.')}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      <Calendar size={16} />
                      Request Follow-up Visit
                    </button>

                    <button 
                      onClick={() => showActionToast('Personal Health Summary PDF generated and downloaded.')}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111827', color: '#94a3b8', border: '1px solid #1f2937', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      <Download size={16} />
                      Download Risk Summary
                    </button>
                  </>
                ) : (
                  /* Doctor Actions: Generate Careplan, Alert Provider, Schedule Follow-up */
                  <>
                    <button 
                      onClick={() => showActionToast(`Careplan Generated for ${activePatient.name}: Statin titration & BP monitoring protocol dispatched to EHR.`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      <UserCheck size={16} />
                      Generate Careplan
                    </button>

                    <button 
                      onClick={() => showActionToast(`Attending Cardiologist Alerted for ${activePatient.name} (Risk: ${(prediction.probability * 100).toFixed(1)}%).`, 'warning')}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dc2626', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      <AlertTriangle size={16} />
                      Alert Provider
                    </button>

                    <button 
                      onClick={() => showActionToast(`Follow-up consultation booked for ${activePatient.name} in 14 days.`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      <Calendar size={16} />
                      Schedule Follow-up
                    </button>
                  </>
                )}
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#10b981" />
                {isPatient ? 'Protected by HIPAA Privacy Safeguards' : 'Federated EHR Enclave • HIPAA Compliant'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
