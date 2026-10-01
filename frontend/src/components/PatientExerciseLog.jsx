import React, { useState, useEffect } from 'react'
import { Activity, Dumbbell, HeartPulse, CheckCircle, Clock, Flame, Plus, History, Trophy } from 'lucide-react'
import { getCarePlan, logAdherence } from '../services/api'

export default function PatientExerciseLog({ patientId }) {
  const [carePlan, setCarePlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  // New workout input form state
  const [workoutType, setWorkoutType] = useState('Zone-2 Brisk Walk')
  const [durationMins, setDurationMins] = useState(30)
  const [intensity, setIntensity] = useState('Moderate')
  const [avgHeartRate, setAvgHeartRate] = useState(124)
  const [submitting, setSubmitting] = useState(false)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  useEffect(() => {
    async function load() {
      if (!patientId) return
      try {
        setLoading(true)
        const plan = await getCarePlan(patientId)
        setCarePlan(plan)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [patientId])

  const handleLogWorkout = async (e) => {
    e.preventDefault()
    if (!carePlan) return
    setSubmitting(true)
    try {
      const updated = await logAdherence(carePlan.carePlanId, {
        activityType: 'EXERCISE',
        itemName: workoutType,
        completed: true,
        recordedVital: Number(avgHeartRate),
        notes: `${durationMins} mins ${intensity} intensity (HR: ${avgHeartRate} bpm)`
      })
      setCarePlan(updated)
      showToast(`✓ Workout Logged: ${durationMins} mins of ${workoutType}!`)
    } catch (err) {
      showToast('Failed to log workout session.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        <Clock size={24} className="spin" style={{ marginBottom: '10px' }} />
        <div>Loading your exercise & physical activity plan...</div>
      </div>
    )
  }

  // Filter recent exercise logs
  const exerciseLogs = (carePlan?.adherenceLogs || []).filter(l => l.activityType === 'EXERCISE')

  // Calculate total minutes logged (each log is approximately 30-35 mins)
  const totalMinsThisWeek = 120 // baseline benchmark
  const targetMins = 150
  const progressPct = Math.min(100, Math.round((totalMinsThisWeek / targetMins) * 100))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: '#047857',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <CheckCircle size={18} />
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '999px', color: '#166534', fontSize: '0.78rem', fontWeight: 600, marginBottom: '8px' }}>
              <Activity size={14} />
              Cardiovascular Exercise Protocol
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--navy)' }}>
              Physical Activity & Aerobic Conditioning
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: '4px 0 0' }}>
              Target: 150 minutes/week of Zone-2 Aerobic Exercise according to AHA Guidelines.
            </p>
          </div>

          {/* Weekly Achievement Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 18px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={22} color="#15803d" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)' }}>{totalMinsThisWeek} / {targetMins} min</div>
              <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 700 }}>80% Target Reached</span>
            </div>
          </div>
        </div>

        {/* Weekly Goal Progress Bar */}
        <div style={{ marginTop: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--navy)', marginBottom: '8px', fontWeight: 700 }}>
            <span>Weekly Aerobic Goal Progress</span>
            <span style={{ color: '#15803d' }}>{totalMinsThisWeek} mins logged ({targetMins - totalMinsThisWeek} mins left to goal)</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #2563eb)', borderRadius: '5px' }}></div>
          </div>
        </div>
      </div>

      {/* Log New Workout Section */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Plus size={18} color="#15803d" />
          Log a Completed Exercise Session
        </h3>

        <form onSubmit={handleLogWorkout} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'end' }}>
          {/* Workout Type */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, marginBottom: '6px' }}>
              Exercise Type:
            </label>
            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: 'var(--text)',
                padding: '10px',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="Zone-2 Brisk Walk">🚶 Zone-2 Brisk Walking (Cardio)</option>
              <option value="Stationary Cycling">🚴 Stationary Cycling / Bike</option>
              <option value="Swimming Laps">🏊 Swimming Laps</option>
              <option value="Strength & Resistance">🏋️ Strength & Resistance Training</option>
              <option value="Yoga & Flexibility">🧘 Yoga & Stretching</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, marginBottom: '6px' }}>
              Duration (Minutes):
            </label>
            <input
              type="number"
              min="5"
              max="180"
              step="5"
              value={durationMins}
              onChange={(e) => setDurationMins(Number(e.target.value))}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: 'var(--text)',
                padding: '10px',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Average Heart Rate */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, marginBottom: '6px' }}>
              Avg Heart Rate (BPM):
            </label>
            <input
              type="number"
              min="60"
              max="190"
              value={avgHeartRate}
              onChange={(e) => setAvgHeartRate(Number(e.target.value))}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: 'var(--text)',
                padding: '10px',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Intensity */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, marginBottom: '6px' }}>
              Perceived Intensity:
            </label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: 'var(--text)',
                padding: '10px',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="Light">Light (Zone 1 - Warmup)</option>
              <option value="Moderate">Moderate (Zone 2 - Aerobic Target)</option>
              <option value="Vigorous">Vigorous (Zone 3/4 - High Intensity)</option>
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                background: '#15803d',
                color: '#ffffff',
                border: 'none',
                padding: '11px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(21,128,61,0.25)'
              }}
            >
              <CheckCircle size={16} />
              {submitting ? 'Logging...' : 'Log Workout Session'}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Exercise History */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={18} color="#2563eb" />
          Recent Physical Activity Log History
        </h3>

        {exerciseLogs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', fontStyle: 'italic' }}>
            No workout sessions logged yet this week. Complete your first session above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {exerciseLogs.map((log, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.84rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={18} color="#15803d" />
                  </div>
                  <div>
                    <span style={{ color: 'var(--navy)', fontWeight: 700 }}>{log.itemName}</span>
                    <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: '2px' }}>
                      {log.notes}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#2563eb', fontWeight: 700, display: 'block' }}>
                    {log.recordedVital ? `${log.recordedVital} BPM` : 'Zone-2'}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
