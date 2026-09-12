import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { purposeService } from "../../services/purposeService";
import { backwardLearningService } from "../../services/backwardLearningService";
import { queryAI, buildContextEnvelope } from "../../services/aiClient";

// AI Agent Roles in Router
const AI_ROLES = [
  { id: "socratic", name: "Socratic AI", icon: "🧑‍🏫", color: "#38BDF8", desc: "Guides with probing questions & intuition" },
  { id: "diagnostic", name: "Diagnostic AI", icon: "🔍", color: "#F43F5E", desc: "Analyzes circuit errors & identifies gaps" },
  { id: "learning", name: "Learning AI", icon: "📚", color: "#10B981", desc: "Delivers targeted theory, video & notes" },
  { id: "experiment", name: "Experiment AI", icon: "🧪", color: "#A855F7", desc: "Assists with Quantum Lab & simulations" }
];

export default function AIAvatarRobot({ initialAgent = "socratic" }) {
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [activeAgent, setActiveAgent] = useState(initialAgent);
  const [mood, setMood] = useState("neutral"); // neutral | thinking | speaking | happy | concerned
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "m1",
      sender: "ai",
      agent: "socratic",
      text: "Greetings! I am your Quantum Mastery AI Companion. I listen, analyze your quantum circuits, and guide your personalized roadmap. How can I assist you right now?",
      timestamp: new Date().toISOString()
    }
  ]);

  // Audio / Speech refs
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const messagesEndRef = useRef(null);
  const [eyePupilOffset, setEyePupilOffset] = useState({ x: 0, y: 0 });
  const [mouthM1, setMouthM1] = useState(0);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Eye micro-saccades & tracking
  useEffect(() => {
    const interval = setInterval(() => {
      if (mood === "thinking") {
        setEyePupilOffset({ x: (Math.random() - 0.5) * 8, y: -4 + Math.random() * 4 });
      } else if (isSpeaking) {
        setEyePupilOffset({ x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 });
      } else {
        setEyePupilOffset({ x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 2 });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [mood, isSpeaking]);

  // Lip-sync waveform animation loop when speaking
  useEffect(() => {
    let animId;
    if (isSpeaking) {
      const animateMouth = () => {
        setMouthM1(Math.sin(Date.now() / 80) * 12 + Math.random() * 8);
        animId = requestAnimationFrame(animateMouth);
      };
      animId = requestAnimationFrame(animateMouth);
    } else {
      setMouthM1(0);
    }
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        handleSendMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text-to-Speech handler
  const speakText = useCallback((text) => {
    if (!voiceEnabled || !synthRef.current) return;
    synthRef.current.cancel();

    // Clean markdown symbols for natural speech
    const cleanText = text.replace(/[*#`_\[\]]/g, "").replace(/\(.*?\)/g, "").trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setMood("speaking");
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setMood("neutral");
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setMood("neutral");
    };

    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  // Toggle Voice Recognition Input
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use text input or Chrome/Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setIsOpen(true);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech start error:", err);
      }
    }
  };

  // Send message and trigger AI agent router
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    setInputMessage("");
    setIsOpen(true); // Automatically ensure chat is visible so user sees their voice text and AI response
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setMood("thinking");

    // Build context envelope with real purpose & location
    const purpose = purposeService.getPurpose();
    const skillGraph = purposeService.getSkillGraph();
    const activeMission = backwardLearningService.getActiveMission();

    const systemPrompt = `You are the ${activeAgent.toUpperCase()} agent of the Quantum Mastery platform.
User Purpose: ${purpose.title} (Type: ${purpose.type})
Active Page: ${location.pathname}
Active Mission: ${activeMission?.title}
Mastery Score: ${skillGraph?.overallMastery}%
Identified Gaps: ${skillGraph?.gapsCount}

Respond concisely, accurately, and pedagogically according to your agent role (${activeAgent}). Use formatting and provide actionable next steps.`;

    try {
      const response = await queryAI({
        question: query,
        taskType: "chat",
        systemPrompt,
        context: {
          purpose,
          page: location.pathname,
          activeMission,
          agent: activeAgent
        }
      });

      const aiText = response?.answer || response?.text || response?.response || (typeof response === "string" ? response : "I analyzed your quantum state. Let's explore the quantum circuit together!");

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        agent: activeAgent,
        text: aiText,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
      speakText(aiText);
    } catch (err) {
      console.warn("AI Query error:", err);
      const fallbackText = `As your ${activeAgent.toUpperCase()} companion, I recommend exploring the Quantum Circuit Composer and checking our targeted lessons for ${purpose.title}.`;
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        sender: "ai",
        agent: activeAgent,
        text: fallbackText,
        timestamp: new Date().toISOString()
      }]);
      speakText(fallbackText);
      setMood("neutral");
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999, fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* ── EXPANDED CHAT PANEL ── */}
      {isOpen && (
        <div style={{
          width: "420px",
          height: "640px",
          backgroundColor: "#0F172A",
          borderRadius: "20px",
          border: "1px solid #334155",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          marginBottom: "16px",
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          {/* Header & Robot Avatar Visualizer */}
          <div style={{
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
            padding: "16px",
            borderBottom: "1px solid #334155",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Glassy Cybernetic Eye Head */}
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(145deg, #0284C7, #0369A1)",
                border: "2px solid #38BDF8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)"
              }}>
                {/* Expressive Glassy Eyes SVG */}
                <svg width="40" height="30" viewBox="0 0 40 30">
                  {/* Left Eye Socket */}
                  <rect x="4" y="6" width="14" height="18" rx="7" fill="#090D16" stroke="#38BDF8" strokeWidth="1.5" />
                  {/* Left Pupil with Glass Reflection */}
                  <circle cx={11 + eyePupilOffset.x} cy={15 + eyePupilOffset.y} r="4" fill="#38BDF8" />
                  <circle cx={9 + eyePupilOffset.x} cy={13 + eyePupilOffset.y} r="1.5" fill="#FFFFFF" opacity="0.9" />

                  {/* Right Eye Socket */}
                  <rect x="22" y="6" width="14" height="18" rx="7" fill="#090D16" stroke="#38BDF8" strokeWidth="1.5" />
                  {/* Right Pupil with Glass Reflection */}
                  <circle cx={29 + eyePupilOffset.x} cy={15 + eyePupilOffset.y} r="4" fill="#38BDF8" />
                  <circle cx={27 + eyePupilOffset.x} cy={13 + eyePupilOffset.y} r="1.5" fill="#FFFFFF" opacity="0.9" />

                  {/* Lip-Sync Animated Mouth Line */}
                  <path
                    d={`M 14 ${26 - mouthM1 * 0.2} Q 20 ${26 + mouthM1 * 0.4} 26 ${26 - mouthM1 * 0.2}`}
                    fill="none"
                    stroke={isSpeaking ? "#34D399" : "#38BDF8"}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Pulse Indicator */}
                <div style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: isSpeaking ? "#10B981" : isListening ? "#EF4444" : "#38BDF8",
                  border: "2px solid #0F172A"
                }} />
              </div>

              <div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#F8FAFC", display: "flex", alignItems: "center", gap: "6px" }}>
                  QUANTUM AI AVATAR
                  <span style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "10px", backgroundColor: "#0369A1", color: "#E0F2FE" }}>
                    LIVE
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                  {mood === "thinking" ? "Thinking & Synthesizing..." : isSpeaking ? "Voice Synthesizing..." : "Persistent Context Active"}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={voiceEnabled ? "Mute Voice Output" : "Enable Voice Output"}
                style={{
                  background: voiceEnabled ? "rgba(56, 189, 248, 0.15)" : "rgba(148, 163, 184, 0.1)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 8px",
                  color: voiceEnabled ? "#38BDF8" : "#64748B",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                {voiceEnabled ? "🔊" : "🔇"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  padding: "4px"
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* AI AGENT ROUTER TABS */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            backgroundColor: "#1E293B",
            borderBottom: "1px solid #334155",
            padding: "4px"
          }}>
            {AI_ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => setActiveAgent(role.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "6px 4px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: activeAgent === role.id ? "rgba(56, 189, 248, 0.2)" : "transparent",
                  color: activeAgent === role.id ? "#38BDF8" : "#94A3B8",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <span style={{ fontSize: "1rem" }}>{role.icon}</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, marginTop: "2px" }}>{role.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* Quick Context Strip */}
          <div style={{
            padding: "6px 12px",
            backgroundColor: "#0B1120",
            borderBottom: "1px solid #1E293B",
            fontSize: "0.72rem",
            color: "#64748B",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>📍 Active Route: <strong style={{ color: "#94A3B8" }}>{location.pathname}</strong></span>
            <span>🎯 Agent: <strong style={{ color: "#38BDF8" }}>{activeAgent.toUpperCase()}</strong></span>
          </div>

          {/* Chat Messages List */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            backgroundColor: "#090D16"
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start"
                }}
              >
                <div style={{
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: msg.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                  backgroundColor: msg.sender === "user" ? "#0284C7" : "#1E293B",
                  color: "#F8FAFC",
                  fontSize: "0.85rem",
                  lineHeight: "1.45",
                  border: msg.sender === "user" ? "none" : "1px solid #334155",
                  whiteSpace: "pre-wrap"
                }}>
                  {msg.sender === "ai" && (
                    <div style={{ fontSize: "0.65rem", color: "#38BDF8", fontWeight: 800, marginBottom: "4px", textTransform: "uppercase" }}>
                      🤖 {msg.agent || activeAgent} AI
                    </div>
                  )}
                  {msg.text}
                </div>
                <span style={{ fontSize: "0.65rem", color: "#475569", marginTop: "3px" }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div style={{
            padding: "6px 12px",
            backgroundColor: "#0F172A",
            borderTop: "1px solid #1E293B",
            display: "flex",
            gap: "6px",
            overflowX: "auto"
          }}>
            <button
              onClick={() => handleSendMessage("Diagnose my current circuit errors.")}
              style={{ padding: "4px 8px", fontSize: "0.7rem", borderRadius: "6px", backgroundColor: "#1E293B", color: "#38BDF8", border: "1px solid #334155", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              🔍 Diagnose Circuit
            </button>
            <button
              onClick={() => handleSendMessage("What is phase kickback in quantum computing?")}
              style={{ padding: "4px 8px", fontSize: "0.7rem", borderRadius: "6px", backgroundColor: "#1E293B", color: "#34D399", border: "1px solid #334155", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              ⚛️ Phase Kickback
            </button>
            <button
              onClick={() => handleSendMessage("Explain my current dynamic quantum learning roadmap.")}
              style={{ padding: "4px 8px", fontSize: "0.7rem", borderRadius: "6px", backgroundColor: "#1E293B", color: "#F59E0B", border: "1px solid #334155", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              🗺️ My Roadmap
            </button>
          </div>

          {/* Input & Voice Controls */}
          <div style={{
            padding: "12px",
            backgroundColor: "#0F172A",
            borderTop: "1px solid #334155",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <button
              onClick={toggleListening}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: isListening ? "#AD6358" : "#1E293B",
                border: isListening ? "2px solid #F4C6AF" : "1px solid #334155",
                color: isListening ? "#FFFFFF" : "#5F9CD6",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              title={isListening ? "Listening... Click to stop" : "Click to Speak"}
            >
              {isListening ? "🎙️" : "🎤"}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={isListening ? "Listening to your voice..." : `Ask ${activeAgent} AI anything...`}
              style={{
                flex: 1,
                padding: "10px 14px",
                backgroundColor: "#1E293B",
                border: "1px solid #334155",
                borderRadius: "10px",
                color: "#F8FAFC",
                fontSize: "0.85rem",
                outline: "none"
              }}
            />

            <button
              onClick={() => handleSendMessage()}
              style={{
                padding: "10px 16px",
                background: "linear-gradient(135deg, #3A68A4 0%, #2C3F60 100%)",
                border: "none",
                borderRadius: "10px",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(44, 63, 96, 0.3)"
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* ── FLOATING TRIGGER AVATAR BUTTON ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #3A68A4 0%, #2C3F60 100%)",
          border: "2px solid #AFD8F4",
          boxShadow: "0 10px 25px rgba(58, 104, 164, 0.4), 0 0 20px rgba(175, 216, 244, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
        title="Open Quantum AI Robot Companion"
      >
        {/* Animated Robot Face in Trigger */}
        <svg width="34" height="26" viewBox="0 0 40 30">
          <rect x="4" y="6" width="14" height="18" rx="7" fill="#0C0D12" stroke="#AFD8F4" strokeWidth="1.5" />
          <circle cx="11" cy="15" r="4" fill="#5F9CD6" />
          <circle cx="9" cy="13" r="1.5" fill="#FFFFFF" />
          {/* Soft Peach Cheek */}
          <circle cx="6" cy="22" r="1.5" fill="#F4C6AF" opacity="0.8" />

          <rect x="22" y="6" width="14" height="18" rx="7" fill="#0C0D12" stroke="#AFD8F4" strokeWidth="1.5" />
          <circle cx="29" cy="15" r="4" fill="#5F9CD6" />
          <circle cx="27" cy="13" r="1.5" fill="#FFFFFF" />
          {/* Soft Peach Cheek */}
          <circle cx="34" cy="22" r="1.5" fill="#F4C6AF" opacity="0.8" />

          <path d="M 14 26 Q 20 28 26 26" fill="none" stroke="#5F9CD6" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Pulse ring in warm gold */}
        <span style={{
          position: "absolute",
          top: "-2px",
          right: "-2px",
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          backgroundColor: "#D6B15F",
          border: "2px solid #0C0D12"
        }} />
      </button>
    </div>
  );
}
