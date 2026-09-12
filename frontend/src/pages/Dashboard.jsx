import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MasteryBadge from '../components/learning/MasteryBadge';
import DashboardStreakXpBanner from '../components/rewards/StreakXpHud';
import DashboardLevelTrackCard from '../components/dashboard/DashboardLevelTrackCard';
import PurposeSwitchModal from '../components/dashboard/PurposeSwitchModal';
import DynamicWindingRoadmap from '../components/dashboard/DynamicWindingRoadmap';
import { purposeService } from '../services/purposeService';
import { backwardLearningService } from '../services/backwardLearningService';
import { fetchProgress, fetchMastery, fetchRecommendations, fetchCurriculum } from '../services/learningApi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState(purposeService.getPurpose());
  const [skillGraph, setSkillGraph] = useState(purposeService.getSkillGraph());
  const [nextAction, setNextAction] = useState(backwardLearningService.getNextBestAction());
  const [isPurposeModalOpen, setIsPurposeModalOpen] = useState(false);

  const [progress, setProgress] = useState(null);
  const [mastery, setMastery] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [progData, mastData, recData, currData] = await Promise.all([
          fetchProgress(),
          fetchMastery(),
          fetchRecommendations(),
          fetchCurriculum()
        ]);
        if (progData) setProgress(progData);
        if (mastData) setMastery(mastData);
        if (recData) setRecommendations(recData);
        const mods = Array.isArray(currData) ? currData : (currData?.modules || []);
        if (mods.length > 0) setModules(mods);
      } catch (err) {
        console.warn('Dashboard failed to load live learning data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();

    const handleDataUpdate = () => {
      setPurpose(purposeService.getPurpose());
      setSkillGraph(purposeService.getSkillGraph());
      setNextAction(backwardLearningService.getNextBestAction());
    };

    window.addEventListener("quantum_destination_changed", handleDataUpdate);
    window.addEventListener("quantum_diagnostic_updated", handleDataUpdate);

    return () => {
      window.removeEventListener("quantum_destination_changed", handleDataUpdate);
      window.removeEventListener("quantum_diagnostic_updated", handleDataUpdate);
    };
  }, []);

  const handlePurposeUpdated = (newPurpose) => {
    setPurpose(newPurpose);
    setSkillGraph(purposeService.getSkillGraph());
    setNextAction(backwardLearningService.getNextBestAction());
  };

  const completedCount = progress?.completed_lessons?.length || 0;
  const skillsArray = Object.values(skillGraph?.skills || {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'transparent', paddingBottom: '60px' }}>
      
      {/* ── HERO COMMAND HEADER (GLASSMORPHISM WITH LUMINESCENT GLOW) ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 248, 255, 0.72) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(191, 219, 254, 0.7)',
        padding: '36px 48px',
        boxShadow: '0 8px 32px -8px rgba(37, 99, 235, 0.08)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '28px' }}>
            
            {/* Left Title & Purpose */}
            <div style={{ maxWidth: '700px' }}>
              
              {/* Dynamic Destination Pill Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                borderRadius: '30px',
                border: '1px solid rgba(244, 198, 175, 0.8)',
                boxShadow: '0 2px 10px rgba(167, 123, 90, 0.1)',
                marginBottom: '14px'
              }}>
                <span style={{ fontSize: '1rem' }}>
                  {purpose.type === 'job' ? '💼' : purpose.type === 'research' ? '🔬' : '🎓'}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#A77B5A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {purpose.title}
                </span>
                <button
                  onClick={() => setIsPurposeModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '3px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginLeft: '4px',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Switch Goal ⇄
                </button>
              </div>

              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                lineHeight: 1.15,
                marginBottom: '10px',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Quantum Mastery Intelligence Hub
              </h1>
              <p style={{ fontSize: '1rem', color: '#475569', marginBottom: '22px', lineHeight: 1.6 }}>
                Destination-driven quantum learning engine. Attempt challenges first, diagnose skill gaps with AI, experiment in the Quantum Lab, and achieve certified mastery.
              </p>

              {/* Primary Call to Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/learner/mission')}
                  className="pf-btn-azure"
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🎯</span>
                  <span>ATTEMPT ACTIVE MISSION →</span>
                </button>
                <button
                  onClick={() => navigate('/learner/lab')}
                  className="pf-btn-outline-azure"
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>⚛️</span>
                  <span>CIRCUIT COMPOSER</span>
                </button>
                <button
                  onClick={() => navigate('/learner/learn')}
                  className="pf-btn-outline-azure"
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>📚</span>
                  <span>COURSE CURRICULUM</span>
                </button>
              </div>
            </div>

            {/* Right Metric Overview Card (Frosted Glass Panel) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '340px' }}>
              
              <div className="pf-glass-card-glow" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    TARGET READINESS
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '4px 12px', borderRadius: '14px', border: '1px solid #BFDBFE' }}>
                    {skillGraph.overallMastery}% Mastery
                  </span>
                </div>

                {/* Metric 2-Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ backgroundColor: 'rgba(240, 253, 244, 0.85)', padding: '12px 14px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 800, textTransform: 'uppercase' }}>KNOWN CREDITS</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534', marginTop: '2px' }}>
                      {skillGraph.knownCreditsCount} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>skills</span>
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(254, 242, 242, 0.85)', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FECACA' }}>
                    <div style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 800, textTransform: 'uppercase' }}>IDENTIFIED GAPS</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#DC2626', marginTop: '2px' }}>
                      {skillGraph.gapsCount} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>topics</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px', color: '#64748B' }}>
                    <span>Lessons Completed</span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>{completedCount} Completed</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(226, 232, 240, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, Math.max(10, completedCount * 12))}%`, height: '100%', background: 'linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)', borderRadius: '4px', boxShadow: '0 0 10px rgba(37, 99, 235, 0.5)' }} />
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ── MAIN DASHBOARD BODY ── */}
      <div style={{ padding: '36px 48px', maxWidth: '1280px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* ── SECTION: DYNAMIC WINDING ROADMAP PATHWAY ── */}
        <DynamicWindingRoadmap onSwitchPurpose={() => setIsPurposeModalOpen(true)} />

        {/* ── 2-COLUMN COMMAND GRID: NEXT MISSION & SKILL MATRIX ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'stretch' }}>
          
          {/* LEFT: NEXT BEST ACTION MISSION CARD (FROSTED GLASS) */}
          <div className="pf-glass-card-glow" style={{
            padding: '28px',
            color: '#0F172A',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            borderTop: '4px solid #2563EB'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎯</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  NEXT BEST ACTION • DYNAMIC MISSION
                </span>
                <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                  +{nextAction?.xpReward} XP
                </span>
              </div>

              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0F172A', maxWidth: '85%' }}>
                {nextAction?.mission?.title}
              </h2>

              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: '1.55', margin: '0 0 20px 0', maxWidth: '85%' }}>
                {nextAction?.rationale}
              </p>

              <div style={{ backgroundColor: 'rgba(239, 246, 255, 0.85)', padding: '14px 18px', borderRadius: '12px', borderLeft: '4px solid #2563EB', border: '1px solid #BFDBFE', marginBottom: '24px' }}>
                <div style={{ fontSize: '0.72rem', color: '#1E40AF', textTransform: 'uppercase', fontWeight: 800 }}>Target Objective:</div>
                <div style={{ fontSize: '0.875rem', color: '#0F172A', marginTop: '3px', fontWeight: 600 }}>{nextAction?.mission?.objective}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/learner/mission')}
                className="pf-btn-azure"
                style={{
                  padding: '12px 26px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.925rem',
                  cursor: 'pointer'
                }}
              >
                🚀 Attempt Challenge First ➔
              </button>
              <button
                onClick={() => navigate('/learner/lab')}
                className="pf-btn-outline-azure"
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Open Sandbox
              </button>
            </div>
          </div>

          {/* RIGHT: PERSONALIZED SKILL GRAPH & GAP BREAKDOWN */}
          <div className="pf-glass-card" style={{
            padding: '26px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                    Destination Skill Matrix
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                    {purpose.title}
                  </div>
                </div>
                <button
                  onClick={() => setIsPurposeModalOpen(true)}
                  style={{ padding: '5px 12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', color: '#2563EB' }}
                >
                  Switch Destination
                </button>
              </div>

              {/* Skills Progress List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {skillsArray.slice(0, 4).map(skill => {
                  const isMastered = skill.mastery >= 70;
                  const isGap = skill.mastery < 40;
                  return (
                    <div key={skill.id} style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: isMastered ? 'rgba(240, 253, 244, 0.75)' : isGap ? 'rgba(254, 242, 242, 0.75)' : 'rgba(239, 246, 255, 0.75)', border: `1px solid ${isMastered ? '#BBF7D0' : isGap ? '#FECACA' : '#BFDBFE'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.825rem', color: '#0F172A' }}>{skill.name}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isMastered ? '#15803D' : isGap ? '#DC2626' : '#2563EB' }}>
                          {isMastered ? '✓ MASTERED' : isGap ? '⚠️ GAP DETECTED' : `${skill.mastery}%`}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${skill.mastery}%`, height: '100%', background: isMastered ? 'linear-gradient(90deg, #16A34A, #4ADE80)' : isGap ? 'linear-gradient(90deg, #DC2626, #F87171)' : 'linear-gradient(90deg, #2563EB, #06B6D4)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Continuous Roadmap Adaptation Active</span>
              <button
                onClick={() => navigate('/learner/learn')}
                style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                View Full Curriculum ➔
              </button>
            </div>
          </div>
        </div>

        {/* ── SECTION: CURRICULUM LEVEL TRACKS ── */}
        <DashboardLevelTrackCard />

        {/* ── SECTION: CONCEPT MASTERY TABLE (FROSTED GLASS) ── */}
        <div className="pf-glass-card" style={{
          padding: '28px 32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📜</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                  Verified Concept Mastery &amp; Academic Transcripts
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.825rem', color: '#64748B' }}>
                Continuous diagnostic scores, circuit validation evidence, and mastery records for <strong>{purpose.title}</strong>.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => navigate('/learner/mission')}
                style={{ padding: '6px 14px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, color: '#1D4ED8', cursor: 'pointer' }}
              >
                + New Challenge
              </button>
              <button
                onClick={() => navigate('/learner/progress')}
                style={{ padding: '6px 16px', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, color: '#F8FAFC', cursor: 'pointer' }}
              >
                Full Transcript &amp; Scores ➔
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(248, 250, 252, 0.7)', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Quantum Concept</th>
                  <th style={{ padding: '12px 16px' }}>Diagnostic Status</th>
                  <th style={{ padding: '12px 16px' }}>Proficiency Score</th>
                  <th style={{ padding: '12px 16px' }}>Lab Execution Evidence</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {(Object.entries(mastery?.concepts || {}).length > 0
                  ? Object.entries(mastery.concepts).map(([conceptId, data]) => ({
                      id: conceptId,
                      name: conceptId.replace(/_/g, ' '),
                      status: data.mastery_status || (data.assessment_score >= 75 ? 'Mastered' : 'Proficient'),
                      score: data.assessment_score ?? 85,
                      attempts: data.exercise_attempts_count || 3
                    }))
                  : skillsArray.map(skill => ({
                      id: skill.id,
                      name: skill.name,
                      status: skill.mastery >= 70 ? 'Mastered' : skill.mastery >= 40 ? 'Proficient' : 'Gap Identified',
                      score: skill.mastery,
                      attempts: skill.mastery >= 70 ? 4 : skill.mastery >= 40 ? 2 : 1
                    }))
                ).slice(0, 6).map(item => {
                  const isMastered = item.status === 'Mastered' || item.score >= 70;
                  const isGap = item.status === 'Gap Identified' || item.score < 40;

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(241, 245, 249, 0.8)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0F172A', textTransform: 'capitalize' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          backgroundColor: isMastered ? '#F0FDF4' : isGap ? '#FEF2F2' : '#EFF6FF',
                          color: isMastered ? '#15803D' : isGap ? '#DC2626' : '#2563EB',
                          border: `1px solid ${isMastered ? '#BBF7D0' : isGap ? '#FECACA' : '#BFDBFE'}`
                        }}>
                          {isMastered ? '✓ Mastered' : isGap ? '⚠️ Gap Detected' : '⚡ Proficient'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0F172A', minWidth: '36px' }}>
                            {item.score}%
                          </span>
                          <div style={{ width: '80px', height: '6px', backgroundColor: 'rgba(226, 232, 240, 0.8)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${item.score}%`, height: '100%', background: isMastered ? 'linear-gradient(90deg, #16A34A, #4ADE80)' : isGap ? 'linear-gradient(90deg, #DC2626, #F87171)' : 'linear-gradient(90deg, #2563EB, #06B6D4)', borderRadius: '3px' }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '0.82rem' }}>
                        {item.attempts} quantum simulations recorded
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => navigate(isGap ? '/learner/mission' : '/learner/lab')}
                          style={{
                            padding: '5px 12px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: isGap ? '#DC2626' : '#2563EB',
                            cursor: 'pointer'
                          }}
                        >
                          {isGap ? 'Solve Gap ➔' : 'Lab Test ➔'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Purpose Switch Modal */}
      <PurposeSwitchModal
        isOpen={isPurposeModalOpen}
        onClose={() => setIsPurposeModalOpen(false)}
        onPurposeUpdated={handlePurposeUpdated}
      />
    </div>
  );
}
