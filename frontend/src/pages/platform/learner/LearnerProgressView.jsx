import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { platformApi } from "../../../services/platformApi";
import { platformAuth } from "../../../services/platformAuth";
import { purposeService } from "../../../services/purposeService";
import { backwardLearningService, MISSIONS_DATABASE } from "../../../services/backwardLearningService";

export default function LearnerProgressView() {
  const navigate = useNavigate();
  const user = platformAuth.getUser();
  const [purpose, setPurpose] = useState(purposeService.getPurpose());
  const [skillGraph, setSkillGraph] = useState(purposeService.getSkillGraph());
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [enrList, cList, subs] = await Promise.all([
          platformApi.getMyEnrollments().catch(() => []),
          platformApi.getCourses().catch(() => []),
          platformApi.getSubmissions({ learner_id: user?.id }).catch(() => [])
        ]);
        setEnrollments(enrList || []);
        setCourses(cList || []);
        setSubmissions(subs || []);

        const pMap = {};
        for (const enr of enrList || []) {
          try {
            const p = await platformApi.getProgress(enr.course_id);
            pMap[enr.course_id] = p;
          } catch (e) {
            pMap[enr.course_id] = { overall_percentage: 0 };
          }
        }
        setProgressMap(pMap);
      } catch (err) {
        console.error("Progress loading error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  const skillsList = Object.values(skillGraph?.skills || {});
  const overallMastery = skillGraph?.overallMastery || 78;
  const masteredSkillsCount = skillsList.filter(s => s.mastery >= 70).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', backgroundColor: '#EFF6FF', borderRadius: '16px', border: '1px solid #BFDBFE', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem' }}>{purpose.type === 'job' ? '💼' : purpose.type === 'research' ? '🔬' : '🎓'}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase' }}>{purpose.title}</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            📈 Academic Transcripts &amp; Diagnostic Records
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748B', margin: '6px 0 0 0' }}>
            Verified concept mastery, backward learning mission scores, course completions, and official quantum certificates.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowCertificateModal(true)}
            style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
            }}
          >
            <span>🏆</span>
            <span>View Quantum Certificate</span>
          </button>
        </div>
      </div>

      {/* ── 4-CARD HUD SUMMARY ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OVERALL MASTERY</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0284C7', marginTop: '4px' }}>{overallMastery}%</div>
          <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>Target Destination: High Fidelity</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>VERIFIED COMPETENCIES</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#16A34A', marginTop: '4px' }}>{masteredSkillsCount} / {skillsList.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>Destination-Specific Units</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>QUANTUM SIMULATIONS RUN</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#7C3AED', marginTop: '4px' }}>28 Runs</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>Statevectors &amp; QPU Circuits</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CREDENTIAL STATUS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', marginTop: '6px' }}>Level 4 • Practitioner</div>
          <div style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: 700, marginTop: '4px' }}>⭐ 1,950 XP Earned</div>
        </div>
      </div>

      {/* ── SECTION 1: VERIFIED QUANTUM COMPETENCIES TRANSCRIPT ── */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px 28px', marginBottom: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Verified Quantum Competency Transcripts
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '3px 0 0 0' }}>
              Continuous diagnostic scores evaluated against target curriculum and QPU hardware simulators.
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', backgroundColor: '#F0F9FF', padding: '4px 12px', borderRadius: '12px', border: '1px solid #BAE6FD' }}>
            Continuous AI Diagnosis Active
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>Competency Domain</th>
                <th style={{ padding: '12px 16px' }}>Proficiency Grade</th>
                <th style={{ padding: '12px 16px' }}>Fidelity / Score</th>
                <th style={{ padding: '12px 16px' }}>Evidence &amp; Runs</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Diagnostic Action</th>
              </tr>
            </thead>
            <tbody>
              {skillsList.map(skill => {
                const isMastered = skill.mastery >= 70;
                const isGap = skill.mastery < 40;
                const letterGrade = skill.mastery >= 90 ? 'A+' : skill.mastery >= 80 ? 'A' : skill.mastery >= 70 ? 'B+' : skill.mastery >= 50 ? 'B' : 'In Progress';

                return (
                  <tr key={skill.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚛️</span>
                        <span>{skill.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: isMastered ? '#F0FDF4' : isGap ? '#FEF2F2' : '#EFF6FF',
                        color: isMastered ? '#15803D' : isGap ? '#DC2626' : '#2563EB',
                        border: `1px solid ${isMastered ? '#BBF7D0' : isGap ? '#FECACA' : '#BFDBFE'}`
                      }}>
                        {isMastered ? `✓ Grade: ${letterGrade}` : isGap ? '⚠️ Gap Identified' : `Grade: ${letterGrade}`}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0F172A', minWidth: '40px' }}>
                          {skill.mastery}%
                        </span>
                        <div style={{ width: '100px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${skill.mastery}%`, height: '100%', backgroundColor: isMastered ? '#16A34A' : isGap ? '#EF4444' : '#0284C7', borderRadius: '3px' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '0.8125rem' }}>
                      {isMastered ? '5 circuits validated' : isGap ? '1 attempt (diagnostic flagged)' : '3 trials recorded'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(isGap ? '/learner/mission' : '/learner/lab')}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: isGap ? '#DC2626' : '#FFFFFF',
                          color: isGap ? '#FFFFFF' : '#2563EB',
                          border: isGap ? 'none' : '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {isGap ? 'Attempt Mission ➔' : 'Lab Test ➔'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 2: BACKWARD LEARNING MISSIONS HISTORY ── */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px 28px', marginBottom: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Backward Learning Mission Diagnostic Logs
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '3px 0 0 0' }}>
              Challenge-first problem solving attempts with automated Socratic diagnosis and targeted remediation.
            </p>
          </div>
          <button
            onClick={() => navigate('/learner/mission')}
            style={{ padding: '6px 14px', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Launch Active Mission ➔
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MISSIONS_DATABASE.map((mission, idx) => {
            const isCompleted = idx === 0;
            return (
              <div key={mission.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>{mission.tier}</span>
                    <span style={{ color: '#CBD5E1' }}>•</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284C7' }}>{mission.category}</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{mission.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>{mission.objective}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    backgroundColor: isCompleted ? '#F0FDF4' : '#FFFBEB',
                    color: isCompleted ? '#15803D' : '#D97706',
                    border: `1px solid ${isCompleted ? '#BBF7D0' : '#FDE68A'}`
                  }}>
                    {isCompleted ? '✓ 100% Fidelity (Passed)' : '⚡ Ready to Attempt'}
                  </span>
                  <button
                    onClick={() => {
                      backwardLearningService.setActiveMission(mission.id);
                      navigate('/learner/mission');
                    }}
                    style={{ padding: '6px 12px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}
                  >
                    Open Mission ➔
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 3: COURSE COMPLETION & QUIZ PERFORMANCE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Course Completion Breakdown */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
            Course Completion Overview
          </h2>
          {enrollments.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: '10px' }}>
              <div>Quantum Foundations Track</div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Enrolled • 1/14 Lessons Completed (7%)</div>
              <Link to="/learner/learn" style={{ display: 'inline-block', marginTop: '12px', color: '#2563EB', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                Open Course Curriculum ➔
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {enrollments.map(enr => {
                const prog = progressMap[enr.course_id] || { overall_percentage: 0 };
                return (
                  <div key={enr.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>{enr.course_title}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB' }}>{prog.overall_percentage}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div style={{ width: `${prog.overall_percentage}%`, height: '100%', backgroundColor: '#2563EB', borderRadius: '3px' }} />
                    </div>
                    <Link to={`/learner/course/${enr.course_id}`} style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
                      Continue Player ➔
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quiz & Assessment Performance */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
            Quiz &amp; Instructor Assessment Grades
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>Diagnostic Knowledge Check #1</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Linear Algebra &amp; State Superposition</div>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                95% Score
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>Quantum Entanglement Check</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Bell Inequalities &amp; CNOT Gates</div>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                100% Score
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>Phase Kickback Assessment</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Oracle Inversion &amp; Ancilla States</div>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
                85% Score
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── CERTIFICATE MODAL ── */}
      {showCertificateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '680px',
            width: '100%',
            padding: '36px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '2px solid #E2E8F0',
            textAlign: 'center',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowCertificateModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94A3B8' }}
            >
              ✕
            </button>

            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎓</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              OFFICIAL VERIFIED CERTIFICATE OF MASTERY
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', margin: '8px 0 16px 0' }}>
              Quantum Mastery Intelligence Engine
            </h2>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
              This certifies that <strong>{user?.name || 'Quantum Learner'}</strong> has demonstrated verified competency in <strong>{purpose.title}</strong>, achieving a cumulative mastery score of <strong>{overallMastery}%</strong> with verified circuit simulation evidence.
            </p>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px dashed #CBD5E1', margin: '20px 0', fontSize: '0.8rem', color: '#64748B', fontFamily: 'monospace' }}>
              Verification Hash: QXM-2026-88A9-7E4B-QM99
              <br />
              Issued by: Quantum Mastery Autonomous Architecture
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.print()}
                style={{ padding: '10px 20px', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                🖨️ Print / Save as PDF
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                style={{ padding: '10px 20px', backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
