"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import styles from "./page.module.css";

const DISCORD_ID = "901487880067776524";

type LanyardData = {
  discord_user: { username: string; avatar: string; id: string };
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: Array<{ name: string; type: number; details?: string }>;
  listening_to_spotify: boolean;
  spotify?: { song: string; artist: string; album_art_url: string };
};

const STATUS_COLORS: Record<string, string> = {
  online: "#23d18b", idle: "#f0c040", dnd: "#f04747", offline: "#747f8d",
};
const STATUS_LABELS: Record<string, string> = {
  online: "online", idle: "idle", dnd: "do not disturb", offline: "offline",
};

/* ── ICONS ── */
const IconVolume = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);
const IconMute = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
  </svg>
);

/* ── TERMINAL DATA ── */
const SKILL_CATEGORIES = [
  { label: "languages", items: ["Python", "Java", "JavaScript", "TypeScript"] },
  { label: "frontend",  items: ["HTML", "CSS", "React.js", "Next.js"] },
  { label: "backend & databases", items: ["Node.js", "MySQL", "MongoDB"] },
];

const PROJECTS = [
  { name: "Fault",         lang: "Python",  desc: "Discord bot — utility & moderation",   link: "#" },
  { name: "Cellestra",     lang: "Node.js", desc: "Feature-rich Discord bot",              link: "#" },
  { name: "Crystal Music", lang: "Node.js", desc: "High-quality Discord music bot",        link: "#" },
  { name: "Portfolio",     lang: "Next.js", desc: "Personal portfolio — you are here",     link: "#" },
];

type Line =
  | { type: "cmd";    text: string }
  | { type: "output"; text: string; color?: string; indent?: boolean }
  | { type: "blank" }
  | { type: "title" }    // special: animated title
  | { type: "discord" }; // special: discord card

const HELP_TEXT = [
  { type: "output" as const, text: "available commands:" },
  { type: "output" as const, text: "  whoami          →  about me",          color: "#666" },
  { type: "output" as const, text: "  skills --list   →  tech stack",        color: "#666" },
  { type: "output" as const, text: "  projects --show →  my work",           color: "#666" },
  { type: "output" as const, text: "  contact --info  →  reach me",          color: "#666" },
  { type: "output" as const, text: "  status          →  discord presence",  color: "#666" },
  { type: "output" as const, text: "  clear           →  clear terminal",    color: "#666" },
];

function useTypewriter(text: string, speed = 38, startDelay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    const t = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(t);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

/* ── TERMINAL LINE RENDERER ── */
function TermLine({ line, lanyard }: { line: Line; lanyard: LanyardData | null }) {
  if (line.type === "blank") return <div className={styles.tBlank} />;
  if (line.type === "cmd") return (
    <div className={styles.tCmd}>
      <span className={styles.tPrompt}>{">"}</span>
      <span className={styles.tCmdText}>{line.text}</span>
    </div>
  );
  if (line.type === "output") return (
    <div
      className={styles.tOut}
      style={{ color: line.color || "#888", paddingLeft: line.indent ? "16px" : undefined }}
    >
      {line.text}
    </div>
  );
  if (line.type === "discord") {
    const status = lanyard?.discord_status ?? "offline";
    const avatarUrl = lanyard
      ? `https://cdn.discordapp.com/avatars/${lanyard.discord_user.id}/${lanyard.discord_user.avatar}.png?size=64`
      : null;
    const spotify = lanyard?.spotify;
    const game = lanyard?.activities.find((a) => a.type === 0);
    return (
      <div className={styles.dcBlock}>
        <div className={styles.dcRow}>
          <div className={styles.avWrap}>
            {avatarUrl
              ? <img src={avatarUrl} alt="av" className={styles.av} />
              : <div className={styles.avPh} />}
            <div className={styles.stDot} style={{ background: STATUS_COLORS[status] }} />
          </div>
          <div>
            <div className={styles.dcName}>{lanyard?.discord_user.username ?? "iworship.ayush"}</div>
            <div className={styles.dcSt} style={{ color: STATUS_COLORS[status] }}>{STATUS_LABELS[status]}</div>
            {game && <div className={styles.dcAct}>playing {game.name}</div>}
          </div>
        </div>
        {spotify && (
          <div className={styles.spRow}>
            <img src={spotify.album_art_url} alt="art" className={styles.spArt} />
            <div>
              <div className={styles.spBadge}>spotify</div>
              <div className={styles.spSong}>{spotify.song}</div>
              <div className={styles.spArt2}>{spotify.artist}</div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
}

/* ── MAIN ── */
export default function Home() {
  const [lanyard, setLanyard]     = useState<LanyardData | null>(null);
  const [muted, setMuted]         = useState(true);
  const [titleDone, setTitleDone] = useState(false);
  const [lines, setLines]         = useState<Line[]>([]);
  const [inputVal, setInputVal]   = useState("");
  const [cleared, setCleared]     = useState(false);
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  /* stars */
  const stars = useMemo(() => Array.from({ length: 120 }, (_, i) => {
    const g = i < 50 ? "a" : i < 90 ? "b" : "c";
    return {
      id: i, g,
      x: Math.random() * 100, y: Math.random() * 100,
      size: g === "c" ? Math.random() * 1 + 0.3 : Math.random() * 2 + 0.5,
      oa: (Math.random() * 0.2 + 0.05).toFixed(2),
      ob: (g === "c" ? Math.random() * 0.85 + 0.5 : Math.random() * 0.45 + 0.25).toFixed(2),
      d:  (Math.random() * 4 + 2).toFixed(1),
      d2: (Math.random() * 10 + 8).toFixed(1),
      dl: (Math.random() * 8).toFixed(1),
      dx: ((Math.random() - 0.5) * 14).toFixed(1),
      dy: ((Math.random() - 0.5) * 12).toFixed(1),
    };
  }), []);

  const shooters = useMemo(() => Array.from({ length: 4 }, (_, i) => ({
    id: i,
    x: Math.random() * 70, y: Math.random() * 40,
    sx: (Math.random() * 200 + 120).toFixed(0),
    sy: (Math.random() * 130 + 60).toFixed(0),
    dur: (Math.random() * 3 + 2.5).toFixed(1),
    del: (Math.random() * 14 + i * 5).toFixed(1),
  })), []);

  /* audio */
  useEffect(() => {
    const audio = new Audio("/voice.mp3");
    audio.loop = true; audio.volume = 0.4; audio.muted = false;
    audioRef.current = audio;
    audio.play()
      .then(() => setMuted(false))
      .catch(() => {
        setMuted(true); audio.muted = true;
        const unlock = () => {
          audio.muted = false;
          audio.play().then(() => setMuted(false)).catch(() => {});
          document.removeEventListener("click", unlock);
          document.removeEventListener("keydown", unlock);
        };
        document.addEventListener("click", unlock);
        document.addEventListener("keydown", unlock);
      });
    return () => { audio.pause(); };
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !muted;
    audioRef.current.muted = next;
    if (!next) audioRef.current.play().catch(() => {});
    setMuted(next);
  };

  /* lanyard */
  useEffect(() => {
    const poll = async () => {
      try {
        const r = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const d = await r.json();
        if (d.success) setLanyard(d.data);
      } catch {}
    };
    poll();
    const iv = setInterval(poll, 15000);
    return () => clearInterval(iv);
  }, []);

  /* auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, titleDone]);

  /* auto-run sequence after title */
  useEffect(() => {
    if (!titleDone) return;
    const sequence: { delay: number; fn: () => void }[] = [];
    let t = 300;

    const addCmd  = (text: string, d: number) => { sequence.push({ delay: t, fn: () => setLines(p => [...p, { type: "cmd", text }]) }); t += d; };
    const addOut  = (out: Line[], d: number) => { sequence.push({ delay: t, fn: () => setLines(p => [...p, ...out]) }); t += d; };

    // whoami
    addCmd("whoami", 600);
    addOut([
      { type: "output", text: "Ayush", color: "#d0d0d0" },
      { type: "output", text: "21 · West Bengal, India", color: "#666" },
      { type: "output", text: "3rd year CS student · full stack dev", color: "#666" },
      { type: "output", text: "i hang out on Discord for fun, but ended up building bots because", color: "#555" },
      { type: "output", text: "making things that actually work is just satisfying.", color: "#555" },
      { type: "blank" },
    ], 700);

    // skills
    addCmd("skills --list", 800);
    const skillLines: Line[] = [];
    SKILL_CATEGORIES.forEach(cat => {
      skillLines.push({ type: "output", text: `[${cat.label}]`, color: "#555" });
      skillLines.push({ type: "output", text: cat.items.join("  ·  "), color: "#888", indent: true });
    });
    skillLines.push({ type: "blank" });
    addOut(skillLines, 700);

    // projects
    addCmd("projects --show", 900);
    const projLines: Line[] = [];
    PROJECTS.forEach(p => {
      projLines.push({ type: "output", text: `${p.name}`, color: "#c8c8c8" });
      projLines.push({ type: "output", text: `  ${p.desc}  [${p.lang}]`, color: "#555", indent: false });
    });
    projLines.push({ type: "blank" });
    addOut(projLines, 700);

    // status
    addCmd("status", 800);
    addOut([{ type: "discord" }, { type: "blank" }], 700);

    // contact
    addCmd("contact --info", 800);
    addOut([
      { type: "output", text: "discord   →  iworship.ayush", color: "#888" },
      { type: "output", text: "instagram →  unkwn.fy",       color: "#888" },
      { type: "output", text: "github    →  yup-console",    color: "#888" },
      { type: "output", text: "email     →  consolepvt@gmail.com", color: "#888" },
      { type: "blank" },
    ], 400);

    const timers = sequence.map(s => setTimeout(s.fn, s.delay));
    return () => timers.forEach(clearTimeout);
  }, [titleDone]);

  /* manual command input */
  const runCmd = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    setLines(p => [...p, { type: "cmd", text: raw.trim() }]);
    setInputVal("");

    if (cmd === "clear") {
      setTimeout(() => { setLines([]); setCleared(c => !c); }, 100);
      return;
    }
    if (cmd === "whoami") {
      setLines(p => [...p,
        { type: "output", text: "Ayush · 21 · West Bengal, India", color: "#d0d0d0" },
        { type: "output", text: "3rd year CS student · full stack dev", color: "#666" },
        { type: "output", text: "i hang out on Discord for fun, but ended up building bots", color: "#555" },
        { type: "output", text: "because making things that actually work is just satisfying.", color: "#555" },
        { type: "blank" },
      ]); return;
    }
    if (cmd === "skills --list") {
      const sl: Line[] = [];
      SKILL_CATEGORIES.forEach(cat => {
        sl.push({ type: "output", text: `[${cat.label}]`, color: "#555" });
        sl.push({ type: "output", text: cat.items.join("  ·  "), color: "#888", indent: true });
      });
      sl.push({ type: "blank" });
      setLines(p => [...p, ...sl]); return;
    }
    if (cmd === "projects --show") {
      const pl: Line[] = [];
      PROJECTS.forEach(pr => {
        pl.push({ type: "output", text: pr.name, color: "#c8c8c8" });
        pl.push({ type: "output", text: `  ${pr.desc}  [${pr.lang}]`, color: "#555" });
      });
      pl.push({ type: "blank" });
      setLines(p => [...p, ...pl]); return;
    }
    if (cmd === "status") {
      setLines(p => [...p, { type: "discord" }, { type: "blank" }]); return;
    }
    if (cmd === "contact --info") {
      setLines(p => [...p,
        { type: "output", text: "discord   →  iworship.ayush",       color: "#888" },
        { type: "output", text: "instagram →  unkwn.fy",             color: "#888" },
        { type: "output", text: "github    →  yup-console",          color: "#888" },
        { type: "output", text: "email     →  consolepvt@gmail.com", color: "#888" },
        { type: "blank" },
      ]); return;
    }
    if (cmd === "help") {
      setLines(p => [...p, ...HELP_TEXT, { type: "blank" }]); return;
    }
    if (cmd === "sudo rm -rf" || cmd === "sudo rm -rf /") {
      setLines(p => [...p,
        { type: "output", text: "nice try.", color: "#f04747" },
        { type: "blank" },
      ]); return;
    }
    setLines(p => [...p,
      { type: "output", text: `command not found: ${raw.trim()}  (try 'help')`, color: "#555" },
      { type: "blank" },
    ]);
  };

  return (
    <>
      {/* STARS */}
      <div className={styles.starsBg}>
        {stars.map(s => (
          <div key={s.id} className={`${styles.star} ${styles[`star${s.g.toUpperCase()}`]}`}
            style={{
              left:`${s.x}%`, top:`${s.y}%`,
              width:`${s.size}px`, height:`${s.size}px`,
              "--a":s.oa,"--b":s.ob,"--d":`${s.d}s`,"--d2":`${s.d2}s`,
              "--dl":`${s.dl}s`,"--dx":`${s.dx}px`,"--dy":`${s.dy}px`,
            } as React.CSSProperties}
          />
        ))}
        {shooters.map(sh => (
          <div key={sh.id} className={styles.shoot}
            style={{
              left:`${sh.x}%`, top:`${sh.y}%`,
              "--sd":`${sh.dur}s`,"--sdl":`${sh.del}s`,
              "--sx":`${sh.sx}px`,"--sy":`${sh.sy}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* MUTE BTN */}
      <button
        className={`${styles.muteBtn}${!muted ? ` ${styles.muteBtnOn}` : ""}`}
        onClick={toggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <IconMute /> : <IconVolume />}
      </button>

      {/* TERMINAL */}
      <div className={styles.terminal} onClick={() => inputRef.current?.focus()}>
        <div className={styles.termInner}>

          {/* TITLE — typewriter */}
          <Title onDone={() => setTitleDone(true)} />

          {/* LINES */}
          {lines.map((line, i) => (
            <TermLine key={i} line={line} lanyard={lanyard} />
          ))}

          {/* INPUT */}
          {titleDone && (
            <div className={styles.tInputRow}>
              <span className={styles.tPrompt}>{">"}</span>
              <input
                ref={inputRef}
                className={styles.tInput}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && inputVal.trim()) runCmd(inputVal);
                }}
                spellCheck={false}
                autoComplete="off"
                placeholder="type a command..."
                autoFocus
              />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </>
  );
}

/* ── TITLE COMPONENT ── */
function Title({ onDone }: { onDone: () => void }) {
  const FULL = "Console";
  const { displayed, done } = useTypewriter(FULL, 110, 400);
  const called = useRef(false);
  useEffect(() => {
    if (done && !called.current) { called.current = true; onDone(); }
  }, [done, onDone]);

  return (
    <div className={styles.titleBlock}>
      <div className={styles.titleName}>
        {displayed}
        {!done && <span className={styles.titleCursor} />}
      </div>
      {done && (
        <div className={styles.titleSub}>
          full stack developer · discord bot builder · west bengal, india
        </div>
      )}
      <div className={styles.titleDivider} />
    </div>
  );
}
