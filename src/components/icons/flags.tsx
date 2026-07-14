// Country flag SVGs + locale→flag map — extracted verbatim from the landing page.
// Pure presentational (Server Component compatible); consumed by the language switcher.
import { type Locale } from "@/lib/i18n/config";

type FlagProps = { className?: string };
const DEF = "w-5 h-4 rounded-sm overflow-hidden";

export const FlagRO = ({ className = DEF }: FlagProps) => (
  <svg className={className} viewBox="0 0 640 480">
    <g fillRule="evenodd" strokeWidth="1pt">
      <path fill="#00319c" d="M0 0h213.3v480H0z"/>
      <path fill="#ffde00" d="M213.3 0h213.4v480H213.3z"/>
      <path fill="#de2110" d="M426.7 0H640v480H426.7z"/>
    </g>
  </svg>
);

export const FlagGB = ({ className = DEF }: FlagProps) => (
  <svg className={className} viewBox="0 0 640 480">
    <path fill="#012169" d="M0 0h640v480H0z"/>
    <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
    <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
    <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
    <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
  </svg>
);

export const FlagDE = ({ className = DEF }: FlagProps) => (
  <svg className={className} viewBox="0 0 640 480">
    <path fill="#ffce00" d="M0 320h640v160H0z"/>
    <path d="M0 0h640v160H0z"/>
    <path fill="#d00" d="M0 160h640v160H0z"/>
  </svg>
);

export const FlagPL = ({ className = DEF }: FlagProps) => (
  <svg className={className} viewBox="0 0 640 480">
    <g fillRule="evenodd">
      <path fill="#fff" d="M640 480H0V0h640z"/>
      <path fill="#dc143c" d="M640 480H0V240h640z"/>
    </g>
  </svg>
);

export const FlagHU = ({ className = DEF }: FlagProps) => (
  <svg className={className} viewBox="0 0 640 480">
    <g fillRule="evenodd">
      <path fill="#fff" d="M640 480H0V0h640z"/>
      <path fill="#388d00" d="M640 480H0V320h640z"/>
      <path fill="#d43516" d="M640 160.1H0V.1h640z"/>
    </g>
  </svg>
);

export const FlagBG = ({ className = DEF }: FlagProps) => (
  <svg className={className} viewBox="0 0 640 480">
    <g fillRule="evenodd" strokeWidth="1pt">
      <path fill="#d62612" d="M0 320h640v160H0z"/>
      <path fill="#00966e" d="M0 160h640v160H0z"/>
      <path fill="#fff" d="M0 0h640v160H0z"/>
    </g>
  </svg>
);

export const FlagFR = ({ className = DEF }: FlagProps) => (
  <svg className={className} viewBox="0 0 640 480">
    <g fillRule="evenodd" strokeWidth="1pt">
      <path fill="#fff" d="M0 0h640v480H0z"/>
      <path fill="#002654" d="M0 0h213.3v480H0z"/>
      <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
    </g>
  </svg>
);

export const FlagNL = ({ className = DEF }: FlagProps) => (
  <svg className={className} viewBox="0 0 640 480">
    <g fillRule="evenodd" strokeWidth="1pt">
      <path fill="#21468b" d="M0 320h640v160H0z"/>
      <path fill="#fff" d="M0 160h640v160H0z"/>
      <path fill="#ae1c28" d="M0 0h640v160H0z"/>
    </g>
  </svg>
);

// Map locale to flag component
export const localeToFlag: Record<Locale, React.FC<FlagProps>> = {
  ro: FlagRO,
  en: FlagGB,
  de: FlagDE,
  pl: FlagPL,
  hu: FlagHU,
  bg: FlagBG,
  fr: FlagFR,
  nl: FlagNL,
};

export const FlagIT = ({ className = DEF }: FlagProps) => (
  <svg className={className} viewBox="0 0 640 480">
    <path fill="#009246" d="M0 0h213.3v480H0z"/>
    <path fill="#fff" d="M213.3 0h213.4v480H213.3z"/>
    <path fill="#ce2b37" d="M426.7 0H640v480H426.7z"/>
  </svg>
);

export const FlagES = ({ className = DEF }: FlagProps) => (
  <svg className={className} viewBox="0 0 640 480">
    <path fill="#c60b1e" d="M0 0h640v480H0z"/>
    <path fill="#ffc400" d="M0 120h640v240H0z"/>
  </svg>
);

export const FlagCZ = ({ className = DEF }: FlagProps) => (
  <svg className={className} viewBox="0 0 640 480">
    <path fill="#fff" d="M0 0h640v240H0z"/>
    <path fill="#d7141a" d="M0 240h640v240H0z"/>
    <path fill="#11457e" d="M360 240 0 0v480z"/>
  </svg>
);

export const FlagSK = ({ className = DEF }: FlagProps) => (
  <svg className={className} viewBox="0 0 640 480">
    <path fill="#ee1c25" d="M0 0h640v480H0z"/>
    <path fill="#0b4ea2" d="M0 0h640v320H0z"/>
    <path fill="#fff" d="M0 0h640v160H0z"/>
    <path fill="#fff" d="M233 105c-34 0-68 5-68 5v138c0 66 68 108 68 108s68-42 68-108V110s-34-5-68-5z"/>
    <path fill="#ee1c25" d="M233 117c-29 0-58 4-58 4v131c0 58 58 96 58 96s58-38 58-96V121s-29-4-58-4z"/>
    <path fill="#fff" d="M215 152h36v32h32v36h-32v74h-36v-74h-32v-36h32z"/>
  </svg>
);
