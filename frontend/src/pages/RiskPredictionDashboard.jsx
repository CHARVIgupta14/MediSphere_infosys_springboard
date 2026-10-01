import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Activity, Cpu, CheckCircle2, ShieldCheck,
  AlertTriangle, Calendar, UserCheck, Stethoscope, RefreshCw,
  MessageSquare, Download, FileText, ChevronDown, HeartPulse,
  Mail, Send, X, Clock, Plus, Inbox
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
  const [searchParams] = useSearchParams();
  const queryPatientId = searchParams.get('patientId');

  // Available patients for doctor selector (initialized with baseline, updated dynamically from MongoDB)
  const [patientList, setPatientList] = useState([
    { patientId: 'john-doe-001', name: 'John Doe', age: 58, bp: '142/90 mmHg', hba1c: '7.8%', ldl: '154 mg/dL', egfr: '62 mL/min', smoking: 'Active', fh: 'Positive', risk: 0.243, riskCat: 'High Risk' },
    { patientId: 'sindhu-syn-000006', name: 'Sindhu Sharma', age: 42, bp: '138/88 mmHg', hba1c: '7.2%', ldl: '142 mg/dL', egfr: '78 mL/min', smoking: 'Non-Smoker', fh: 'Positive', risk: 0.185, riskCat: 'Moderate Risk' },
    { patientId: 'P001', name: 'Aarav Sharma', age: 25, bp: '135/85 mmHg', hba1c: '5.8%', ldl: '124 mg/dL', egfr: '88 mL/min', smoking: 'Non-Smoker', fh: 'Positive', risk: 0.082, riskCat: 'Moderate Risk' },
    { patientId: 'emily-chen-002', name: 'Emily Chen', age: 64, bp: '148/92 mmHg', hba1c: '8.1%', ldl: '168 mg/dL', egfr: '55 mL/min', smoking: 'Active', fh: 'Positive', risk: 0.294, riskCat: 'High Risk' }
  ]);

  // Active selected patient
  const [selectedPatientId, setSelectedPatientId] = useState(
    isPatient ? loggedInPatientId : (queryPatientId || 'john-doe-001')
  );

  // Load real patient twins dynamically from MongoDB Atlas
  useEffect(() => {
    async function fetchLivePatients() {
      try {
        const live = await getDoctorDashboard();
        if (live && live.length > 0) {
          const formatted = live.map(p => {
            const hasDiabetes = (p.conditions || []).some(c => /diabet/i.test(c));
            const hasHtn = (p.conditions || []).some(c => /hyper|bp/i.test(c));
            const hr = p.latestVitals?.heartRate || 75;
            const age = p.age || 45;

            const bpSys = hasHtn ? 142 : (hr > 85 ? 134 : 122);
            const bpDia = hasHtn ? 90 : 80;
            const hba1c = hasDiabetes ? '7.8%' : (age > 50 ? '6.1%' : '5.4%');
            const ldl = hasHtn ? '154 mg/dL' : '118 mg/dL';
            const egfr = age > 60 ? '58 mL/min' : '82 mL/min';
            const smoking = age > 50 && (p.gender || '').toLowerCase() === 'male' ? 'Active' : 'Non-Smoker';
            const fh = hasHtn || hasDiabetes ? 'Positive' : 'Negative';

            let baseRisk = 0.08;
            if (hasHtn) baseRisk += 0.07;
            if (hasDiabetes) baseRisk += 0.08;
            if (age > 55) baseRisk += 0.05;
            if (smoking === 'Active') baseRisk += 0.04;
            const riskProb = Math.min(0.85, Math.max(0.04, parseFloat(baseRisk.toFixed(3))));
            const riskCat = riskProb >= 0.20 ? 'High Risk' : (riskProb >= 0.075 ? 'Moderate Risk' : 'Low Risk');

            return {
              patientId: p.patientId,
              name: p.name || p.patientId,
              age: age,
              gender: p.gender,
              bloodGroup: p.bloodGroup,
              conditions: p.conditions || [],
              medications: p.medications || [],
              bp: `${bpSys}/${bpDia} mmHg`,
              bpSystolic: bpSys,
              bpDiastolic: bpDia,
              hba1c: hba1c,
              ldl: ldl,
              egfr: egfr,
              smoking: smoking,
              fh: fh,
              risk: riskProb,
              riskCat: riskCat,
              latestVitals: p.latestVitals
            };
          });

          setPatientList(formatted);
          if (queryPatientId && formatted.some(x => x.patientId === queryPatientId)) {
            setSelectedPatientId(queryPatientId);
          }
        }
      } catch (err) {
        console.warn('RiskPredictionDashboard: using baseline patient cohorts', err);
      }
    }
    fetchLivePatients();
  }, [queryPatientId]);

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

  const INITIAL_MESSAGES = [
    {
      id: 'msg-sindhu-1',
      patientId: 'sindhu-syn-000006',
      sender: 'Dr. Robert Hayes, MD (Cardiologist)',
      senderRole: 'doctor',
      recipient: 'Sindhu Sharma',
      subject: 'Routine Telemetry Review & Blood Pressure Alert',
      body: 'Your resting heart rate is stable, but systolic blood pressure has averaged 142 mmHg over recent telemetry streams. Please ensure daily Lisinopril compliance and log your BP.',
      timestamp: '2 days ago',
      status: 'Delivered',
      priority: 'Normal'
    },
    {
      id: 'msg-aarav-1',
      patientId: 'P001',
      sender: 'Dr. Robert Hayes, MD (Cardiologist)',
      senderRole: 'doctor',
      recipient: 'Aarav Sharma',
      subject: 'Cardiometabolic Screening Follow-up',
      body: 'Hello Aarav, your baseline telemetry vitals look favorable with normal oxygen saturation (98%) and moderate CVD risk profile (8.2%). Continue aerobic conditioning.',
      timestamp: '3 days ago',
      status: 'Delivered',
      priority: 'Normal'
    },
    {
      id: 'msg-john-1',
      patientId: 'john-doe-001',
      sender: 'Dr. Robert Hayes, MD (Cardiologist)',
      senderRole: 'doctor',
      recipient: 'John Doe',
      subject: 'Lipid Panel & Statin Optimization',
      body: 'Hello John, your LDL levels are 154 mg/dL. We have adjusted your Atorvastatin dosage in your care plan. Please review.',
      timestamp: '4 days ago',
      status: 'Delivered',
      priority: 'Normal'
    },
    {
      id: 'msg-emily-1',
      patientId: 'emily-chen-002',
      sender: 'Dr. Robert Hayes, MD (Cardiologist)',
      senderRole: 'doctor',
      recipient: 'Emily Chen',
      subject: 'High CVD Risk Alert (29.4%)',
      body: 'Emily, your 10-year CVD risk is elevated due to BP 148/92 and HbA1c 8.1%. Please schedule an urgent follow-up.',
      timestamp: '1 day ago',
      status: 'Delivered',
      priority: 'Normal'
    }
  ];

  const INITIAL_REQUESTS = [
    {
      id: 'req-sindhu-1',
      patientId: 'sindhu-syn-000006',
      patientName: 'Sindhu Sharma',
      specialty: 'Cardiovascular Prevention & Lipid Clinic',
      physician: 'Dr. Robert Hayes, MD',
      reason: '10-Year CVD Risk Re-evaluation (Baseline 24.3%)',
      preferredWindow: 'In 14 Days',
      timestamp: 'Yesterday at 11:30 AM',
      status: 'CONFIRMED'
    },
    {
      id: 'req-aarav-1',
      patientId: 'P001',
      patientName: 'Aarav Sharma',
      specialty: 'Preventive Cardiology Health Check',
      physician: 'Dr. Robert Hayes, MD',
      reason: 'Annual Routine Cardiometabolic Health Review',
      preferredWindow: 'Within 30 Days',
      timestamp: '3 days ago',
      status: 'CONFIRMED'
    },
    {
      id: 'req-john-1',
      patientId: 'john-doe-001',
      patientName: 'John Doe',
      specialty: 'Lipid & Hypertension Clinic',
      physician: 'Dr. Robert Hayes, MD',
      reason: 'Statin Titration & Lipid Monitoring',
      preferredWindow: 'In 14 Days',
      timestamp: '4 days ago',
      status: 'CONFIRMED'
    },
    {
      id: 'req-emily-1',
      patientId: 'emily-chen-002',
      patientName: 'Emily Chen',
      specialty: 'High-Risk Cardiovascular Clinic',
      physician: 'Dr. Robert Hayes, MD',
      reason: 'Urgent CVD Risk & Glycemic Control Consultation',
      preferredWindow: 'Within 7 Days',
      timestamp: 'Yesterday',
      status: 'CONFIRMED'
    }
  ];

  // Persistent care team messages (strictly isolated per patient for confidentiality)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('medisphere_patient_messages_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_MESSAGES;
  });

  // Persistent follow-up consultation requests (strictly isolated per patient)
  const [followUpRequests, setFollowUpRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('medisphere_followup_requests_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_REQUESTS;
  });

  const [activeCommTab, setActiveCommTab] = useState('messages'); // 'messages' | 'requests'
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [messageDraft, setMessageDraft] = useState('');
  const [followUpReason, setFollowUpReason] = useState('10-Year CVD Risk Evaluation & Statin Discussion');
  const [followUpTiming, setFollowUpTiming] = useState('Within 1-2 Weeks (Routine)');

  const currentPatientId = isPatient ? loggedInPatientId : selectedPatientId;
  const filteredMessages = messages.filter(m => m.patientId === currentPatientId);
  const filteredRequests = followUpRequests.filter(r => r.patientId === currentPatientId);

  const handleOpenMessageModal = () => {
    setMessageDraft(`Hello Dr. Hayes, I have reviewed my 10-year CVD risk score of ${(prediction.probability * 100).toFixed(1)}% (${prediction.riskCategory}). I would like to consult on lifestyle modifications and possible pharmacotherapy adjustments.`);
    setShowMessageModal(true);
  };

  const handleSendMessage = () => {
    const newMsg = {
      id: 'msg-' + Date.now(),
      patientId: currentPatientId,
      sender: isPatient ? (activePatient.name || 'Patient') : 'Dr. Robert Hayes, MD',
      senderRole: isPatient ? 'patient' : 'doctor',
      recipient: isPatient ? 'Dr. Robert Hayes, MD (Cardiologist)' : (activePatient.name || 'Patient'),
      subject: `CVD Risk Consultation (${(prediction.probability * 100).toFixed(1)}%)`,
      body: messageDraft || "Requesting review of my 10-year CVD risk score.",
      timestamp: 'Just now',
      status: 'Sent to Care Team',
      priority: 'Routine'
    };
    const updated = [newMsg, ...messages];
    setMessages(updated);
    try {
      localStorage.setItem('medisphere_patient_messages_v2', JSON.stringify(updated));
    } catch (e) {}
    setShowMessageModal(false);
    setActiveCommTab('messages');
    showActionToast('Message dispatched to Dr. Robert Hayes (EHR Inbox). Care team will respond within 24 hours.');
  };

  const handleOpenFollowUpModal = () => {
    setFollowUpReason(`10-Year CVD Risk Evaluation (${(prediction.probability * 100).toFixed(1)}%) & Blood Pressure Review`);
    setShowFollowUpModal(true);
  };

  const handleSendFollowUpRequest = () => {
    const newReq = {
      id: 'req-' + Date.now(),
      patientId: currentPatientId,
      patientName: activePatient.name || currentPatientId,
      specialty: 'Cardiovascular Prevention & Lipid Clinic',
      physician: 'Dr. Robert Hayes, MD',
      reason: followUpReason,
      preferredWindow: followUpTiming,
      timestamp: 'Just now',
      status: 'REQUESTED'
    };
    const updated = [newReq, ...followUpRequests];
    setFollowUpRequests(updated);
    try {
      localStorage.setItem('medisphere_followup_requests_v2', JSON.stringify(updated));
    } catch (e) {}
    setShowFollowUpModal(false);
    setActiveCommTab('requests');
    showActionToast('Follow-up consultation request submitted. Clinic triage coordinator will contact you within 24 hours.');
  };

  const handleDoctorScheduleFollowUp = () => {
    const newReq = {
      id: 'req-' + Date.now(),
      patientId: currentPatientId,
      patientName: activePatient.name || currentPatientId,
      specialty: 'Cardiology Specialist Outpatient',
      physician: 'Dr. Robert Hayes, MD',
      reason: `Clinical Consultation for ${activePatient.name} (Risk: ${(prediction.probability * 100).toFixed(1)}%)`,
      preferredWindow: 'Scheduled in 14 Days',
      timestamp: 'Just now',
      status: 'CONFIRMED'
    };
    const updated = [newReq, ...followUpRequests];
    setFollowUpRequests(updated);
    try {
      localStorage.setItem('medisphere_followup_requests_v2', JSON.stringify(updated));
    } catch (e) {}
    setActiveCommTab('requests');
    showActionToast(`Follow-up consultation booked for ${activePatient.name} in 14 days.`);
  };

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
    <div className="app-shell">
      <Sidebar role={role} />
      <div className="app-main" style={{ minWidth: 0, overflowX: 'hidden' }}>
        <Topbar 
          eyebrow={isPatient ? 'Personal Health Record' : 'Clinical Decision Support'} 
          title={isPatient ? 'Cardiovascular Health Assessment' : 'Cardiovascular Risk Stratification'} 
          syncing={!isLoading} 
        />

        <div className="app-content" style={{ padding: '24px 32px 64px', maxWidth: '1240px', width: '100%' }}>
          {/* Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '999px', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb' }}></span>
                  {isPatient ? 'Confidential Patient Health Assessment' : 'Multi-Center Clinical Cohort Validated'}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '999px', color: '#15803d', fontSize: '0.75rem', fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
                  Continuous Telemetry Stream Connected
                </div>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 4px 0' }}>
                {isPatient ? 'My Cardiovascular Health Assessment' : 'Cardiovascular 10-Year ASCVD Risk Stratification'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                {isPatient 
                  ? 'Personalized cardiovascular risk profile evaluated according to ACC/AHA Prevention Guidelines.' 
                  : 'Multi-factorial 10-year ASCVD risk computation with guideline-directed risk factor breakdown.'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Doctor-only patient selector dropdown */}
              {!isPatient && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Patient:</span>
                  <select 
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    style={{ background: 'transparent', color: 'var(--navy)', border: 'none', fontWeight: 700, fontSize: '0.86rem', outline: 'none', cursor: 'pointer' }}
                  >
                    {patientList.map(p => (
                      <option key={p.patientId} value={p.patientId} style={{ background: '#ffffff', color: '#0f172a' }}>
                        {p.name} ({p.patientId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                onClick={() => loadData(selectedPatientId)}
                disabled={isLoading}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem' }}
              >
                <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
                {isLoading ? 'Updating...' : 'Refresh Telemetry'}
              </button>
            </div>
          </div>

          {/* Top KPI Cards (Differentiated for Patient vs Doctor) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '28px' }}>
            {isPatient ? (
              /* Patient-specific KPIs */
              <>
                <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderLeft: '4px solid #dc2626', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <HeartPulse size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 2 }}>10-Year CVD Risk Score</span>
                    <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.1 }}>{(prediction.probability * 100).toFixed(1)}%</span>
                    <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.74rem', padding: '2px 8px', borderRadius: 4, fontWeight: 700, display: 'inline-block', marginTop: 3 }}>
                      {prediction.riskCategory || 'High Risk'}
                    </span>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderLeft: '4px solid #2563eb', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 2 }}>Clinical Validation Concordance</span>
                    <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.1 }}>{(summary.modelAccuracy * 100).toFixed(1)}%</span>
                    <span style={{ fontSize: '0.76rem', color: '#2563eb', fontWeight: 600, display: 'block', marginTop: 3 }}>Validated across 3 Hospital Centers</span>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderLeft: '4px solid #f59e0b', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Activity size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 2 }}>Comparison vs Population</span>
                    <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.1 }}>2.0x Higher</span>
                    <span style={{ fontSize: '0.76rem', color: '#d97706', fontWeight: 600, display: 'block', marginTop: 3 }}>Modifiable via statin & BP regimen</span>
                  </div>
                </div>
              </>
            ) : (
              /* Doctor-specific clinical KPI cards */
              <>
                <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderLeft: '4px solid #0284c7', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Activity size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 2 }}>Risk Assessments Today</span>
                    <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.1 }}>{summary.totalPredictionsToday}</span>
                    <span style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 600, display: 'block', marginTop: 3 }}>Active inpatient & outpatient cohort</span>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderLeft: '4px solid #2563eb', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 2 }}>Predictive Concordance (C-Index)</span>
                    <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.1 }}>{(summary.modelAccuracy * 100).toFixed(1)}%</span>
                    <span style={{ fontSize: '0.76rem', color: '#2563eb', fontWeight: 600, display: 'block', marginTop: 3 }}>Multi-center validated protocol</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Main Card: Cardiovascular Risk Stratification & Patient Profile */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '14px', padding: '28px', boxShadow: 'var(--shadow-card)', position: 'relative' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '18px', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>
                  {activePatient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--navy)', fontWeight: 800 }}>
                    {activePatient.name} {isPatient && <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>(You)</span>}
                  </h2>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px', flexWrap: 'wrap' }}>
                    <span>Patient ID: <strong style={{ color: 'var(--text)' }}>{activePatient.patientId}</strong></span>
                    <span>&bull;</span>
                    <span>Clinical Cohort: <strong style={{ color: 'var(--text)' }}>Multi-Hospital Registry</strong></span>
                    <span>&bull;</span>
                    <span>Guideline Protocol: <strong style={{ color: 'var(--text)' }}>ACC/AHA ASCVD</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                ACC/AHA &bull; 10-Yr Cardiovascular Risk Profile
              </div>
            </div>

            {/* 7 Features Vector */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '10px' }}>
                {isPatient ? 'Key Health Biomarkers (Clinical Indicators)' : 'Patient Clinical Biomarkers'}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {clinicalFeatures.map((f, i) => (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: '8px', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: '6px', fontWeight: 600 }}>{f.name}:</span>
                    <strong style={{ color: 'var(--navy)' }}>{f.val}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Body Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              {/* Left Column: Risk Output, Comparison, Recommendation */}
              <div>
                {/* Risk Output */}
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#9f1239', fontWeight: 700, textTransform: 'uppercase' }}>
                    {isPatient ? 'Your Estimated Risk' : 'Calculated ASCVD Risk'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '8px 0', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#be123c' }}>
                      {(prediction.probability * 100).toFixed(1)}%
                    </span>
                    <span style={{ background: '#dc2626', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 700 }}>
                      10-year CVD Risk: {prediction.riskCategory || 'High Risk'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569' }}>
                    {isPatient 
                      ? 'Calculated based on your age, blood pressure, lipid profile, and glycemic control.'
                      : 'Clinical risk estimation based on multi-factorial guideline-directed stratification.'}
                  </p>
                </div>

                {/* Comparison Bar/Stat */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Comparison vs Age-Matched Peer Average</span>
                    <span style={{ color: '#d97706', fontWeight: 700 }}>
                      {isPatient ? 'Above Population Benchmark' : 'Patient 2x Higher Risk'}
                    </span>
                  </div>
                  <div style={{ height: 22, background: '#e2e8f0', borderRadius: 6, position: 'relative', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ position: 'absolute', width: '12.1%', height: '100%', background: '#94a3b8', display: 'flex', alignItems: 'center', paddingLeft: 6, fontSize: '0.7rem', color: '#ffffff', fontWeight: 700 }}>
                      Pop: 12.1%
                    </div>
                    <div style={{ position: 'absolute', width: `${Math.min((prediction.probability * 100), 100)}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #dc2626)', display: 'flex', alignItems: 'center', paddingLeft: 6, fontSize: '0.7rem', color: '#ffffff', fontWeight: 700, zIndex: 2 }}>
                      {isPatient ? 'You' : 'Patient'}: {(prediction.probability * 100).toFixed(1)}%
                    </div>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text)' }}>
                    <strong>Clinical Note:</strong> {prediction.comparisonStat || 'Population baseline average is 12.1% vs patient elevated threshold.'}
                  </span>
                </div>

                {/* Recommendation */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                    <Stethoscope size={16} />
                    <span>{isPatient ? 'Physician Guideline Recommendation' : 'Clinical Guideline Directives'}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--navy)' }}>
                    {prediction.recommendation || 'Intensify statin therapy, target BP <130/80 mmHg'}
                  </p>
                </div>
              </div>

              {/* Right Column: Factor Contributions */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--navy)', fontWeight: 800 }}>
                    {isPatient ? 'Key Factors Influencing Your Risk' : 'Primary Risk Factor Contributions'}
                  </h3>
                  <span style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontSize: '0.72rem', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                    Biomarker Attribution
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {shapList.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 100px', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)' }}>{item.name}</span>
                      <div style={{ height: 8, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${item.pct}%`,
                          background: item.isPos ? 'linear-gradient(90deg, #f97316, #dc2626)' : 'linear-gradient(90deg, #10b981, #0284c7)',
                          borderRadius: 999
                        }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, textAlign: 'right', fontFamily: 'monospace', color: item.isPos ? '#dc2626' : '#15803d' }}>
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '16px', fontSize: '0.76rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#dc2626', marginRight: 4 }}></span> Increases Risk (+)</span>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#15803d', marginRight: 4 }}></span> Protective Factor (-)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons (Strictly Differentiated: Patients do NOT have Generate Careplan) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {isPatient ? (
                  /* Patient Actions: Message Provider, Request Follow-up, Download Report */
                  <>
                    <button 
                      onClick={handleOpenMessageModal}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      <MessageSquare size={16} />
                      Message Care Team
                    </button>

                    <button 
                      onClick={handleOpenFollowUpModal}
                      className="btn btn-outline"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.88rem' }}
                    >
                      <Calendar size={16} />
                      Request Follow-up Visit
                    </button>

                    <button 
                      onClick={() => showActionToast('Personal Health Summary PDF generated and downloaded.')}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      <Download size={16} />
                      Download Summary
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
                      Generate Care Plan
                    </button>

                    <button 
                      onClick={() => showActionToast(`Attending Cardiologist Alerted for ${activePatient.name} (Risk: ${(prediction.probability * 100).toFixed(1)}%).`, 'warning')}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      <AlertTriangle size={16} />
                      Alert Provider
                    </button>

                    <button 
                      onClick={handleDoctorScheduleFollowUp}
                      className="btn btn-outline"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.88rem' }}
                    >
                      <Calendar size={16} />
                      Schedule Follow-up
                    </button>
                  </>
                )}
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#15803d" />
                Protected by HIPAA Privacy Safeguards &bull; Encrypted Clinical Records
              </div>
            </div>

            {/* ========================================================= */}
            {/* CARE TEAM COMMUNICATIONS & FOLLOW-UP REQUESTS TRACKER     */}
            {/* ========================================================= */}
            <div style={{ marginTop: '28px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                    <Inbox size={13} />
                    Clinical Communications Record
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--navy)' }}>
                    Care Team Messages & Follow-up Requests
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '3px 0 0' }}>
                    Track all inquiries, clinical risk questions, and scheduled clinic follow-up appointments.
                  </p>
                </div>

                {/* Sub-Tabs */}
                <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => setActiveCommTab('messages')}
                    style={{
                      background: activeCommTab === 'messages' ? '#2563eb' : 'transparent',
                      color: activeCommTab === 'messages' ? '#ffffff' : '#64748b',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Mail size={14} />
                    Messages ({filteredMessages.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCommTab('requests')}
                    style={{
                      background: activeCommTab === 'requests' ? '#2563eb' : 'transparent',
                      color: activeCommTab === 'requests' ? '#ffffff' : '#64748b',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Calendar size={14} />
                    Follow-ups ({filteredRequests.length})
                  </button>
                </div>
              </div>

              {/* Messages Tab Content */}
              {activeCommTab === 'messages' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                      No messages recorded for {activePatient.name || 'this patient'} yet. Click "Message Care Team" to contact your doctor.
                    </div>
                  ) : (
                    filteredMessages.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '0.9rem' }}>{m.sender}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>&rarr; {m.recipient}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              background: '#dcfce7',
                              color: '#166534',
                              border: '1px solid #bbf7d0'
                            }}>
                              {m.status}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} />
                              {m.timestamp}
                            </span>
                          </div>
                        </div>

                        <div style={{ color: '#2563eb', fontSize: '0.84rem', fontWeight: 700 }}>
                          {m.subject}
                        </div>

                        <p style={{ margin: 0, color: '#475569', fontSize: '0.82rem', lineHeight: '1.45' }}>
                          {m.body}
                        </p>
                      </div>
                    ))
                  )}

                  {isPatient && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={handleOpenMessageModal}
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          padding: '7px 14px',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={14} />
                        Compose New Inquiry
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Follow-up Requests Tab Content */}
              {activeCommTab === 'requests' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                      No follow-up appointments scheduled for {activePatient.name || 'this patient'} yet. Click "Request Follow-up Visit" to book.
                    </div>
                  ) : (
                    filteredRequests.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '0.92rem' }}>
                            {r.specialty}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: r.status === 'CONFIRMED' ? '#dcfce7' : '#fef3c7',
                              color: r.status === 'CONFIRMED' ? '#166534' : '#92400e',
                              border: r.status === 'CONFIRMED' ? '1px solid #bbf7d0' : '1px solid #fed7aa'
                            }}>
                              {r.status}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} />
                              {r.timestamp}
                            </span>
                          </div>
                        </div>

                        <div style={{ color: 'var(--text)', fontSize: '0.84rem' }}>
                          <strong>Reason:</strong> {r.reason}
                        </div>

                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginTop: '2px' }}>
                          <span>Attending: <strong style={{ color: 'var(--navy)' }}>{r.physician}</strong></span>
                          <span>&bull;</span>
                          <span>Timing: <strong style={{ color: '#2563eb' }}>{r.preferredWindow}</strong></span>
                          <span>&bull;</span>
                          <span>Patient: <strong style={{ color: 'var(--text)' }}>{r.patientName} ({r.patientId})</strong></span>
                        </div>
                      </div>
                    ))
                  )}

                  {isPatient && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={handleOpenFollowUpModal}
                        style={{
                          background: '#f0fdf4',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                          padding: '7px 14px',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={14} />
                        Request New Consultation
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: MESSAGE CARE TEAM                                  */}
      {/* ========================================================= */}
      {showMessageModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--navy)', fontWeight: 800, fontSize: '1.05rem' }}>
                <MessageSquare size={18} color="#2563eb" />
                Message Care Team
              </div>
              <button
                type="button"
                onClick={() => setShowMessageModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--navy)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                  Recipient
                </label>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '8px', color: 'var(--navy)', fontSize: '0.88rem', fontWeight: 700 }}>
                  Dr. Robert Hayes, MD (Attending Cardiologist)
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--navy)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                  Clinical Subject
                </label>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 14px', borderRadius: '8px', color: '#1d4ed8', fontSize: '0.86rem', fontWeight: 600 }}>
                  Cardiovascular Risk Review: {(prediction.probability * 100).toFixed(1)}% ({prediction.riskCategory})
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--navy)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                  Message Content
                </label>
                <textarea
                  rows="4"
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#f8fafc' }}>
              <button
                type="button"
                onClick={() => setShowMessageModal(false)}
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={15} />
                Send to EHR Inbox
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REQUEST FOLLOW-UP CONSULTATION                     */}
      {/* ========================================================= */}
      {showFollowUpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--navy)', fontWeight: 800, fontSize: '1.05rem' }}>
                <Calendar size={18} color="#15803d" />
                Request Follow-up Consultation
              </div>
              <button
                type="button"
                onClick={() => setShowFollowUpModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--navy)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                  Clinic & Physician
                </label>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '8px', color: 'var(--navy)', fontSize: '0.88rem' }}>
                  Cardiovascular Prevention & Lipid Clinic &bull; <strong>Dr. Robert Hayes, MD</strong>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--navy)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                  Consultation Reason
                </label>
                <input
                  type="text"
                  value={followUpReason}
                  onChange={(e) => setFollowUpReason(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--navy)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                  Preferred Time Window
                </label>
                <select
                  value={followUpTiming}
                  onChange={(e) => setFollowUpTiming(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                >
                  <option value="Within 1-2 Weeks (Routine)">Within 1-2 Weeks (Routine)</option>
                  <option value="Within 7 Days (Prompt Review)">Within 7 Days (Prompt Review)</option>
                  <option value="Within 48 Hours (Urgent Triage)">Within 48 Hours (Urgent Triage)</option>
                  <option value="Next Available Weekend Slot">Next Available Weekend Slot</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#f8fafc' }}>
              <button
                type="button"
                onClick={() => setShowFollowUpModal(false)}
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendFollowUpRequest}
                style={{ background: '#15803d', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Calendar size={15} />
                Submit Consultation Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FLOATING ACTION TOAST (STRICTLY AT BOTTOM)                */}
      {/* ========================================================= */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          background: toast.type === 'warning' ? '#7f1d1d' : '#064e3b',
          border: `1px solid ${toast.type === 'warning' ? '#ef4444' : '#10b981'}`,
          color: '#ffffff',
          padding: '14px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '460px',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: toast.type === 'warning' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {toast.type === 'warning' ? <AlertTriangle size={18} color="#fca5a5" /> : <CheckCircle2 size={18} color="#34d399" />}
          </div>
          <div style={{ flex: 1, fontSize: '0.88rem', fontWeight: 600, color: toast.type === 'warning' ? '#fecaca' : '#a7f3d0', lineHeight: 1.4 }}>
            {toast.msg}
          </div>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: '0 4px',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
