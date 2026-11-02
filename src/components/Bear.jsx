// Milo, der Brillenbär: eigener Charakter als SVG. Die Emotes steuert allein die CSS-Klasse e-<name> in bear.css.
import { useT } from './Language.jsx';

export const EMOTES = ['flex', 'fire', 'flag', 'dance', 'cup'];

export default function Bear({ emote = '' }) {
  const t = useT();
  return (
    <svg className={emote ? `bear emoting e-${emote}` : 'bear'} viewBox="-30 -30 300 300" role="img" aria-label={t('app.bear')}>
      <g className="b-all">
        <ellipse className="b-shadow" cx="120" cy="256" rx="72" ry="9" />
        <ellipse className="fur" cx="88" cy="236" rx="24" ry="17" />
        <ellipse className="fur" cx="152" cy="236" rx="24" ry="17" />

        <g className="pose pose-idle">
          <rect className="fur" x="58" y="146" width="24" height="62" rx="12" transform="rotate(10 70 150)" />
          <rect className="fur" x="158" y="146" width="24" height="62" rx="12" transform="rotate(-10 170 150)" />
        </g>

        <ellipse className="fur" cx="120" cy="180" rx="50" ry="56" />

        <g className="chest">
          <path className="muscle" d="M120 142c-16-6-36-3-37 13-1 15 21 19 37 11 16 8 38 4 37-11-1-16-21-19-37-13z" />
          <rect className="muscle" x="103" y="172" width="16" height="13" rx="5" />
          <rect className="muscle" x="122" y="172" width="16" height="13" rx="5" />
          <rect className="muscle" x="104" y="188" width="15" height="13" rx="5" />
          <rect className="muscle" x="122" y="188" width="15" height="13" rx="5" />
        </g>

        <g className="shirt">
          <g className="shirt-l">
            <path className="tee" d="M120 130H90c-14 2-25 14-27 31l-1 42c7 22 34 29 58 29z" />
          </g>
          <g className="shirt-r">
            <path className="tee" d="M120 130h30c14 2 25 14 27 31l1 42c-7 22-34 29-58 29z" />
          </g>
          <text className="tee-logo" x="120" y="192" textAnchor="middle">M</text>
        </g>

        <g className="pose pose-flex">
          <path className="fur" d="M72 158 34 150c-8-1-13-8-11-16l9-40c2-8 10-12 17-9 7 2 11 9 9 17l-6 26 34 12c8 3 10 11 7 18-3 5-12 7-21 0z" />
          <path className="fur" d="m168 158 38-8c8-1 13-8 11-16l-9-40c-2-8-10-12-17-9-7 2-11 9-9 17l6 26-34 12c-8 3-10 11-7 18 3 5 12 7 21 0z" />
          <ellipse className="bicep" cx="44" cy="126" rx="15" ry="19" />
          <ellipse className="bicep" cx="196" cy="126" rx="15" ry="19" />
        </g>

        <g className="pose pose-flag">
          <rect className="fur" x="58" y="146" width="24" height="62" rx="12" transform="rotate(10 70 150)" />
          <g className="flag-arm">
            <rect className="pole" x="200" y="-26" width="7" height="190" rx="3" />
            <g className="flag">
              <rect x="207" y="-24" width="24" height="56" fill="#d91023" />
              <rect x="231" y="-24" width="24" height="56" fill="#ffffff" />
              <rect x="255" y="-24" width="24" height="56" fill="#d91023" />
            </g>
            <path className="fur" d="M160 164c-8-4-9-13-4-19l36-40c6-6 15-6 20-1 6 6 5 14 0 20l-36 40c-5 4-11 4-16 0z" />
          </g>
        </g>

        <g className="pose pose-cup">
          <path className="fur" d="M78 152c-7 3-14 0-17-7l-12-40c-2-8 2-15 10-17 7-2 15 2 17 10l12 38c2 7-3 13-10 16z" />
          <path className="fur" d="M162 152c7 3 14 0 17-7l12-40c2-8-2-15-10-17-7-2-15 2-17 10l-12 38c-2 7 3 13 10 16z" />
          <g className="cup">
            <path d="M84 -26h72v22c0 24-16 40-36 40S84 18 84-4z" fill="#ffc53d" stroke="#d48806" strokeWidth="4" />
            <path d="M84-16H62c0 24 12 32 26 34M156-16h22c0 24-12 32-26 34" fill="none" stroke="#d48806" strokeWidth="7" />
            <rect x="108" y="36" width="24" height="12" fill="#d48806" />
            <rect x="92" y="46" width="56" height="12" rx="4" fill="#8c5a00" />
          </g>
        </g>

        <g className="head">
          <circle className="fur" cx="76" cy="40" r="20" />
          <circle className="fur" cx="164" cy="40" r="20" />
          <circle className="ear-in" cx="76" cy="40" r="10" />
          <circle className="ear-in" cx="164" cy="40" r="10" />
          <circle className="fur" cx="120" cy="84" r="58" />
          <path className="band" d="M64 66c34-15 78-15 112 0l3 16c-37-15-81-15-118 0z" />
          <ellipse className="ring" cx="96" cy="92" rx="17" ry="19" />
          <ellipse className="ring" cx="144" cy="92" rx="17" ry="19" />
          <path className="ring" d="M108 80c6-8 18-8 24 0l-3 7c-6-5-12-5-18 0z" />
          <ellipse className="muzzle" cx="120" cy="116" rx="30" ry="22" />
          <g className="eyes">
            <circle cx="96" cy="92" r="10" fill="#fff" />
            <circle cx="144" cy="92" r="10" fill="#fff" />
            <circle className="pupil" cx="98" cy="93" r="6" />
            <circle className="pupil" cx="142" cy="93" r="6" />
            <circle cx="100" cy="90" r="2" fill="#fff" />
            <circle cx="144" cy="90" r="2" fill="#fff" />
          </g>
          <ellipse className="nose" cx="120" cy="106" rx="9" ry="6.5" />
          <path className="smile" d="M104 119c8 10 24 10 32 0" />
          <ellipse className="mouth-open" cx="134" cy="123" rx="15" ry="12" />
          <g className="shades">
            <rect x="76" y="80" width="38" height="24" rx="8" />
            <rect x="126" y="80" width="38" height="24" rx="8" />
            <rect x="112" y="87" width="16" height="5" />
          </g>
        </g>

        <g className="fire">
          <path className="flame f1" d="M140 122c30-22 66-30 122-16-14 8-22 12-30 13 12 3 20 9 28 22-34-4-52-1-76 6-22 2-38-10-44-25z" />
          <path className="flame f2" d="M142 123c24-14 50-18 88-8-10 6-16 9-22 10 8 3 12 7 18 15-24-3-38-1-52 3-14 1-27-8-32-20z" />
          <path className="flame f3" d="M145 124c15-8 32-10 54-4-10 4-12 6-14 8 4 2 6 4 8 7-14-2-24-1-32 1-7 0-13-5-16-12z" />
        </g>

        <g className="sparks">
          <rect x="8" y="40" width="10" height="10" rx="2" fill="#ffc53d" />
          <rect x="220" y="20" width="10" height="10" rx="2" fill="#2ec4b6" />
          <circle cx="0" cy="130" r="6" fill="#ff6b35" />
          <circle cx="240" cy="150" r="6" fill="#d91023" />
          <rect x="30" y="-10" width="9" height="9" rx="2" fill="#7bd651" />
          <circle cx="200" cy="-14" r="5" fill="#ffc53d" />
        </g>
      </g>
    </svg>
  );
}
