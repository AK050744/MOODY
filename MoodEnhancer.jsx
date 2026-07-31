import { useState, useEffect, useRef } from "react";

const MOODS = [
  { score: 1, label: "Broken", color: "#2d1b69", orb: ["#1a0533","#4a0080","#2d1b69"] },
  { score: 2, label: "Hopeless", color: "#3d2052", orb: ["#2a0a3a","#6b21a8","#3d2052"] },
  { score: 3, label: "Sad", color: "#1e3a5f", orb: ["#0f2744","#1e40af","#1e3a5f"] },
  { score: 4, label: "Low", color: "#1e4060", orb: ["#0f3353","#0369a1","#1e4060"] },
  { score: 5, label: "Okay", color: "#1f3a4a", orb: ["#0f2a3a","#0891b2","#1f3a4a"] },
  { score: 6, label: "Alright", color: "#1a3a35", orb: ["#0a2a28","#0d9488","#1a3a35"] },
  { score: 7, label: "Good", color: "#1a3a2a", orb: ["#0a2a1a","#059669","#1a3a2a"] },
  { score: 8, label: "Happy", color: "#2a3a15", orb: ["#1a2a08","#65a30d","#2a3a15"] },
  { score: 9, label: "Great", color: "#3a2a10", orb: ["#2a1a05","#d97706","#3a2a10"] },
  { score: 10, label: "Amazing", color: "#3a1a2a", orb: ["#2a0a1a","#e11d48","#6c5ce7"] },
];

const EMOTIONS = [
  "Anxious","Lonely","Overwhelmed","Hopeless","Angry","Numb",
  "Exhausted","Confused","Sad","Scared","Stressed","Lost",
  "Grateful","Calm","Hopeful","Motivated","Happy","Loved",
];

const EMOTION_COLORS = {
  Anxious:"#7c3aed",Lonely:"#1d4ed8",Overwhelmed:"#b45309",Hopeless:"#374151",
  Angry:"#dc2626",Numb:"#4b5563",Exhausted:"#6b7280",Confused:"#92400e",
  Sad:"#1e40af",Scared:"#7f1d1d",Stressed:"#9a3412",Lost:"#374151",
  Grateful:"#065f46",Calm:"#0e7490",Hopeful:"#15803d",Motivated:"#7e22ce",
  Happy:"#b45309",Loved:"#be185d",
};

const PAGES = ["home","checkin","journal","chat","community","dashboard"];

function MoodOrb({ moodScore, size = 260, pulse = true }) {
  const mood = MOODS[moodScore - 1] || MOODS[4];
  const id = `orb-${size}`;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", position: "relative",
      flexShrink: 0,
      background: `radial-gradient(circle at 35% 35%, ${mood.orb[1]}, ${mood.orb[0]} 60%, ${mood.orb[2]})`,
      boxShadow: `0 0 ${size*0.3}px ${mood.orb[1]}55, 0 0 ${size*0.6}px ${mood.orb[1]}22`,
      animation: pulse ? "orbPulse 4s ease-in-out infinite" : "none",
      transition: "all 1.2s cubic-bezier(0.4,0,0.2,1)",
    }}>
      <div style={{
        position:"absolute",inset:0,borderRadius:"50%",
        background:"radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, transparent 55%)",
      }}/>
    </div>
  );
}

function NavBar({ page, setPage, moodScore }) {
  const mood = MOODS[moodScore - 1] || MOODS[4];
  const navItems = [
    { id:"home", icon:"🏠", label:"Home" },
    { id:"checkin", icon:"✦", label:"Check In" },
    { id:"journal", icon:"📓", label:"Journal" },
    { id:"chat", icon:"💬", label:"Mia" },
    { id:"community", icon:"🤝", label:"Together" },
    { id:"dashboard", icon:"📊", label:"My Journey" },
  ];
  return (
    <nav style={{
      position:"fixed",bottom:0,left:0,right:0,zIndex:100,
      background:"rgba(13,15,26,0.92)",
      backdropFilter:"blur(20px)",
      borderTop:"1px solid rgba(255,255,255,0.07)",
      display:"flex",justifyContent:"space-around",alignItems:"center",
      padding:"8px 0 max(8px, env(safe-area-inset-bottom))",
    }}>
      {navItems.map(item => (
        <button key={item.id} onClick={() => setPage(item.id)}
          style={{
            background:"none",border:"none",cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",gap:2,
            padding:"4px 12px",borderRadius:12,
            color: page === item.id ? mood.orb[1] : "rgba(248,246,240,0.45)",
            transform: page === item.id ? "translateY(-2px)" : "none",
            transition:"all 0.2s ease",
          }}>
          <span style={{fontSize:18}}>{item.icon}</span>
          <span style={{fontSize:10,fontWeight:page===item.id?600:400,letterSpacing:"0.03em"}}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function HomePage({ setPage, moodScore, userName }) {
  const mood = MOODS[moodScore - 1] || MOODS[4];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={{
      minHeight:"100vh",padding:"60px 20px 100px",
      display:"flex",flexDirection:"column",gap:28,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition:"all 0.7s cubic-bezier(0.4,0,0.2,1)",
    }}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <p style={{color:"rgba(248,246,240,0.5)",fontSize:13,marginBottom:4,letterSpacing:"0.05em"}}>{greeting}</p>
          <h1 style={{fontSize:26,fontWeight:700,color:"#F8F6F0",fontFamily:"'Fraunces',serif",
            lineHeight:1.2}}>
            {userName || "friend"} 🌙
          </h1>
        </div>
        <div style={{
          background:"rgba(255,255,255,0.06)",borderRadius:12,padding:"8px 14px",
          border:"1px solid rgba(255,255,255,0.08)",
          display:"flex",alignItems:"center",gap:8,
        }}>
          <span style={{fontSize:12,color:"rgba(248,246,240,0.6)"}}>🔥 4 days</span>
        </div>
      </div>

      {/* Orb + mood status */}
      <div style={{
        display:"flex",flexDirection:"column",alignItems:"center",gap:16,
        background:"rgba(255,255,255,0.03)",borderRadius:28,
        padding:"36px 20px 28px",
        border:"1px solid rgba(255,255,255,0.06)",
        position:"relative",overflow:"hidden",
      }}>
        <div style={{
          position:"absolute",inset:0,
          background:`radial-gradient(ellipse at 50% 0%, ${mood.orb[1]}18 0%, transparent 65%)`,
        }}/>
        <MoodOrb moodScore={moodScore} size={180} />
        <div style={{textAlign:"center"}}>
          <p style={{color:"rgba(248,246,240,0.5)",fontSize:12,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>you're feeling</p>
          <h2 style={{fontSize:32,fontFamily:"'Fraunces',serif",fontWeight:600,color:"#F8F6F0",
            textShadow:`0 0 40px ${mood.orb[1]}88`}}>
            {mood.label}
          </h2>
        </div>
        <button onClick={() => setPage("checkin")} style={{
          background:`linear-gradient(135deg, ${mood.orb[1]}, ${mood.orb[1]}aa)`,
          border:"none",borderRadius:50,padding:"13px 32px",
          color:"#fff",fontWeight:600,fontSize:15,cursor:"pointer",
          boxShadow:`0 8px 32px ${mood.orb[1]}44`,
          letterSpacing:"0.02em",
        }}>
          How are you feeling now? ✦
        </button>
      </div>

      {/* Crisis banner */}
      <button onClick={() => setPage("checkin")} style={{
        background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.25)",
        borderRadius:16,padding:"14px 18px",cursor:"pointer",
        display:"flex",alignItems:"center",gap:12,textAlign:"left",
        transition:"all 0.2s",
      }}>
        <span style={{fontSize:22}}>🆘</span>
        <div>
          <p style={{color:"#fca5a5",fontWeight:600,fontSize:13,marginBottom:2}}>Need help right now?</p>
          <p style={{color:"rgba(248,246,240,0.5)",fontSize:11}}>Calm mode • Breathing • Helplines</p>
        </div>
        <span style={{marginLeft:"auto",color:"rgba(248,246,240,0.4)",fontSize:18}}>›</span>
      </button>

      {/* Quick actions */}
      <div>
        <p style={{color:"rgba(248,246,240,0.4)",fontSize:11,letterSpacing:"0.1em",
          textTransform:"uppercase",marginBottom:14}}>your space</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[
            { icon:"📓", label:"Write in journal", sub:"Today's thoughts", page:"journal", color:"#6c5ce7" },
            { icon:"💬", label:"Talk to Mia", sub:"Your AI companion", page:"chat", color:"#00b894" },
            { icon:"🤝", label:"You're not alone", sub:"Anonymous community", page:"community", color:"#e17055" },
            { icon:"📊", label:"Your journey", sub:"90-day mood story", page:"dashboard", color:"#fdcb6e" },
          ].map(item => (
            <button key={item.page} onClick={() => setPage(item.page)} style={{
              background:"rgba(255,255,255,0.04)",border:`1px solid ${item.color}28`,
              borderRadius:18,padding:"18px 16px",cursor:"pointer",textAlign:"left",
              transition:"all 0.2s",
            }}>
              <span style={{fontSize:22,display:"block",marginBottom:8}}>{item.icon}</span>
              <p style={{color:"#F8F6F0",fontWeight:600,fontSize:13,marginBottom:3}}>{item.label}</p>
              <p style={{color:"rgba(248,246,240,0.45)",fontSize:11}}>{item.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Daily quote */}
      <div style={{
        background:"rgba(108,92,231,0.08)",borderRadius:20,padding:"20px",
        borderLeft:`3px solid #6c5ce7`,
      }}>
        <p style={{color:"rgba(248,246,240,0.4)",fontSize:11,letterSpacing:"0.08em",
          textTransform:"uppercase",marginBottom:10}}>today's reminder</p>
        <p style={{
          fontFamily:"'Fraunces',serif",fontSize:17,color:"#F8F6F0",
          lineHeight:1.6,fontStyle:"italic",
        }}>
          "You don't have to be okay. You just have to keep going."
        </p>
      </div>
    </div>
  );
}

function CheckInPage({ moodScore, setMoodScore }) {
  const [step, setStep] = useState(1);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const mood = MOODS[moodScore - 1] || MOODS[4];

  const toggleEmotion = (e) => setSelectedEmotions(prev =>
    prev.includes(e) ? prev.filter(x => x !== e) : prev.length < 5 ? [...prev, e] : prev
  );

  if (submitted) return (
    <div style={{
      minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:"20px",gap:28,
    }}>
      <MoodOrb moodScore={moodScore} size={200} />
      <div style={{textAlign:"center"}}>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:28,color:"#F8F6F0",marginBottom:10}}>
          I hear you 💜
        </h2>
        <p style={{color:"rgba(248,246,240,0.6)",fontSize:15,lineHeight:1.7,maxWidth:300}}>
          Thank you for sharing how you feel.<br/>Your feelings matter. Always.
        </p>
      </div>
      <div style={{
        background:"rgba(108,92,231,0.12)",borderRadius:20,padding:"20px",
        border:"1px solid rgba(108,92,231,0.2)",maxWidth:340,width:"100%",
      }}>
        <p style={{color:"rgba(248,246,240,0.5)",fontSize:11,textTransform:"uppercase",
          letterSpacing:"0.08em",marginBottom:12}}>Mia says</p>
        <p style={{color:"#F8F6F0",fontSize:14,lineHeight:1.7,fontStyle:"italic"}}>
          "It sounds like you're going through something heavy. You reached out — that already took strength. I'm proud of you."
        </p>
      </div>
      <button onClick={() => { setSubmitted(false); setStep(1); setText(""); setSelectedEmotions([]); }}
        style={{
          background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:50,padding:"12px 28px",color:"#F8F6F0",fontSize:14,cursor:"pointer",
        }}>
        Check in again
      </button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",padding:"60px 20px 100px"}}>
      {/* Progress */}
      <div style={{display:"flex",gap:6,marginBottom:32}}>
        {[1,2,3].map(s => (
          <div key={s} style={{
            height:3,flex:1,borderRadius:2,
            background: step >= s ? mood.orb[1] : "rgba(255,255,255,0.1)",
            transition:"background 0.4s",
          }}/>
        ))}
      </div>

      {step === 1 && (
        <div style={{display:"flex",flexDirection:"column",gap:28,animation:"fadeSlide 0.4s ease"}}>
          <div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:26,color:"#F8F6F0",marginBottom:8}}>
              On a scale of 1 to 10...
            </h2>
            <p style={{color:"rgba(248,246,240,0.5)",fontSize:14}}>How are you feeling right now?</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
            <MoodOrb moodScore={moodScore} size={160} />
            <div style={{textAlign:"center"}}>
              <p style={{fontFamily:"'Fraunces',serif",fontSize:36,color:"#F8F6F0",fontWeight:700}}>
                {moodScore}
              </p>
              <p style={{color:mood.orb[1],fontSize:18,fontWeight:600}}>{mood.label}</p>
            </div>
            <input type="range" min={1} max={10} value={moodScore}
              onChange={e => setMoodScore(Number(e.target.value))}
              style={{width:"100%",accentColor:mood.orb[1],height:6,cursor:"pointer"}}
            />
            <div style={{display:"flex",justifyContent:"space-between",width:"100%",
              color:"rgba(248,246,240,0.4)",fontSize:11}}>
              <span>1 — Broken</span>
              <span>10 — Amazing</span>
            </div>
          </div>
          <button onClick={() => setStep(2)} style={{
            background:`linear-gradient(135deg, ${mood.orb[1]}, ${mood.orb[1]}bb)`,
            border:"none",borderRadius:50,padding:"15px",color:"#fff",
            fontWeight:600,fontSize:15,cursor:"pointer",
            boxShadow:`0 8px 32px ${mood.orb[1]}44`,
          }}>
            Continue →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{display:"flex",flexDirection:"column",gap:24,animation:"fadeSlide 0.4s ease"}}>
          <div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:26,color:"#F8F6F0",marginBottom:8}}>
              What are you feeling?
            </h2>
            <p style={{color:"rgba(248,246,240,0.5)",fontSize:14}}>Pick up to 5 that feel true right now</p>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {EMOTIONS.map(e => {
              const selected = selectedEmotions.includes(e);
              const color = EMOTION_COLORS[e] || "#6c5ce7";
              return (
                <button key={e} onClick={() => toggleEmotion(e)} style={{
                  border: `1.5px solid ${selected ? color : "rgba(255,255,255,0.12)"}`,
                  background: selected ? `${color}28` : "rgba(255,255,255,0.04)",
                  borderRadius:50,padding:"9px 18px",cursor:"pointer",
                  color: selected ? "#F8F6F0" : "rgba(248,246,240,0.55)",
                  fontSize:13,fontWeight: selected ? 600 : 400,
                  transition:"all 0.2s",
                  transform: selected ? "scale(1.04)" : "scale(1)",
                }}>
                  {e}
                </button>
              );
            })}
          </div>
          <div style={{display:"flex",gap:12}}>
            <button onClick={() => setStep(1)} style={{
              background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:50,padding:"14px 24px",color:"rgba(248,246,240,0.7)",
              fontSize:14,cursor:"pointer",flex:"0 0 auto",
            }}>← Back</button>
            <button onClick={() => setStep(3)} style={{
              background:`linear-gradient(135deg, ${mood.orb[1]}, ${mood.orb[1]}bb)`,
              border:"none",borderRadius:50,padding:"14px",color:"#fff",
              fontWeight:600,fontSize:15,cursor:"pointer",flex:1,
            }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{display:"flex",flexDirection:"column",gap:24,animation:"fadeSlide 0.4s ease"}}>
          <div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:26,color:"#F8F6F0",marginBottom:8}}>
              Tell me more
            </h2>
            <p style={{color:"rgba(248,246,240,0.5)",fontSize:14}}>
              This is just for you and Mia. No one else sees this.
            </p>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What's going on? You can say anything here. Start with 'today I...' if it helps."
            maxLength={2000}
            rows={8}
            style={{
              background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:18,padding:"18px",
              color:"#F8F6F0",fontSize:15,lineHeight:1.7,
              resize:"none",outline:"none",
              fontFamily:"'Inter',sans-serif",
              caretColor:mood.orb[1],
            }}
          />
          <p style={{color:"rgba(248,246,240,0.3)",fontSize:11,textAlign:"right",marginTop:-16}}>
            {text.length}/2000
          </p>
          <div style={{display:"flex",gap:12}}>
            <button onClick={() => setStep(2)} style={{
              background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:50,padding:"14px 24px",color:"rgba(248,246,240,0.7)",
              fontSize:14,cursor:"pointer",flex:"0 0 auto",
            }}>← Back</button>
            <button onClick={() => setSubmitted(true)} style={{
              background:`linear-gradient(135deg, ${mood.orb[1]}, ${mood.orb[1]}bb)`,
              border:"none",borderRadius:50,padding:"14px",color:"#fff",
              fontWeight:600,fontSize:15,cursor:"pointer",flex:1,
              boxShadow:`0 8px 32px ${mood.orb[1]}44`,
            }}>
              Share with Mia ✦
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatPage({ moodScore }) {
  const mood = MOODS[moodScore - 1] || MOODS[4];
  const [messages, setMessages] = useState([
    { role:"assistant", content:"Hey 💜 I'm Mia. I'm here to listen — not to judge, not to fix, just to be with you. How are you doing today?" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEnd = useRef(null);

  const RESPONSES = [
    "I hear you. That sounds really hard. Can you tell me a bit more about what's been going on?",
    "It makes complete sense that you'd feel that way. You're carrying a lot right now.",
    "Thank you for trusting me with this. You don't have to figure it all out tonight — sometimes just saying it out loud is enough.",
    "That takes real courage to say. I see you, and I'm not going anywhere.",
    "You know, the fact that you're here, trying to understand what you're feeling — that already says a lot about your strength.",
  ];

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { role:"user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, {
        role:"assistant",
        content: RESPONSES[Math.floor(Math.random() * RESPONSES.length)]
      }]);
    }, 1800 + Math.random() * 1000);
  };

  return (
    <div style={{
      height:"100vh",display:"flex",flexDirection:"column",
      paddingTop:60,paddingBottom:80,
    }}>
      {/* Header */}
      <div style={{
        padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",
        display:"flex",alignItems:"center",gap:14,flexShrink:0,
      }}>
        <div style={{
          width:44,height:44,borderRadius:"50%",
          background:`radial-gradient(circle at 35% 35%, ${mood.orb[1]}, ${mood.orb[0]})`,
          boxShadow:`0 0 20px ${mood.orb[1]}55`,
          animation:"orbPulse 4s ease-in-out infinite",
          flexShrink:0,
        }}/>
        <div>
          <p style={{color:"#F8F6F0",fontWeight:600,fontSize:15}}>Mia</p>
          <p style={{color:"#00b894",fontSize:12}}>● Always here for you</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:14}}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display:"flex",justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth:"82%",borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding:"13px 16px",
              background: msg.role === "user"
                ? `linear-gradient(135deg, ${mood.orb[1]}, ${mood.orb[1]}cc)`
                : "rgba(255,255,255,0.07)",
              border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.08)" : "none",
              color:"#F8F6F0",fontSize:14,lineHeight:1.65,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{display:"flex",gap:6,padding:"14px 16px",
            background:"rgba(255,255,255,0.07)",borderRadius:"18px 18px 18px 4px",
            width:"fit-content",border:"1px solid rgba(255,255,255,0.08)"}}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width:7,height:7,borderRadius:"50%",background:"rgba(248,246,240,0.5)",
                animation:`typingDot 1.2s ease-in-out ${i*0.2}s infinite`,
              }}/>
            ))}
          </div>
        )}
        <div ref={messagesEnd}/>
      </div>

      {/* Input */}
      <div style={{
        padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.06)",
        display:"flex",gap:10,alignItems:"flex-end",flexShrink:0,
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
          placeholder="Say anything..."
          rows={1}
          style={{
            flex:1,background:"rgba(255,255,255,0.06)",
            border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:22,padding:"12px 18px",
            color:"#F8F6F0",fontSize:14,resize:"none",outline:"none",
            fontFamily:"'Inter',sans-serif",lineHeight:1.5,
            caretColor:mood.orb[1],maxHeight:120,
          }}
        />
        <button onClick={send} style={{
          width:46,height:46,borderRadius:"50%",border:"none",
          background:`linear-gradient(135deg, ${mood.orb[1]}, ${mood.orb[1]}aa)`,
          color:"#fff",fontSize:18,cursor:"pointer",flexShrink:0,
          boxShadow:`0 4px 20px ${mood.orb[1]}44`,display:"flex",
          alignItems:"center",justifyContent:"center",
        }}>
          ›
        </button>
      </div>
    </div>
  );
}

function JournalPage({ moodScore }) {
  const mood = MOODS[moodScore - 1] || MOODS[4];
  const [entry, setEntry] = useState("");
  const [saved, setSaved] = useState(false);
  const [entries] = useState([
    { date:"Yesterday", preview:"Today was exhausting but I managed to finish my assignment...", mood:5 },
    { date:"2 days ago", preview:"Feeling a bit better. Called mom and it helped...", mood:7 },
  ]);

  return (
    <div style={{minHeight:"100vh",padding:"60px 20px 100px"}}>
      <div style={{marginBottom:28}}>
        <p style={{color:"rgba(248,246,240,0.4)",fontSize:11,letterSpacing:"0.1em",
          textTransform:"uppercase",marginBottom:6}}>private journal</p>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:26,color:"#F8F6F0"}}>
          Your words, your truth
        </h2>
        <p style={{color:"rgba(248,246,240,0.45)",fontSize:13,marginTop:6}}>
          No one reads this but you and Mia.
        </p>
      </div>

      {/* Write area */}
      {!saved ? (
        <div style={{
          background:"rgba(255,255,255,0.03)",borderRadius:24,
          border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden",marginBottom:24,
        }}>
          <div style={{
            padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",
            display:"flex",justifyContent:"space-between",alignItems:"center",
          }}>
            <p style={{color:"rgba(248,246,240,0.5)",fontSize:13}}>
              {new Date().toLocaleDateString("en-IN",{weekday:"long",month:"long",day:"numeric"})}
            </p>
            <div style={{
              width:10,height:10,borderRadius:"50%",
              background:mood.orb[1],boxShadow:`0 0 8px ${mood.orb[1]}`,
            }}/>
          </div>
          <textarea
            value={entry}
            onChange={e => setEntry(e.target.value)}
            placeholder={"Start with how your day really was...\n\nThis is your safe space."}
            rows={10}
            style={{
              width:"100%",background:"transparent",border:"none",
              padding:"20px",color:"#F8F6F0",fontSize:15,lineHeight:1.8,
              resize:"none",outline:"none",fontFamily:"'Fraunces',serif",
              boxSizing:"border-box",
            }}
          />
          <div style={{
            padding:"14px 20px",borderTop:"1px solid rgba(255,255,255,0.06)",
            display:"flex",justifyContent:"space-between",alignItems:"center",
          }}>
            <span style={{color:"rgba(248,246,240,0.3)",fontSize:11}}>{entry.length}/5000</span>
            <button
              onClick={() => entry.trim() && setSaved(true)}
              style={{
                background: entry.trim()
                  ? `linear-gradient(135deg, ${mood.orb[1]}, ${mood.orb[1]}aa)`
                  : "rgba(255,255,255,0.08)",
                border:"none",borderRadius:50,padding:"10px 24px",
                color: entry.trim() ? "#fff" : "rgba(248,246,240,0.4)",
                fontSize:13,fontWeight:600,cursor: entry.trim() ? "pointer" : "default",
                transition:"all 0.3s",
              }}>
              Save entry ✦
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          background:"rgba(0,184,148,0.08)",borderRadius:24,padding:"24px",
          border:"1px solid rgba(0,184,148,0.2)",marginBottom:24,textAlign:"center",
        }}>
          <p style={{fontSize:28,marginBottom:10}}>💜</p>
          <h3 style={{fontFamily:"'Fraunces',serif",color:"#F8F6F0",marginBottom:8}}>Saved</h3>
          <p style={{color:"rgba(248,246,240,0.55)",fontSize:13,lineHeight:1.6,marginBottom:14}}>
            Mia's reflection: "Writing this took honesty. What you felt today is real — and you showed up for yourself."
          </p>
          <button onClick={() => { setSaved(false); setEntry(""); }} style={{
            background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:50,padding:"10px 22px",color:"rgba(248,246,240,0.7)",
            fontSize:13,cursor:"pointer",
          }}>Write another</button>
        </div>
      )}

      {/* Past entries */}
      <p style={{color:"rgba(248,246,240,0.4)",fontSize:11,letterSpacing:"0.08em",
        textTransform:"uppercase",marginBottom:14}}>past entries</p>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {entries.map((e, i) => {
          const em = MOODS[e.mood - 1];
          return (
            <div key={i} style={{
              background:"rgba(255,255,255,0.04)",borderRadius:18,padding:"16px 18px",
              border:"1px solid rgba(255,255,255,0.07)",display:"flex",gap:14,
            }}>
              <div style={{
                width:36,height:36,borderRadius:"50%",flexShrink:0,
                background:`radial-gradient(circle, ${em.orb[1]}, ${em.orb[0]})`,
              }}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{color:"rgba(248,246,240,0.45)",fontSize:11}}>{e.date}</span>
                  <span style={{color:em.orb[1],fontSize:11}}>{em.label}</span>
                </div>
                <p style={{color:"rgba(248,246,240,0.7)",fontSize:13,lineHeight:1.5,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.preview}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CommunityPage({ moodScore }) {
  const mood = MOODS[moodScore - 1] || MOODS[4];
  const [posts] = useState([
    { alias:"Gentle Fox #28", time:"2m ago", mood:3, content:"I've been failing my exams and I feel like I'm disappointing everyone. Does anyone else feel like they're not enough?", hugs:14, tag:"exam-stress" },
    { alias:"Calm Owl #52", time:"18m ago", mood:6, content:"Today I finally told my friend I was struggling. She just listened. I forgot how good that feels.", hugs:31, tag:"sharing-win" },
    { alias:"Brave Sparrow #11", time:"1h ago", mood:4, content:"Family expectations are crushing me. I love them but I can't breathe.", hugs:22, tag:"family" },
    { alias:"Still Crane #07", time:"2h ago", mood:7, content:"Day 14 without skipping my meds. Small win but it matters to me.", hugs:47, tag:"sharing-win" },
  ]);
  const [hugged, setHugged] = useState({});

  return (
    <div style={{minHeight:"100vh",padding:"60px 20px 100px"}}>
      <div style={{marginBottom:24}}>
        <p style={{color:"rgba(248,246,240,0.4)",fontSize:11,letterSpacing:"0.1em",
          textTransform:"uppercase",marginBottom:6}}>you're not alone</p>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:26,color:"#F8F6F0",marginBottom:8}}>
          Others feel it too
        </h2>
        <p style={{color:"rgba(248,246,240,0.45)",fontSize:13,lineHeight:1.6}}>
          All posts are anonymous. No usernames, no profiles — just real feelings shared safely.
        </p>
      </div>

      {/* Tags filter */}
      <div style={{display:"flex",gap:8,overflowX:"auto",marginBottom:24,paddingBottom:4}}>
        {["All","Anxiety","Exams","Family","Wins","Loneliness"].map(tag => (
          <button key={tag} style={{
            background: tag === "All" ? `${mood.orb[1]}28` : "rgba(255,255,255,0.05)",
            border: `1px solid ${tag === "All" ? mood.orb[1] : "rgba(255,255,255,0.1)"}`,
            borderRadius:50,padding:"7px 16px",color:"#F8F6F0",
            fontSize:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,
          }}>{tag}</button>
        ))}
      </div>

      {/* Posts */}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {posts.map((post, i) => {
          const pm = MOODS[post.mood - 1];
          const isHugged = hugged[i];
          return (
            <div key={i} style={{
              background:"rgba(255,255,255,0.04)",borderRadius:22,padding:"20px",
              border:"1px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{
                    width:32,height:32,borderRadius:"50%",
                    background:`radial-gradient(circle, ${pm.orb[1]}, ${pm.orb[0]})`,
                  }}/>
                  <div>
                    <p style={{color:"rgba(248,246,240,0.7)",fontSize:12,fontWeight:600}}>{post.alias}</p>
                    <p style={{color:"rgba(248,246,240,0.35)",fontSize:10}}>{post.time}</p>
                  </div>
                </div>
                <span style={{
                  background:`${pm.orb[1]}20`,borderRadius:50,padding:"4px 10px",
                  color:pm.orb[1],fontSize:10,fontWeight:600,
                }}>{pm.label}</span>
              </div>
              <p style={{color:"rgba(248,246,240,0.85)",fontSize:14,lineHeight:1.7,marginBottom:14}}>
                {post.content}
              </p>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <button
                  onClick={() => setHugged(prev => ({...prev, [i]: !prev[i]}))}
                  style={{
                    background: isHugged ? "rgba(108,92,231,0.2)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${isHugged ? "#6c5ce7" : "rgba(255,255,255,0.1)"}`,
                    borderRadius:50,padding:"8px 16px",
                    color: isHugged ? "#a78bfa" : "rgba(248,246,240,0.55)",
                    fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:7,
                    transition:"all 0.2s",
                  }}>
                  🤗 {post.hugs + (isHugged ? 1 : 0)} hugs
                </button>
                <button style={{
                  background:"none",border:"none",color:"rgba(248,246,240,0.35)",
                  fontSize:12,cursor:"pointer",
                }}>Reply</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Write post */}
      <button onClick={() => {}} style={{
        position:"fixed",bottom:90,right:20,
        width:52,height:52,borderRadius:"50%",border:"none",
        background:`linear-gradient(135deg, ${mood.orb[1]}, ${mood.orb[1]}bb)`,
        color:"#fff",fontSize:22,cursor:"pointer",
        boxShadow:`0 8px 28px ${mood.orb[1]}55`,display:"flex",
        alignItems:"center",justifyContent:"center",
      }}>+</button>
    </div>
  );
}

function DashboardPage({ moodScore }) {
  const mood = MOODS[moodScore - 1] || MOODS[4];
  const weekData = [
    { day:"Mon", score:3 },{ day:"Tue", score:5 },{ day:"Wed", score:4 },
    { day:"Thu", score:6 },{ day:"Fri", score:7 },{ day:"Sat", score:5 },{ day:"Sun", score:moodScore },
  ];
  const maxScore = 10;

  return (
    <div style={{minHeight:"100vh",padding:"60px 20px 100px"}}>
      <div style={{marginBottom:28}}>
        <p style={{color:"rgba(248,246,240,0.4)",fontSize:11,letterSpacing:"0.1em",
          textTransform:"uppercase",marginBottom:6}}>your journey</p>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:26,color:"#F8F6F0"}}>
          90 days of you
        </h2>
      </div>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:24}}>
        {[
          { label:"Day streak", value:"4 🔥", color:"#fdcb6e" },
          { label:"Check-ins", value:"23", color:mood.orb[1] },
          { label:"Avg mood", value:"5.2", color:"#00b894" },
        ].map(s => (
          <div key={s.label} style={{
            background:"rgba(255,255,255,0.04)",borderRadius:18,padding:"16px 12px",
            border:"1px solid rgba(255,255,255,0.07)",textAlign:"center",
          }}>
            <p style={{fontFamily:"'Fraunces',serif",fontSize:22,color:s.color,fontWeight:700,marginBottom:4}}>
              {s.value}
            </p>
            <p style={{color:"rgba(248,246,240,0.45)",fontSize:11}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mood chart */}
      <div style={{
        background:"rgba(255,255,255,0.03)",borderRadius:24,padding:"20px",
        border:"1px solid rgba(255,255,255,0.07)",marginBottom:24,
      }}>
        <p style={{color:"rgba(248,246,240,0.5)",fontSize:12,marginBottom:20,letterSpacing:"0.05em"}}>
          This week
        </p>
        <div style={{display:"flex",alignItems:"flex-end",gap:8,height:100}}>
          {weekData.map((d, i) => {
            const dm = MOODS[d.score - 1];
            const h = (d.score / maxScore) * 100;
            return (
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                <div style={{
                  width:"100%",height:`${h}%`,borderRadius:6,
                  background: i === 6
                    ? `linear-gradient(to top, ${mood.orb[1]}, ${mood.orb[1]}88)`
                    : `rgba(255,255,255,0.1)`,
                  boxShadow: i === 6 ? `0 0 16px ${mood.orb[1]}55` : "none",
                  transition:"height 1s cubic-bezier(0.4,0,0.2,1)",
                  minHeight:4,
                }}/>
                <span style={{color:"rgba(248,246,240,0.4)",fontSize:10}}>{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI memory insight */}
      <div style={{
        background:`linear-gradient(135deg, ${mood.orb[1]}15, rgba(108,92,231,0.08))`,
        borderRadius:22,padding:"20px",
        border:`1px solid ${mood.orb[1]}28`,marginBottom:20,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <span style={{fontSize:20}}>🧠</span>
          <p style={{color:"rgba(248,246,240,0.5)",fontSize:11,textTransform:"uppercase",
            letterSpacing:"0.08em"}}>Mia remembers</p>
        </div>
        <p style={{color:"#F8F6F0",fontSize:14,lineHeight:1.7,fontStyle:"italic"}}>
          "This week you mentioned exams and feeling lonely. Your mood tends to dip on Tuesdays — that's when your stress peaks. You've recovered better every time you wrote in your journal."
        </p>
      </div>

      {/* Burnout alert */}
      <div style={{
        background:"rgba(220,38,38,0.08)",borderRadius:18,padding:"16px 18px",
        border:"1px solid rgba(220,38,38,0.2)",display:"flex",gap:14,alignItems:"center",
      }}>
        <span style={{fontSize:22}}>⚡</span>
        <div>
          <p style={{color:"#fca5a5",fontWeight:600,fontSize:13,marginBottom:2}}>Low burnout risk</p>
          <p style={{color:"rgba(248,246,240,0.45)",fontSize:11}}>
            You're managing. Keep checking in — we're watching your patterns.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MoodEnhancer() {
  const [page, setPage] = useState("home");
  const [moodScore, setMoodScore] = useState(5);
  const userName = "Ansh";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { background:#0D0F1A; color:#F8F6F0; font-family:'Inter',sans-serif; }
        ::-webkit-scrollbar { width:0; }
        @keyframes orbPulse {
          0%, 100% { transform:scale(1); opacity:1; }
          50% { transform:scale(1.04); opacity:0.9; }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform:translateY(0); opacity:0.4; }
          30% { transform:translateY(-5px); opacity:1; }
        }
        @keyframes fadeSlide {
          from { opacity:0; transform:translateY(12px); }
          to { opacity:1; transform:translateY(0); }
        }
        input[type=range] {
          -webkit-appearance:none; appearance:none;
          background:rgba(255,255,255,0.1); height:6px; border-radius:6px; cursor:pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none; appearance:none;
          width:22px; height:22px; border-radius:50%;
          background:#F8F6F0; cursor:pointer;
          box-shadow:0 2px 10px rgba(0,0,0,0.4);
        }
        textarea::placeholder { color:rgba(248,246,240,0.3); }
      `}</style>

      <div style={{
        maxWidth:430,margin:"0 auto",minHeight:"100vh",
        background:"#0D0F1A",position:"relative",overflow:"hidden",
      }}>
        {/* Ambient bg glow */}
        <div style={{
          position:"fixed",top:"-20%",left:"50%",transform:"translateX(-50%)",
          width:400,height:400,borderRadius:"50%",
          background:`radial-gradient(circle, ${(MOODS[moodScore-1]||MOODS[4]).orb[1]}18 0%, transparent 70%)`,
          pointerEvents:"none",zIndex:0,
          transition:"background 1.5s ease",
        }}/>

        <div style={{position:"relative",zIndex:1}}>
          {page === "home"      && <HomePage setPage={setPage} moodScore={moodScore} userName={userName}/>}
          {page === "checkin"   && <CheckInPage moodScore={moodScore} setMoodScore={setMoodScore}/>}
          {page === "chat"      && <ChatPage moodScore={moodScore}/>}
          {page === "journal"   && <JournalPage moodScore={moodScore}/>}
          {page === "community" && <CommunityPage moodScore={moodScore}/>}
          {page === "dashboard" && <DashboardPage moodScore={moodScore}/>}
        </div>

        <NavBar page={page} setPage={setPage} moodScore={moodScore}/>
      </div>
    </>
  );
}
