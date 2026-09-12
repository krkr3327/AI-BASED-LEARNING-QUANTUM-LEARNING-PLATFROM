import React, { useEffect, useState, useCallback } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { platformAuth } from "../../../services/platformAuth";
import { purposeService } from "../../../services/purposeService";
import QuantumAtmosphereBackground from "../../../components/ui/QuantumAtmosphereBackground";
import StreakXpHud from "../../../components/rewards/StreakXpHud";
import XpCelebrationToast from "../../../components/rewards/XpCelebrationToast";
import LevelUpCelebrationModal from "../../../components/rewards/LevelUpCelebrationModal";
import AIAvatarRobot from "../../../components/ai/AIAvatarRobot";
import PurposeSwitchModal from "../../../components/dashboard/PurposeSwitchModal";

// ─── Clean Enhanced SVG Icons ──────────────────────────────────────────────────
const IconDashboard  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>;
const IconMission    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconResearch   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v6l-3.5 7A3 3 0 0 0 5.2 19h13.6a3 3 0 0 0 2.7-4L18 8V2"/><path d="M6 2h12"/><path d="M6 14h12"/></svg>;
const IconLearn      = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconLab        = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><circle cx="12" cy="16" r="2.5"/></svg>;
const IconExperiment = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v6l-3.5 7A3 3 0 0 0 5.2 19h13.6a3 3 0 0 0 2.7-4L18 8V2"/><path d="M6 2h12"/></svg>;
const IconAlgorithm  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>;
const IconChallenges = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IconAI         = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 1.1-.9 2-2 2s-2-.9-2-2 2-2 2-2z"/><path d="M12 6v6"/><path d="M8 12h8"/><path d="M8 16h8"/><path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z"/></svg>;
const IconUser       = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconProgress   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconLogout     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

export default function LearnerLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [purpose, setPurpose] = useState(purposeService.getPurpose());
  const [isPurposeModalOpen, setIsPurposeModalOpen] = useState(false);

  useEffect(() => {
    // RBAC check
    if (!platformAuth.isAuthenticated()) {
      navigate("/auth/learner");
      return;
    }
    const role = platformAuth.getRole();
    if (role !== "learner") {
      navigate("/trainer/dashboard");
      return;
    }
    setUser(platformAuth.getUser());
  }, [navigate]);

  useEffect(() => {
    const handlePurposeChange = () => {
      setPurpose(purposeService.getPurpose());
    };
    window.addEventListener("quantum_destination_changed", handlePurposeChange);
    return () => window.removeEventListener("quantum_destination_changed", handlePurposeChange);
  }, []);

  const handleLogout = useCallback(() => {
    platformAuth.logout();
    navigate("/");
  }, [navigate]);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <QuantumAtmosphereBackground theme="light" role="learner" />

      {/* ── Sidebar with full vertical scrolling ── */}
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', overflow: 'hidden' }}>
        
        {/* Fixed Top: Brand & Destination / XP HUD */}
        <div className="sidebar-brand" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #3A68A4 0%, #2C3F60 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(44, 63, 96, 0.25)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                <path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 2a15 15 0 0 0 0 20"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0C0D12', letterSpacing: '-0.02em' }}>QUANTUM MASTERY</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#3A68A4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Intelligence Engine</div>
            </div>
          </div>

          {/* Active Target Destination Display */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              backgroundColor: "#EFF6FB",
              border: "1px solid #AFD8F4",
              borderRadius: "10px",
              color: "#2C3F60"
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.62rem", color: "#3A68A4", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>ACTIVE DESTINATION</div>
              <div style={{ fontSize: "0.78rem", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#0C0D12" }}>
                {purpose.title}
              </div>
            </div>
            <span style={{ fontSize: "0.85rem" }}>
              {purpose.type === "job" ? "💼" : purpose.type === "research" ? "🔬" : "🎓"}
            </span>
          </div>
          
          {/* Real-time Streak & XP Gamification HUD */}
          <div style={{ width: '100%' }}>
            <StreakXpHud />
          </div>
        </div>

        {/* Scrollable Middle: Navigation Links (Scroll Up and Down) */}
        <div className="sidebar-nav" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: '12px 14px' }}>
          <div className="sidebar-section-header">LEARNING &amp; MISSIONS</div>
          <NavLink to="/learner/dashboard" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'} end>
            <div className="nav-item-icon"><IconDashboard /></div>
            <span>Dashboard &amp; Roadmap</span>
          </NavLink>
          <NavLink to="/learner/mission" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <div className="nav-item-icon"><IconMission /></div>
            <span>Dynamic Missions</span>
          </NavLink>
          <NavLink to="/learner/research" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <div className="nav-item-icon"><IconResearch /></div>
            <span>Research Studio</span>
          </NavLink>
          <NavLink to="/learner/learn" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <div className="nav-item-icon"><IconLearn /></div>
            <span>Course Curriculum</span>
          </NavLink>
          <NavLink to="/learner/assessment" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <div className="nav-item-icon"><IconChallenges /></div>
            <span>Skill Assessments</span>
          </NavLink>

          <div className="sidebar-section-header">SIMULATION LAB</div>
          <NavLink to="/learner/lab" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <div className="nav-item-icon"><IconLab /></div>
            <span>Circuit Composer</span>
          </NavLink>
          <NavLink to="/learner/experiments" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <div className="nav-item-icon"><IconExperiment /></div>
            <span>Quantum Experiments</span>
          </NavLink>
          <NavLink to="/learner/algorithms" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <div className="nav-item-icon"><IconAlgorithm /></div>
            <span>Algorithm Engine</span>
          </NavLink>

          <div className="sidebar-section-header">AI &amp; ACCOUNT</div>
          <NavLink to="/learner/ai-tutor" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <div className="nav-item-icon"><IconAI /></div>
            <span>AI Inspector</span>
          </NavLink>
          <NavLink to="/learner/profile" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <div className="nav-item-icon"><IconUser /></div>
            <span>Student Profile</span>
          </NavLink>
          <NavLink to="/learner/progress" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <div className="nav-item-icon"><IconProgress /></div>
            <span>Transcripts &amp; Scores</span>
          </NavLink>
        </div>

        {/* Fixed Bottom: User Pill & Sign Out */}
        <div style={{ flexShrink: 0, padding: '14px 16px', borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Avatar + info */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 12px',
              backgroundColor: '#F5F9FC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#3A68A4,#2C3F60)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0
              }}>
                {user?.name?.[0]?.toUpperCase() || 'S'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.825rem', color: '#0C0D12', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || "Student"}
                </div>
                <div style={{ fontSize: "0.68rem", color: "#3A68A4", fontWeight: 600 }}>
                  Learner Workspace
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '6px',
                padding: '7px 12px',
                backgroundColor: 'transparent',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                color: '#64748B',
                cursor: 'pointer', fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor='#FFF8F2'; e.currentTarget.style.color='#AD6358'; e.currentTarget.style.borderColor='#F4C6AF'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color='#64748B'; e.currentTarget.style.borderColor='#E2E8F0'; }}
            >
              <IconLogout /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main workspace ── */}
      <main className="workspace">
        <Outlet />
      </main>

      {/* Floating Gamification XP Celebration Toast */}
      <XpCelebrationToast />

      {/* Level Up Promotion Celebration Modal */}
      <LevelUpCelebrationModal />

      {/* Purpose Switch Modal */}
      <PurposeSwitchModal
        isOpen={isPurposeModalOpen}
        onClose={() => setIsPurposeModalOpen(false)}
        onPurposeUpdated={(newPurpose) => setPurpose(newPurpose)}
      />

      {/* 🤖 Persistent Voice AI Robot Companion */}
      <AIAvatarRobot />
    </div>
  );
}
