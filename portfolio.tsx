import { useState, useEffect, useRef, useMemo } from "react";

const DISCORD_ID = "901487880067776524";

type LanyardData = {
  discord_user: {
    username: string;
    discriminator: string;
    avatar: string;
    id: string;
  };
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: Array<{
    name: string;
    type: number;
    state?: string;
    details?: string;
    assets?: { large_image?: string; large_text?: string };
  }>;
  listening_to_spotify: boolean;
  spotify?: {
    song: string;
    artist: string;
    album_art_url: string;
    track_id: string;
  };
};

const statusColors: Record<string, string> = {
  online: "#23d18b",
  idle: "#f0c040",
  dnd: "#f04747",
  offline: "#747f8d",
};

const statusLabels: Record<string, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

// SVG icons as components — no emojis
const IconDiscord = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
);

const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const IconGithub = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconVolume = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

const IconMute = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="23" y1="9" x2="17" y2="15"/>
    <line x1="17" y1="9" x2="23" y2="15"/>
  </svg>
);

const IconBot = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <line x1="8" y1="16" x2="8" y2="16"/>
    <line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);

const IconExternalLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

// Skill SVG icons
const SkillIcons: Record<string, JSX.Element> = {
  Python: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#3572A5">
      <path d="M11.914.002C5.82.002 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.888S0 5.77 0 11.927c0 6.157 3.405 5.94 3.405 5.94h2.033v-2.86s-.11-3.404 3.35-3.404h5.77s3.241.052 3.241-3.132V3.296S18.326.002 11.914.002zm-3.2 1.851a1.01 1.01 0 1 1 0 2.02 1.01 1.01 0 0 1 0-2.02z"/>
      <path d="M12.086 23.998c6.093 0 5.714-2.654 5.714-2.654l-.007-2.752H11.98v-.826h8.132S24 18.23 24 12.073c0-6.157-3.405-5.94-3.405-5.94h-2.033v2.86s.11 3.404-3.35 3.404h-5.77S6.2 12.345 6.2 15.529v5.175s-.461 3.294 5.886 3.294zm3.2-1.851a1.01 1.01 0 1 1 0-2.02 1.01 1.01 0 0 1 0 2.02z"/>
    </svg>
  ),
  Java: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#b07219">
      <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0 0-8.216 2.051-4.292 6.573"/>
      <path d="M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0 0 .07-.062.09-.118"/>
      <path d="M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832 0 6.836-2.274-2.052-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.189-7.627"/>
      <path d="M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0 0 .553.457 3.393.639"/>
    </svg>
  ),
  JavaScript: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#f1e05a">
      <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/>
    </svg>
  ),
  TypeScript: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#3178c6">
      <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
    </svg>
  ),
  HTML: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#e34c26">
      <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/>
    </svg>
  ),
  CSS: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#563d7c">
      <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.413z"/>
    </svg>
  ),
  "Next.js": (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#ffffff">
      <path d="M11.5725 0c-.1763 0-.3098.0013-.3584.0067-.0516.0053-.2159.021-.3636.0328-3.4088.3073-6.6017 2.1463-8.624 4.9728C1.1004 6.584.3802 8.3666.1082 10.255c-.0962.659-.108.8537-.108 1.7474.0001.9474.0123 1.1161.1189 1.7826.6081 3.7544 3.0087 6.8042 6.5726 8.3320.900.3865 1.7862.6388 2.8479.7748.3606.0461 1.9353.0461 2.296 0 1.6107-.2028 2.9804-.6555 4.286-1.4308.2051-.1312.2441-.1662.2161-.1956-.0188-.0196-1.1384-1.5131-2.4905-3.3118L10.8277 15.6l-3.6064-5.3343c-1.9872-2.9366-3.6123-5.3384-3.6207-5.3384-.0084 0-.0151 2.3887-.0188 5.3117-.0052 5.1146-.0084 5.3265-.0722 5.5112-.0904.2552-.1697.3421-.4057.4457-.1782.0793-.3357.0943-.9977.0943H1.4693l-.1958-.1223c-.1228-.0764-.2067-.175-.2603-.2917L1 15.0153V6.5338c0-7.3024.0013-8.4886.0665-8.6413.0378-.0895.1267-.1815.2243-.2319.1374-.07.191-.077.6745-.077H7.64c3.9285 0 5.5.0013 5.5.0013s.0013 2.5946.0013 3.4881c0 .5327.0391.7074.2 .8562.1066.1025.2655.1656.4284.1758.1615.0099 5.3342 0 5.3342 0 .4467 0 .7208-.1274.8456-.3885.0601-.1285.0668-.3804.0668-2.4826V6.553L18.24 5.097C17.4924 3.8742 16.7 2.7117 15.8736 1.6167 15.4748 1.0898 14.4538 0 14.2906 0c-.0628 0-1.2968.0013-2.7181.0013zM18.09 7.2786c-.9843 0-1.7807.7964-1.7807 1.7807 0 .9843.7964 1.7807 1.7807 1.7807.9843 0 1.7807-.7964 1.7807-1.7807 0-.9843-.7964-1.7807-1.7807-1.7807z"/>
    </svg>
  ),
  "React.js": (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#61dafb">
      <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.150-1.315.283-2.015.386.24-.377.48-.763.704-1.16.225-.39.435-.782.635-1.174zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"/>
    </svg>
  ),
  MySQL: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#00758f">
      <path d="M16.405 5.501c-.115 0-.193.014-.274.033v.013h.014c.054.104.146.18.214.273.054.107.1.214.154.32l.014-.015c.094-.066.14-.172.14-.333-.04-.047-.046-.094-.08-.14-.04-.067-.126-.1-.182-.151zM5.77 18.695h-.927a50.854 50.854 0 0 0-.27-4.41h-.008l-1.41 4.41H2.45l-1.4-4.41h-.01a72.892 72.892 0 0 0-.195 4.41H0c.055-1.966.192-3.81.41-5.53h1.15l1.335 4.064h.008l1.347-4.064h1.095c.242 2.015.384 3.86.428 5.53zm4.017-4.08c-.378 2.045-.876 3.533-1.492 4.46-.482.716-1.01 1.073-1.583 1.073-.153 0-.34-.046-.566-.138v-.494c.11.017.24.026.386.026.268 0 .483-.075.647-.222.197-.18.295-.382.295-.605 0-.155-.077-.47-.23-.944L6.09 14.615h.91l.727 2.36c.164.53.233.91.205 1.145.34-1.045.578-2.165.716-3.505h.14zm9.463.326c-.203.069-.452.105-.75.105-.534 0-.986-.163-1.355-.49-.368-.327-.552-.755-.552-1.283 0-.555.19-.987.57-1.298.38-.31.872-.465 1.473-.465.326 0 .572.025.744.076v.47c-.207-.085-.435-.126-.686-.126-.383 0-.69.113-.917.34-.23.225-.343.534-.343.925 0 .382.108.688.326.922.217.232.51.348.878.348.262 0 .495-.042.695-.127l-.083.603zm3.974.055c-.275 0-.56-.06-.856-.183v-.496c.29.12.568.178.832.178.255 0 .451-.062.588-.19.136-.125.204-.29.204-.493 0-.218-.076-.4-.228-.544-.15-.147-.388-.225-.714-.225h-.353v-.448h.353c.258 0 .47-.07.637-.206.168-.138.253-.316.253-.53 0-.163-.052-.295-.155-.397-.105-.1-.252-.15-.438-.15-.214 0-.436.052-.668.155v-.465c.255-.08.517-.12.785-.12.404 0 .722.107.954.32.23.215.346.496.346.846 0 .44-.192.768-.578.984.373.12.56.398.56.835 0 .296-.084.535-.254.717-.17.18-.393.27-.67.27-.068 0-.155-.005-.26-.018zm4.11.055h-2.2v-5.53h.906v4.854h1.295v.676z"/>
    </svg>
  ),
  MongoDB: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#4db33d">
      <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0 1 11.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 0 0 3.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z"/>
    </svg>
  ),
  "Node.js": (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#339933">
      <path d="M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.604.065-.037.151-.023.218.017l2.256 1.339c.082.045.198.045.277 0l8.795-5.076c.082-.047.134-.141.134-.238V6.921c0-.099-.053-.19-.137-.24l-8.791-5.072c-.081-.047-.19-.047-.271 0L3.075 6.68c-.084.05-.139.142-.139.241v10.15c0 .097.055.189.139.235l2.409 1.392c1.307.654 2.108-.116 2.108-.891V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.111.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L2.28 18.675c-.57-.329-.922-.943-.922-1.604V6.921c0-.66.352-1.274.922-1.603l8.795-5.082c.557-.315 1.296-.315 1.848 0l8.794 5.082c.57.329.924.943.924 1.603v10.15c0 .659-.354 1.273-.924 1.604l-8.794 5.078c-.28.163-.6.247-.925.247zm2.718-6.998c-3.847 0-4.651-1.766-4.651-3.247 0-.143.114-.253.256-.253h1.137c.127 0 .234.092.253.217.172 1.161.686 1.748 3.005 1.748 1.849 0 2.635-.418 2.635-1.399 0-.566-.223-.986-3.101-1.268-2.405-.238-3.891-.768-3.891-2.692 0-1.774 1.494-2.83 3.998-2.83 2.813 0 4.207.976 4.382 3.073.006.073-.019.144-.063.199-.047.054-.113.085-.183.085h-1.142c-.12 0-.225-.084-.249-.202-.27-1.192-.924-1.575-2.745-1.575-2.021 0-2.256.703-2.256 1.228 0 .638.278.824 3.006 1.184 2.702.357 3.981.862 3.981 2.763 0 1.917-1.598 3.012-4.371 3.012z"/>
    </svg>
  ),
};

const skills = [
  { name: "Python" },
  { name: "Java" },
  { name: "JavaScript" },
  { name: "TypeScript" },
  { name: "HTML" },
  { name: "CSS" },
  { name: "Next.js" },
  { name: "React.js" },
  { name: "MySQL" },
  { name: "MongoDB" },
  { name: "Node.js" },
];

const projects = [
  {
    name: "Fault",
    description: "A Discord bot built with Python — utility & moderation focused",
    tags: ["Python", "Discord.py"],
    link: "#",
  },
  {
    name: "Cellestra",
    description: "A feature-rich Discord bot crafted in Node.js",
    tags: ["Node.js", "Discord.js"],
    link: "#",
  },
  {
    name: "Crystal Music",
    description: "High-quality Discord music bot built on Node.js",
    tags: ["Node.js", "Discord.js"],
    link: "#",
  },
  {
    name: "Portfolio",
    description: "Personal portfolio website with modern design",
    tags: ["Next.js", "React", "TypeScript"],
    link: "#",
  },
];

export default function App() {
  const [lanyard, setLanyard] = useState<LanyardData | null>(null);
  const [activeSection, setActiveSection] = useState("home");
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const homeRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const skillsRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  // Stars — 3 groups with different animation styles
  const stars = useMemo(() =>
    Array.from({ length: 140 }, (_, i) => {
      const group = i < 55 ? "a" : i < 100 ? "b" : "c";
      return {
        id: i,
        group,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: group === "c" ? (Math.random() * 1.1 + 0.3) : (Math.random() * 2.1 + 0.5),
        opFrom: group === "c"
          ? (Math.random() * 0.07 + 0.02).toFixed(2)
          : (Math.random() * 0.25 + 0.08).toFixed(2),
        opTo: group === "c"
          ? (Math.random() * 0.9 + 0.55).toFixed(2)
          : (Math.random() * 0.5 + 0.3).toFixed(2),
        dur: (Math.random() * 4 + (group === "c" ? 1.2 : 3)).toFixed(1),
        dur2: (Math.random() * 10 + 8).toFixed(1),
        delay: (Math.random() * 8).toFixed(1),
        dx: ((Math.random() - 0.5) * 16).toFixed(1),
        dy: ((Math.random() - 0.5) * 13).toFixed(1),
      };
    }), []);

  // Shooting stars
  const shooters = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * 75,
      y: Math.random() * 45,
      sx: (Math.random() * 220 + 120).toFixed(0),
      sy: (Math.random() * 140 + 70).toFixed(0),
      dur: (Math.random() * 3 + 2.5).toFixed(1),
      delay: (Math.random() * 14 + i * 4).toFixed(1),
    })), []);

  // Audio setup
  useEffect(() => {
    const audio = new Audio("/music.mp3");
    audio.loop = true;
    audio.volume = 0.35;
    audio.muted = true;
    audioRef.current = audio;

    const tryPlay = () => {
      audio.play().catch(() => {});
    };
    // Try on first interaction
    document.addEventListener("click", tryPlay, { once: true });
    document.addEventListener("keydown", tryPlay, { once: true });
    // Also try immediately (may work on some browsers)
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      document.removeEventListener("click", tryPlay);
      document.removeEventListener("keydown", tryPlay);
    };
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !muted;
    audioRef.current.muted = next;
    if (!next) {
      audioRef.current.play().catch(() => {});
    }
    setMuted(next);
  };

  // Lanyard polling
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const data = await res.json();
        if (data.success) setLanyard(data.data);
      } catch {}
    };
    fetch_();
    const iv = setInterval(fetch_, 15000);
    return () => clearInterval(iv);
  }, []);

  // Active section tracking
  useEffect(() => {
    const secs = [
      { ref: homeRef, id: "home" },
      { ref: projectsRef, id: "projects" },
      { ref: skillsRef, id: "skills" },
      { ref: contactRef, id: "contact" },
    ];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const found = secs.find((s) => s.ref.current === e.target);
            if (found) setActiveSection(found.id);
          }
        });
      },
      { threshold: 0.35 }
    );
    secs.forEach((s) => s.ref.current && obs.observe(s.ref.current));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLElement>) =>
    ref.current?.scrollIntoView({ behavior: "smooth" });

  const avatarUrl = lanyard
    ? `https://cdn.discordapp.com/avatars/${lanyard.discord_user.id}/${lanyard.discord_user.avatar}.png?size=128`
    : null;

  const status = lanyard?.discord_status ?? "offline";
  const spotify = lanyard?.spotify;
  const gameActivity = lanyard?.activities.find((a) => a.type === 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        html { scroll-behavior: smooth; }

        body {
          background: #030303;
          color: #c2c2c2;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 2px; }

        /* ── STARS ── */
        .stars-bg {
          position: fixed; inset: 0; z-index: 0;
          pointer-events: none; overflow: hidden;
        }
        .star {
          position: absolute; border-radius: 50%; background: #fff;
          will-change: transform, opacity;
        }
        /* group A — twinkle + gentle drift */
        .star.a {
          animation:
            tw var(--d, 3s) ease-in-out infinite alternate,
            drift var(--d2, 12s) ease-in-out infinite alternate;
          animation-delay: var(--dl, 0s);
        }
        /* group B — slow pulse + horizontal float */
        .star.b {
          animation:
            pulse var(--d, 5s) ease-in-out infinite alternate,
            floatX var(--d2, 18s) ease-in-out infinite alternate;
          animation-delay: var(--dl, 0s);
        }
        /* group C — sharp blink + vertical float */
        .star.c {
          animation:
            blink var(--d, 2s) ease-in-out infinite,
            floatY var(--d2, 14s) ease-in-out infinite alternate;
          animation-delay: var(--dl, 0s);
        }
        @keyframes tw {
          from { opacity: var(--a, .15); transform: scale(1); }
          to   { opacity: var(--b, .75); transform: scale(1.5); }
        }
        @keyframes pulse {
          0%   { opacity: var(--a, .1); box-shadow: 0 0 0px #fff; }
          50%  { opacity: var(--b, .6); box-shadow: 0 0 4px rgba(255,255,255,.25); }
          100% { opacity: var(--a, .1); box-shadow: 0 0 0px #fff; }
        }
        @keyframes blink {
          0%, 100% { opacity: var(--a, .05); }
          50%       { opacity: var(--b, .9); }
        }
        @keyframes drift {
          from { transform: translate(0px, 0px) scale(1); }
          to   { transform: translate(var(--dx, 6px), var(--dy, -5px)) scale(1.3); }
        }
        @keyframes floatX {
          from { transform: translateX(0px); }
          to   { transform: translateX(var(--dx, 10px)); }
        }
        @keyframes floatY {
          from { transform: translateY(0px); }
          to   { transform: translateY(var(--dy, 8px)); }
        }
        /* shooting star */
        .shoot {
          position: absolute; z-index: 0; pointer-events: none;
          width: 2px; height: 2px; border-radius: 50%;
          background: #fff;
          animation: shoot var(--sd, 3s) linear var(--sdl, 0s) infinite;
          opacity: 0;
        }
        @keyframes shoot {
          0%   { opacity: 0; transform: translate(0,0); }
          5%   { opacity: 1; }
          60%  { opacity: .4; }
          100% { opacity: 0; transform: translate(var(--sx, 300px), var(--sy, 200px)); }
        }

        /* ── NAV ── */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px;
          background: linear-gradient(180deg, rgba(0,0,0,.92) 0%, transparent 100%);
        }
        .nav-pills {
          display: flex; align-items: center; gap: 2px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 8px; padding: 5px 6px;
          backdrop-filter: blur(12px);
        }
        .nav-btn {
          background: none; border: none;
          color: #606060; font-family: 'JetBrains Mono', monospace;
          font-size: 12px; cursor: pointer;
          padding: 5px 13px; border-radius: 5px;
          transition: color .18s, background .18s;
          letter-spacing: .03em;
        }
        .nav-btn:hover { color: #c2c2c2; background: rgba(255,255,255,.06); }
        .nav-btn.active { color: #fff; background: rgba(255,255,255,.09); }

        /* Mute button */
        .mute-btn {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 7px; padding: 6px 12px;
          color: #555; font-family: 'JetBrains Mono', monospace;
          font-size: 11px; cursor: pointer;
          transition: color .18s, border-color .18s, background .18s;
          backdrop-filter: blur(12px); letter-spacing: .04em;
        }
        .mute-btn:hover { color: #c2c2c2; border-color: rgba(255,255,255,.14); background: rgba(255,255,255,.06); }
        .mute-btn.playing { color: #a8e6cf; border-color: rgba(168,230,207,.2); }

        /* ── SECTIONS ── */
        section {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 110px 20px 64px;
        }
        .wrap { width: 100%; max-width: 540px; }

        /* ── HOME ── */
        .home-name {
          font-size: clamp(2.2rem, 9vw, 3.4rem);
          font-weight: 600; letter-spacing: -.03em;
          color: #fff; margin-bottom: 6px;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1.05;
        }
        .home-sub {
          font-size: 12px; color: #484848;
          margin-bottom: 36px; letter-spacing: .04em;
          font-family: 'Inter', sans-serif; font-weight: 300;
        }

        /* ── DISCORD CARD ── */
        .dc-card {
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 10px; padding: 15px 16px;
          display: flex; align-items: center; gap: 13px;
          margin-bottom: 10px;
        }
        .av-wrap { position: relative; flex-shrink: 0; }
        .av {
          width: 50px; height: 50px; border-radius: 50%;
          object-fit: cover; background: #111;
          display: block;
        }
        .av-ph {
          width: 50px; height: 50px; border-radius: 50%;
          background: #111; display: flex; align-items: center; justify-content: center;
        }
        .av-ph svg { opacity: .3; }
        .st-dot {
          position: absolute; bottom: 1px; right: 1px;
          width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid #030303;
        }
        .dc-name { font-size: 13px; color: #d0d0d0; font-weight: 500; }
        .dc-st { font-size: 11px; margin-top: 2px; }
        .dc-act { font-size: 11px; color: #454545; margin-top: 4px; font-family: 'Inter', sans-serif; }

        /* ── SPOTIFY ── */
        .sp-card {
          background: rgba(255,255,255,.018);
          border: 1px solid rgba(255,255,255,.055);
          border-radius: 8px; padding: 11px 14px;
          display: flex; align-items: center; gap: 11px;
          margin-top: 0;
        }
        .sp-art {
          width: 38px; height: 38px; border-radius: 4px;
          object-fit: cover; flex-shrink: 0;
        }
        .sp-badge { font-size: 10px; color: #1db954; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 2px; }
        .sp-song { font-size: 12px; color: #c2c2c2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sp-artist { font-size: 11px; color: #484848; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Inter', sans-serif; }

        /* ── SECTION LABEL ── */
        .sec-label {
          font-size: 10px; color: #383838;
          text-transform: uppercase; letter-spacing: .16em;
          margin-bottom: 22px; padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,.05);
          font-family: 'Inter', sans-serif;
        }

        /* ── PROJECTS ── */
        .proj {
          background: rgba(255,255,255,.018);
          border: 1px solid rgba(255,255,255,.065);
          border-radius: 9px; padding: 15px 16px;
          margin-bottom: 10px;
          display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
          transition: border-color .2s;
        }
        .proj:hover { border-color: rgba(255,255,255,.12); }
        .proj-name { font-size: 13px; color: #d0d0d0; font-weight: 500; margin-bottom: 4px; }
        .proj-desc { font-size: 11px; color: #484848; margin-bottom: 10px; line-height: 1.55; font-family: 'Inter', sans-serif; font-weight: 300; }
        .proj-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .proj-tag {
          font-size: 10px; padding: 2px 8px;
          border-radius: 3px; background: rgba(255,255,255,.05);
          color: #555; border: 1px solid rgba(255,255,255,.07);
          letter-spacing: .04em;
        }
        .proj-link {
          color: #3a3a3a; text-decoration: none; flex-shrink: 0;
          transition: color .2s; margin-top: 1px;
        }
        .proj-link:hover { color: #a0a0a0; }

        /* ── SKILLS ── */
        .sk-grid { display: flex; flex-wrap: wrap; gap: 7px; }
        .sk-chip {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 13px;
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 6px; font-size: 12px; color: #888;
          transition: border-color .2s, background .2s, color .2s;
          cursor: default;
        }
        .sk-chip:hover { background: rgba(255,255,255,.05); color: #c2c2c2; border-color: rgba(255,255,255,.13); }
        .sk-icon { display: flex; align-items: center; flex-shrink: 0; }

        /* ── CONTACT ── */
        .ct-item {
          display: flex; align-items: center; gap: 13px;
          padding: 13px 15px;
          background: rgba(255,255,255,.018);
          border: 1px solid rgba(255,255,255,.065);
          border-radius: 8px; margin-bottom: 9px;
          text-decoration: none;
          transition: background .2s, border-color .2s;
        }
        .ct-item:hover { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.12); }
        .ct-ico {
          width: 30px; height: 30px; border-radius: 6px;
          background: rgba(255,255,255,.05);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: #555;
        }
        .ct-label { font-size: 10px; color: #3f3f3f; text-transform: uppercase; letter-spacing: .1em; font-family: 'Inter', sans-serif; }
        .ct-val { font-size: 12px; color: #888; margin-top: 2px; }

        @media (max-width: 480px) {
          .nav-btn { font-size: 11px; padding: 5px 9px; }
          .mute-btn { font-size: 10px; padding: 5px 10px; }
          section { padding: 96px 16px 50px; }
        }
      `}</style>

      {/* STARS */}
      <div className="stars-bg">
        {stars.map((s) => (
          <div
            key={s.id}
            className={`star ${s.group}`}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              ["--a" as any]: s.opFrom,
              ["--b" as any]: s.opTo,
              ["--d" as any]: `${s.dur}s`,
              ["--d2" as any]: `${s.dur2}s`,
              ["--dl" as any]: `${s.delay}s`,
              ["--dx" as any]: `${s.dx}px`,
              ["--dy" as any]: `${s.dy}px`,
            }}
          />
        ))}
        {shooters.map((sh) => (
          <div
            key={`sh-${sh.id}`}
            className="shoot"
            style={{
              left: `${sh.x}%`,
              top: `${sh.y}%`,
              ["--sd" as any]: `${sh.dur}s`,
              ["--sdl" as any]: `${sh.delay}s`,
              ["--sx" as any]: `${sh.sx}px`,
              ["--sy" as any]: `${sh.sy}px`,
              boxShadow: `0 0 2px 1px rgba(255,255,255,.6), -${Math.floor(Number(sh.sx)/4)}px -${Math.floor(Number(sh.sy)/4)}px ${Math.floor(Number(sh.sx)/3)}px 0 rgba(255,255,255,.08)`,
            }}
          />
        ))}
      </div>

      {/* NAV */}
      <nav>
        <div className="nav-pills">
          {[
            { id: "home", ref: homeRef },
            { id: "projects", ref: projectsRef },
            { id: "skills", ref: skillsRef },
            { id: "contact", ref: contactRef },
          ].map((item) => (
            <button
              key={item.id}
              className={`nav-btn${activeSection === item.id ? " active" : ""}`}
              onClick={() => scrollTo(item.ref)}
            >
              {item.id}
            </button>
          ))}
        </div>

        <button
          className={`mute-btn${!muted ? " playing" : ""}`}
          onClick={toggleMute}
          title={muted ? "Unmute music" : "Mute music"}
        >
          {muted ? <IconMute /> : <IconVolume />}
          {muted ? "muted" : "playing"}
        </button>
      </nav>

      {/* HOME */}
      <section ref={homeRef} id="home">
        <div className="wrap">
          <div className="home-name">Console</div>
          <div className="home-sub">full stack developer · modern web & discord bots</div>

          <div className="dc-card">
            <div className="av-wrap">
              {avatarUrl ? (
                <img src={avatarUrl} alt="discord avatar" className="av" />
              ) : (
                <div className="av-ph">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </div>
              )}
              <div className="st-dot" style={{ background: statusColors[status] }} />
            </div>
            <div>
              <div className="dc-name">{lanyard?.discord_user.username ?? "iworship.ayush"}</div>
              <div className="dc-st" style={{ color: statusColors[status] }}>{statusLabels[status]}</div>
              {gameActivity && (
                <div className="dc-act">
                  {gameActivity.name}{gameActivity.details ? ` — ${gameActivity.details}` : ""}
                </div>
              )}
            </div>
          </div>

          {spotify && (
            <div className="sp-card">
              <img src={spotify.album_art_url} alt="album" className="sp-art" />
              <div style={{ minWidth: 0 }}>
                <div className="sp-badge">Spotify</div>
                <div className="sp-song">{spotify.song}</div>
                <div className="sp-artist">{spotify.artist}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PROJECTS */}
      <section ref={projectsRef} id="projects">
        <div className="wrap">
          <div className="sec-label">a collection of things i've worked on</div>
          {projects.map((p) => (
            <div className="proj" key={p.name}>
              <div style={{ flex: 1 }}>
                <div className="proj-name">{p.name}</div>
                <div className="proj-desc">{p.description}</div>
                <div className="proj-tags">
                  {p.tags.map((t) => <span className="proj-tag" key={t}>{t}</span>)}
                </div>
              </div>
              <a href={p.link} className="proj-link" target="_blank" rel="noreferrer">
                <IconExternalLink />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* SKILLS */}
      <section ref={skillsRef} id="skills">
        <div className="wrap">
          <div className="sec-label">technologies i work with</div>
          <div className="sk-grid">
            {skills.map((s) => (
              <div className="sk-chip" key={s.name}>
                <span className="sk-icon">
                  {SkillIcons[s.name] ?? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/></svg>
                  )}
                </span>
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section ref={contactRef} id="contact">
        <div className="wrap">
          <div className="sec-label">feel free to reach out</div>

          <a href="https://discord.com/users/901487880067776524" className="ct-item" target="_blank" rel="noreferrer">
            <div className="ct-ico"><IconDiscord /></div>
            <div>
              <div className="ct-label">Discord</div>
              <div className="ct-val">iworship.ayush</div>
            </div>
          </a>

          <a href="https://instagram.com/unkwn.fy" className="ct-item" target="_blank" rel="noreferrer">
            <div className="ct-ico"><IconInstagram /></div>
            <div>
              <div className="ct-label">Instagram</div>
              <div className="ct-val">unkwn.fy</div>
            </div>
          </a>

          <a href="https://github.com/yup-console" className="ct-item" target="_blank" rel="noreferrer">
            <div className="ct-ico"><IconGithub /></div>
            <div>
              <div className="ct-label">GitHub</div>
              <div className="ct-val">yup-console</div>
            </div>
          </a>

          <a href="mailto:consolepvt@gmail.com" className="ct-item">
            <div className="ct-ico"><IconMail /></div>
            <div>
              <div className="ct-label">Email</div>
              <div className="ct-val">consolepvt@gmail.com</div>
            </div>
          </a>
        </div>
      </section>
    </>
  );
}
