import { GameSet, ItemResource, GearResource, EnemyResource, EventResource } from './types';

// Beautiful SVG placeholder data URLs for our default assets
export const SVG_ICONS = {
  potion: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="%231a1a1a" filter="drop-shadow(0 0 10px rgba(212,168,83,0.3))"/><path d="M40,20 L60,20 L60,35 L40,35 Z" fill="%23b89b5c" stroke="%23d4a853" stroke-width="2"/><path d="M50,12 L50,20" stroke="%23d4a853" stroke-width="4"/><path d="M30,35 C30,35 20,60 20,75 C20,90 35,90 50,90 C65,90 80,90 80,75 C80,60 70,35 70,35 Z" fill="%23261212" stroke="%23d4a853" stroke-width="3"/><path d="M24,70 Q50,60 76,70 L72,83 Q50,85 28,83 Z" fill="%23a13d3d"/><ellipse cx="50" cy="50" rx="6" ry="12" fill="none" stroke="%23ff6b6b" stroke-width="1" transform="rotate(-30 50 50)"/><circle cx="45" cy="74" r="3" fill="%23fff" opacity="0.7"/><circle cx="58" cy="78" r="1.5" fill="%23fff" opacity="0.6"/><path d="M40,12 L60,12" stroke="%23d4a853" stroke-width="2"/></svg>`,

  potion_active: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="%231a1a1a" filter="drop-shadow(0 0 15px rgba(235,90,90,0.5))"/><path d="M40,18 L60,18 L60,33 L40,33 Z" fill="%23d4a853" stroke="%23ff5555" stroke-width="2"/><path d="M30,33 C30,33 20,58 20,73 C20,88 35,88 50,88 C65,88 80,88 80,73 C80,58 70,33 70,33 Z" fill="%233a1111" stroke="%23ff2a2a" stroke-width="3"/><path d="M22,65 Q50,55 78,65 L74,81 Q50,83 26,81 Z" fill="%23cc2b2b"/><circle cx="50" cy="50" r="15" fill="none" stroke="%23ff8c8c" stroke-width="2" stroke-dasharray="5 3"/><circle cx="40" cy="70" r="4" fill="%23fff" opacity="0.9"/><circle cx="60" cy="65" r="2" fill="%23fff" opacity="0.8"/></svg>`,

  sword: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="%231a1a1a"/><path d="M20,80 L40,60 M25,85 L30,80" stroke="%238a713e" stroke-width="5" stroke-linecap="round"/><circle cx="21" cy="79" r="4" fill="%23d4a853"/><path d="M35,65 L45,55 L40,50 L30,60 Z" fill="%23b89b5c" stroke="%23d4a853" stroke-width="2"/><path d="M42,52 L80,14 C83,11 89,17 86,20 L48,58 Z" fill="%23e6d8b5" stroke="%23b89b5c" stroke-width="2"/><path d="M45,49 L77,17" stroke="%23fff" stroke-width="1.5"/><path d="M50,45 L70,25" stroke="%23ff6666" stroke-width="1" opacity="0.8"/></svg>`,

  shield: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="%231a1a1a"/><path d="M30,20 Q50,15 70,20 C70,40 68,65 50,85 C32,65 30,40 30,20 Z" fill="%232b261d" stroke="%23d4a853" stroke-width="3"/><path d="M37,25 Q50,21 63,25 C63,41 61,61 50,77 C39,61 37,41 37,25 Z" fill="%231a1a1a" stroke="%23b89b5c" stroke-width="1.5"/><path d="M50,23 L50,75 M37,38 L63,38" stroke="%23d4a853" stroke-width="2" opacity="0.6"/><circle cx="50" cy="38" r="8" fill="%23a13d3d" stroke="%23d4a853" stroke-width="1.5"/></svg>`,

  enemy: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="%231a1a1a" filter="drop-shadow(0 0 10px rgba(161,61,61,0.4))"/><path d="M50,15 C30,15 25,35 25,50 C25,70 35,82 50,82 C65,82 75,70 75,50 C75,35 70,15 50,15 Z" fill="%23242424" stroke="%23a13d3d" stroke-width="3"/><path d="M33,35 L45,43 M67,35 L55,43" stroke="%23a13d3d" stroke-width="4" stroke-linecap="round"/><ellipse cx="38" cy="48" rx="5" ry="3" fill="%23ff3333"/><ellipse cx="62" cy="48" rx="5" ry="3" fill="%23ff3333"/><path d="M45,63 Q50,57 55,63 L58,68 L53,66 L50,73 L47,66 L42,68 Z" fill="%23b89b5c" stroke="%23a13d3d" stroke-width="1.5"/><path d="M30,22 L35,10 L43,21 M70,22 L65,10 L57,21" stroke="%23a13d3d" stroke-width="2" stroke-linejoin="round" fill="none"/></svg>`,

  event: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="%231a1a1a" filter="drop-shadow(0 0 10px rgba(0,255,200,0.2))"/><path d="M20,15 L80,15 L90,85 L10,85 Z" fill="%231f1e1c" stroke="%23b89b5c" stroke-width="3"/><path d="M35,35 Q50,10 65,35 Q90,50 65,65 Q50,90 35,65 Q10,50 35,35 Z" fill="none" stroke="%2300ffd5" stroke-width="2" stroke-dasharray="4 2"/><circle cx="50" cy="50" r="12" fill="%23101e1a" stroke="%2300ffd5" stroke-width="2.5"/><circle cx="50" cy="50" r="4" fill="%2300ffd5"/><path d="M15,20 L30,20 M15,25 L25,25 M85,20 L70,20" stroke="%23b89b5c" stroke-width="1"/></svg>`,

  blueprint_gear: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="%230a1128" stroke="%233b82f6" stroke-width="3"/><path d="M10,10 L90,10 L90,90 L10,90 Z" fill="none" stroke="%231d4ed8" stroke-width="1" stroke-dasharray="5 5"/><line x1="50" y1="0" x2="50" y2="100" stroke="%233b82f6" stroke-width="1" stroke-dasharray="2 2"/><line x1="0" y1="50" x2="100" y2="50" stroke="%233b82f6" stroke-width="1" stroke-dasharray="2 2"/><rect x="25" y="25" width="50" height="50" fill="none" stroke="%2360a5fa" stroke-width="2"/><circle cx="50" cy="50" r="18" fill="none" stroke="%233b82f6" stroke-width="1.5"/><line x1="30" y1="30" x2="70" y2="70" stroke="%23f59e0b" stroke-width="1"/><text x="15" y="82" fill="%233b82f6" font-family="monospace" font-size="8">DRW_905-B</text></svg>`
};

// Initial Core Sets (Now empty for zero-state ForgeCraft database)
export const INITIAL_SETS: GameSet[] = [];

// Initial Items (Now empty)
export const INITIAL_ITEMS: ItemResource[] = [];

// Initial Weapons & Armors (Now empty)
export const INITIAL_GEARS: GearResource[] = [];

// Initial Enemies (Now empty)
export const INITIAL_ENEMIES: EnemyResource[] = [];

// Initial Events (Now empty)
export const INITIAL_EVENTS: EventResource[] = [];

// Complete presets (Empty)
export const PRESETS = {
  items: [] as any[],
  weapons: [] as any[],
  armors: [] as any[],
  enemies: [] as any[],
  events: [] as any[]
};
