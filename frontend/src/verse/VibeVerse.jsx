/**
 * VibeVerse.jsx
 *
 * Architecture — 5 independent layers (z-index order):
 *   Layer 0 — vv-layer-bg        Background map image (verse-map.jpg)
 *   Layer 1 — vv-layer-paths     Road/path SVG overlay (drawn from config edges)
 *   Layer 2 — vv-layer-objects   Building highlight sprites per zone
 *   Layer 3 — vv-layer-character Dog character + nametag
 *   Layer 4 — vv-layer-ui        Badges, checkpoints, enter prompts
 *
 * Config is loaded from /mapConfig.json (fetch on mount).
 * Pathfinding: BFS on road node graph (nodes + edges from config).
 * Camera: static on desktop, follows character on mobile (translate).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import sdk from '@farcaster/frame-sdk';
import './VibeVerse.css';
import CharacterSetup from './CharacterSetup';
import DogSprite from './DogSprite';
import HomePanel from './locations/HomePanel';
import VibeBankPanel from './locations/VibeBankPanel';
import DeFiVibePanel from './locations/DeFiVibePanel';
import LeaderboardPanel from './locations/LeaderboardPanel';
import ArenaPanel from './locations/ArenaPanel';
import VibePosterPanel from './locations/VibePosterPanel';
import HoldersZonePanel from './locations/HoldersZonePanel';

import NftMintPanel from './locations/NftMintPanel';

/* ── Panel registry ── */
const PANELS = {
  home:        (p, props) => <HomePanel player={p} {...props} />,
  bank:        (p, props) => <VibeBankPanel player={p} {...props} />,
  defi:        (p, props) => <DeFiVibePanel player={p} {...props} />,
  leaderboard: (p, props) => <LeaderboardPanel player={p} {...props} />,
  arena:       (p, props) => <ArenaPanel player={p} {...props} />,
  poster:      (p, props) => <VibePosterPanel player={p} {...props} />,
  holders:     (p, props) => <HoldersZonePanel player={p} {...props} />,
  nft_mint:    (p, props) => <NftMintPanel player={p} {...props} />,
};


/* ════════════════════════════════════════════════════════════════
   PATHFINDING UTILITIES
════════════════════════════════════════════════════════════════ */
function buildGraph(roadNodes, roadEdges) {
  const adj = {};
  Object.keys(roadNodes).forEach((k) => { adj[k] = []; });
  roadEdges.forEach(([u, v]) => {
    if (adj[u]) adj[u].push(v);
    if (adj[v]) adj[v].push(u);
  });
  return adj;
}

function bfsPath(adj, startId, targetId) {
  if (startId === targetId) return [];
  const queue = [[startId]];
  const visited = new Set([startId]);
  while (queue.length) {
    const path = queue.shift();
    const cur = path[path.length - 1];
    if (cur === targetId) return path;
    for (const nbr of (adj[cur] ?? [])) {
      if (!visited.has(nbr)) { visited.add(nbr); queue.push([...path, nbr]); }
    }
  }
  return [];
}

function getClosestPointOnSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) return { x: ax, y: ay, t: 0 };
  let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  return {
    x: ax + t * dx,
    y: ay + t * dy,
    t: t
  };
}

function snapToNearestPointOnRoad(cx, cy, roadNodes, roadEdges, threshold) {
  let bestPt = null;
  let minD = Infinity;
  let bestEdge = null;

  for (const [u, v] of roadEdges) {
    const n1 = roadNodes[u];
    const n2 = roadNodes[v];
    if (!n1 || !n2) continue;
    const pt = getClosestPointOnSegment(cx, cy, n1.x, n1.y, n2.x, n2.y);
    const d = Math.hypot(cx - pt.x, cy - pt.y);
    if (d < threshold && d < minD) {
      minD = d;
      bestPt = pt;
      bestEdge = [u, v];
    }
  }
  
  if (bestPt) {
    return { ...bestPt, edge: bestEdge };
  }
  return null;
}

function findOptimalRoadPath(cur, targetPoint, targetEdge, roadNodes, roadEdges, adjGraph) {
  let targetCoords = null;
  if (typeof targetPoint === 'string') {
    const node = roadNodes[targetPoint];
    if (!node) return [];
    targetCoords = { x: node.x, y: node.y };
  } else {
    targetCoords = { x: targetPoint.x, y: targetPoint.y };
  }

  // 0. Standing at target check: if cur is already at targetCoords (< 0.5%), do not move!
  if (Math.hypot(cur.x - targetCoords.x, cur.y - targetCoords.y) < 0.5) {
    return [{ x: targetCoords.x, y: targetCoords.y, id: 'target_end' }];
  }

  // 1. Same Edge Check: if cur is already on targetEdge, walk straight to targetCoords!
  if (targetEdge) {
    const [u, v] = targetEdge;
    const nU = roadNodes[u];
    const nV = roadNodes[v];
    if (nU && nV) {
      const snapCur = getClosestPointOnSegment(cur.x, cur.y, nU.x, nU.y, nV.x, nV.y);
      const distToEdge = Math.hypot(cur.x - snapCur.x, cur.y - snapCur.y);
      if (distToEdge < 1.0) {
        return [{ x: targetCoords.x, y: targetCoords.y, id: 'target_end' }];
      }
    }
  }

  // 2. Candidate Start Nodes
  const curSnap = snapToNearestPointOnRoad(cur.x, cur.y, roadNodes, roadEdges, 4.0);
  let startNodeCandidates = [];
  if (curSnap && curSnap.edge) {
    startNodeCandidates = [curSnap.edge[0], curSnap.edge[1]];
  } else {
    let minD = Infinity, nearId = null;
    for (const [id, node] of Object.entries(roadNodes)) {
      const d = Math.hypot(node.x - cur.x, node.y - cur.y);
      if (d < minD) { minD = d; nearId = id; }
    }
    if (nearId) startNodeCandidates = [nearId];
  }

  // 3. Candidate Target Nodes
  let targetNodeCandidates = [];
  if (typeof targetPoint === 'string') {
    targetNodeCandidates = [targetPoint];
  } else if (targetEdge) {
    targetNodeCandidates = [targetEdge[0], targetEdge[1]];
  } else {
    let minD = Infinity, nearId = null;
    for (const [id, node] of Object.entries(roadNodes)) {
      const d = Math.hypot(node.x - targetCoords.x, node.y - targetCoords.y);
      if (d < minD) { minD = d; nearId = id; }
    }
    if (nearId) targetNodeCandidates = [nearId];
  }

  let bestPathWaypoints = [];
  let minTotalDist = Infinity;

  // Evaluate candidate combinations
  for (const sId of startNodeCandidates) {
    for (const tId of targetNodeCandidates) {
      const path = bfsPath(adjGraph, sId, tId);
      if (!path.length && sId !== tId) continue;

      let waypoints = [];
      const sNode = roadNodes[sId];
      if (sNode && Math.hypot(cur.x - sNode.x, cur.y - sNode.y) > 0.2) {
        waypoints.push(sNode);
      }
      for (const id of path) {
        if (waypoints.length > 0 && waypoints[waypoints.length - 1].id === id) continue;
        if (roadNodes[id]) waypoints.push(roadNodes[id]);
      }

      waypoints.push({ x: targetCoords.x, y: targetCoords.y, id: 'target_end' });

      let totalDist = 0;
      let temp = cur;
      for (const pt of waypoints) {
        totalDist += Math.hypot(pt.x - temp.x, pt.y - temp.y);
        temp = pt;
      }

      if (totalDist < minTotalDist) {
        minTotalDist = totalDist;
        bestPathWaypoints = waypoints;
      }
    }
  }

  if (!bestPathWaypoints.length) {
    bestPathWaypoints = [{ x: targetCoords.x, y: targetCoords.y, id: 'target_end' }];
  }

  return bestPathWaypoints;
}

function getDirection(fx, fy, tx, ty) {
  const dx = tx - fx, dy = ty - fy;
  return Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'right' : 'left') : (dy >= 0 ? 'down' : 'up');
}

/* Generate SVG path data for road edges — straight orthogonal lines */
function buildRoadSvgPaths(roadNodes, roadEdges) {
  return roadEdges.map(([u, v]) => {
    const n1 = roadNodes[u], n2 = roadNodes[v];
    if (!n1 || !n2) return null;
    return { x1: n1.x, y1: n1.y, x2: n2.x, y2: n2.y, key: `${u}-${v}` };
  }).filter(Boolean);
}

/* ════════════════════════════════════════════════════════════════
   LOCATION OVERLAY / MODAL SYSTEM
════════════════════════════════════════════════════════════════ */
function LocationOverlay({ zone, zones, player, onClose, onNavigate, onUpdatePlayer }) {
  const [closing, setClosing] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const close = useCallback(() => { setClosing(true); setTimeout(onClose, 200); }, [onClose]);

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    const fn = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', fn);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', fn);
    };
  }, [close]);

  const zoneInfo = zones.find((z) => z.id === zone);
  const isFullscreen = zone === 'arena' || isMobileScreen;

  if (isFullscreen) {
    return (
      <div className={`vv-overlay arena-fullscreen vv-mobile-page-fullscreen ${closing ? 'closing' : ''}`}>
        <div className="vv-overlay__bar">
          <button className="vv-overlay__close" onClick={close}>
            <span className="vv-overlay__close-key">✕</span>CLOSE
          </button>
          <div className="vv-overlay__title">
            <div
              className="vv-overlay__title-icon"
              style={{ background: `${zoneInfo?.color || '#00f5ff'}18`, border: `1px solid ${zoneInfo?.color || '#00f5ff'}40` }}
            >
              {zoneInfo?.icon || '🏛️'}
            </div>
            <div>
              <div className="vv-overlay__title-text">{zoneInfo?.label || 'Vibe Verse'}</div>
              <div className="vv-overlay__title-sub">Vibe Verse — Base App</div>
            </div>
          </div>
          <div className="vv-overlay__nav">
            <span className="vv-overlay__nav-text">vibeverse.dog</span>
          </div>
        </div>
        <div className="vv-overlay__content">{PANELS[zone]?.(player, { close, onNavigate, onUpdatePlayer })}</div>
      </div>
    );
  }

  // Centered Modal Dialog for desktop
  return (
    <div className={`vv-modal-backdrop ${closing ? 'closing' : ''}`} onClick={close}>
      <div
        className={`vv-modal-card vv-modal-${zone}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vv-modal-header">
          <div className="vv-modal-header__title-group">
            <span className="vv-modal-header__icon">{zoneInfo?.icon}</span>
            <span className="vv-modal-header__title">{zoneInfo?.label}</span>
          </div>
          <button className="vv-modal-header__close" onClick={close} title="Close (ESC)">✕</button>
        </div>
        <div className="vv-modal-body">
          {PANELS[zone]?.(player, { close, onNavigate, onUpdatePlayer })}
        </div>
      </div>
    </div>
  );
}

const imgCache = {};

function useTransparentImage(src, threshold = 35) {
  const [dataUrl, setDataUrl] = useState(imgCache[src] || null);

  useEffect(() => {
    if (!src) return;
    if (src.endsWith('.png')) {
      setDataUrl(src);
      return;
    }
    if (imgCache[src]) {
      setDataUrl(imgCache[src]);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;

        // Flood-fill background removal starting from the 4 corners
        const visited = new Uint8Array(w * h);
        const queue = [
          0,
          w - 1,
          (h - 1) * w,
          (h - 1) * w + (w - 1)
        ];

        const isBgColor = (idx) => {
          const r = d[idx * 4];
          const g = d[idx * 4 + 1];
          const b = d[idx * 4 + 2];
          // Green screen chroma key
          if (g > 100 && g > r * 1.2 && g > b * 1.2) return true;
          // Dark background
          if (r < 45 && g < 45 && b < 45) return true;
          // Very light background
          if (r > 235 && g > 235 && b > 235) return true;
          return false;
        };

        for (const startIdx of queue) {
          if (visited[startIdx]) continue;
          if (!isBgColor(startIdx)) continue;

          const q = [startIdx];
          visited[startIdx] = 1;

          while (q.length > 0) {
            const curr = q.pop();
            d[curr * 4 + 3] = 0; // Set Alpha to 0

            const cx = curr % w;
            const cy = Math.floor(curr / w);

            const neighbors = [
              cx > 0 ? curr - 1 : -1,
              cx < w - 1 ? curr + 1 : -1,
              cy > 0 ? curr - w : -1,
              cy < h - 1 ? curr + w : -1
            ];

            for (const n of neighbors) {
              if (n !== -1 && !visited[n] && isBgColor(n)) {
                visited[n] = 1;
                q.push(n);
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const url = c.toDataURL();
        imgCache[src] = url;
        setDataUrl(url);
      } catch (e) {
        setDataUrl(src);
      }
    };
    img.onerror = () => setDataUrl(null);
    img.src = src;
  }, [src, threshold]);

  return dataUrl;
}

/* ════════════════════════════════════════════════════════════════
   LAYER 2 — Building Object on map
════════════════════════════════════════════════════════════════ */
function BuildingObject({ zone, isActive, isHovered, onHoverChange, onEnter }) {
  if (!zone.buildingSprite) return null;
  const transparentSprite = useTransparentImage(zone.buildingSprite, 35);
  const isFlipped = zone.id === 'leaderboard' || zone.id === 'holders';

  const style = {
    position: 'absolute',
    left:   `${zone.buildingX}%`,
    top:    `${zone.buildingY}%`,
    width:  zone.buildingW ? `${zone.buildingW}%` : (zone.buildingWidth || '200px'),
    height: zone.buildingH ? `${zone.buildingH}%` : 'auto',
    transform: `translate(-50%, -100%) ${isFlipped ? 'scaleX(-1)' : ''}`,
    zIndex: Math.floor((zone.buildingY || 50) * 10),
    cursor: 'pointer',
    pointerEvents: 'auto',
  };
  return (
    <div
      className={`vv-building-object vv-building-${zone.id} ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
      style={style}
      data-zone={zone.id}
      onMouseEnter={() => onHoverChange?.(zone.id)}
      onMouseLeave={() => onHoverChange?.(null)}
      onClick={(e) => { e.stopPropagation(); onEnter?.(zone.id); }}
      onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); onEnter?.(zone.id); }}
    >
      {transparentSprite && (
        <img
          src={transparentSprite}
          alt={zone.label}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      )}
    </div>
  );
}




/* ════════════════════════════════════════════════════════════════
   LAYER 4 — Zone Badge (checkpoint + pill label)
════════════════════════════════════════════════════════════════ */
function ZoneBadge({ zone, isActive, isHovered, onEnter, onHoverChange }) {
  const badgeX = zone.checkpointX;
  const badgeY = zone.checkpointY - 3.5;
  return (
    <>
      {/* Checkpoint dot — on the road */}
      <div
        className={`vv-badge-group vv-checkpoint-only ${isHovered ? 'hovered' : ''} ${isActive ? 'active' : ''}`}
        style={{ left: `${zone.checkpointX}%`, top: `${zone.checkpointY}%` }}
        onMouseEnter={() => onHoverChange(zone.id)}
        onMouseLeave={() => onHoverChange(null)}
        onClick={(e) => { e.stopPropagation(); onEnter(zone.id); }}
        onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); onEnter(zone.id); }}
      >
        <div className={`vv-black-checkpoint ${isHovered ? 'hovered' : ''} ${isActive ? 'active' : ''}`}>
          <div className="vv-black-checkpoint__dot" />
        </div>
      </div>

      {/* Badge label — on the building */}
      <div
        className={`vv-building-badge ${isHovered ? 'hovered' : ''} ${isActive ? 'active' : ''}`}
        style={{ left: `${badgeX}%`, top: `${badgeY}%` }}
        onMouseEnter={() => onHoverChange(zone.id)}
        onMouseLeave={() => onHoverChange(null)}
        onClick={(e) => { e.stopPropagation(); onEnter(zone.id); }}
        onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); onEnter(zone.id); }}
      >
        <div className="vv-building-badge__inner" style={{ borderColor: `${zone.color}60` }}>
          <span className="vv-building-badge__label">{zone.label}</span>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const MOVE_SPEED = 0.14;

export default function VibeVerse() {
  /* ── Config state (loaded from /mapConfig.json) ── */
  const [config, setConfig]           = useState(null);

  const [adjGraph, setAdjGraph]       = useState({});
  const [roadPaths, setRoadPaths]     = useState([]);

  /* ── Game state ── */
  const [player, setPlayer]           = useState(null);
  const [activeZone, setActiveZone]   = useState(null);
  const [openLocation, setOpenLocation] = useState(null);
  const [connected, setConnected]     = useState(false);
  const [showSetup, setShowSetup]     = useState(false);
  const [isWalking, setIsWalking]     = useState(false);
  const [direction, setDirection]     = useState('down');
  const [hoveredZone, setHoveredZone] = useState(null);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [clickAnim, setClickAnim]     = useState(null);
  const [isMobile, setIsMobile]       = useState(false);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

  /* ── Refs ── */
  const charRef        = useRef(null);
  const posRef         = useRef({ x: 49.5, y: 64.0 });
  const currentNodeRef = useRef('home_junc');
  const waypointsRef   = useRef([]);
  const lastTargetRef  = useRef(null);
  const rafRef         = useRef(null);
  const mapRef         = useRef(null);
  const viewportRef    = useRef(null);
  const configRef      = useRef(null);
  const cameraOffsetRef = useRef({ x: 0, y: 0 });
  const touchStateRef  = useRef({ startX: 0, startY: 0, camStartX: 0, camStartY: 0, isDragging: false });

  /* ── Base App / Frame SDK Initializer ── */
  useEffect(() => {
    const initFrame = async () => {
      try {
        await sdk.actions.ready();
      } catch (e) {
        // Fail gracefully when running outside Base App frame
      }
    };
    initFrame();
  }, []);

  /* ── Load config from JSON ── */
  useEffect(() => {
    fetch('/mapConfig.json')
      .then((r) => r.json())
      .then((cfg) => {
        configRef.current = cfg;
        setConfig(cfg);
        setAdjGraph(buildGraph(cfg.roadNodes, cfg.roadEdges));
        setRoadPaths(buildRoadSvgPaths(cfg.roadNodes, cfg.roadEdges));
        posRef.current = { x: cfg.character.startX, y: cfg.character.startY };
        currentNodeRef.current = cfg.character.startNode;
        applyPos(cfg.character.startX, cfg.character.startY);

        // Initial camera centering on dog near Doghouse at start
        setTimeout(() => updateCamera(cfg.character.startX, cfg.character.startY), 100);
        setTimeout(() => updateCamera(cfg.character.startX, cfg.character.startY), 350);
      })
      .catch(() => console.error('[VibeVerse] Failed to load mapConfig.json'));
  }, []);

  /* ── Restore player ── */
  useEffect(() => {
    const saved = localStorage.getItem('vv_player');
    if (saved) setPlayer(JSON.parse(saved));
  }, []);

  /* ── Mobile detection ── */
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      if (posRef.current) {
        updateCamera(posRef.current.x, posRef.current.y);
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Apply character DOM position ── */
  const applyPos = useCallback((x, y) => {
    if (charRef.current) {
      charRef.current.style.left = `${x}%`;
      charRef.current.style.top  = `${y}%`;
    }
  }, []);

  /* ── Camera Follow Character ── */
  const updateCamera = useCallback((cx, cy) => {
    if (!viewportRef.current || !mapRef.current) return;
    const vp = viewportRef.current.getBoundingClientRect();
    const mapRect = mapRef.current.getBoundingClientRect();

    const vpW = vp.width;
    const vpH = vp.height;

    // Map container dimensions (including 1.8x mobile scaling)
    const mapW = mapRef.current.offsetWidth || mapRect.width;
    const mapH = mapRef.current.offsetHeight || mapRect.height;

    if (!mapW || !mapH) return;

    // Character position in pixels relative to map top-left
    const charPxX = (cx / 100) * mapW;
    const charPxY = (cy / 100) * mapH;

    // Target camera translation to center character
    let targetOffsetX = vpW / 2 - charPxX;
    let targetOffsetY = vpH / 2 - charPxY;

    // Min & Max offsets to prevent scrolling off map edges
    const minOffsetX = vpW - mapW;
    const maxOffsetX = 0;
    const minOffsetY = vpH - mapH;
    const maxOffsetY = 0;

    if (mapW <= vpW) {
      targetOffsetX = (vpW - mapW) / 2;
    } else {
      targetOffsetX = Math.min(maxOffsetX, Math.max(minOffsetX, targetOffsetX));
    }

    if (mapH <= vpH) {
      targetOffsetY = (vpH - mapH) / 2;
    } else {
      targetOffsetY = Math.min(maxOffsetY, Math.max(minOffsetY, targetOffsetY));
    }

    if (mapRef.current) {
      mapRef.current.style.transform = `translate3d(${targetOffsetX}px, ${targetOffsetY}px, 0)`;
    }
    cameraOffsetRef.current = { x: targetOffsetX, y: targetOffsetY };
    setCameraOffset({ x: targetOffsetX, y: targetOffsetY });
  }, []);

  /* ── Animation frame loop ── */
  const animate = useCallback(() => {
    const waypoints = waypointsRef.current;
    if (!waypoints.length) {
      setIsWalking(false);
      return;
    }

    const target = waypoints[0];
    const cur = posRef.current;
    const dx = target.x - cur.x;
    const dy = target.y - cur.y;
    const d  = Math.hypot(dx, dy);

    if (Math.abs(dx) > Math.abs(dy)) {
      setDirection(dx > 0 ? 'right' : 'left');
    } else {
      setDirection(dy > 0 ? 'down' : 'up');
    }

    if (d < MOVE_SPEED) {
      posRef.current = { x: target.x, y: target.y };
      applyPos(target.x, target.y);
      updateCamera(target.x, target.y);
      currentNodeRef.current = target.id;
      waypointsRef.current.shift();

      if (!waypointsRef.current.length) {
        setIsWalking(false);
        const cfg = configRef.current;
        if (cfg) {
          const near = cfg.zones.find(
            (z) => Math.hypot(target.x - z.checkpointX, target.y - z.checkpointY) < 3.5
          );
          setActiveZone(near?.id ?? null);
        }
        return;
      }
    } else {
      const nx = cur.x + (dx / d) * MOVE_SPEED;
      const ny = cur.y + (dy / d) * MOVE_SPEED;
      posRef.current = { x: nx, y: ny };
      applyPos(nx, ny);
      updateCamera(nx, ny);
    }
    rafRef.current = requestAnimationFrame(animate);
  }, [applyPos, updateCamera]);

  /* ── Navigate to exact point or node ── */
  const navigateTo = useCallback((targetPoint, edge = null) => {
    const cfg = configRef.current;
    if (!cfg || !targetPoint) return;

    const cur = posRef.current;

    // Resolve target coordinates
    const targetCoords = typeof targetPoint === 'string'
      ? (cfg.roadNodes[targetPoint] ? { x: cfg.roadNodes[targetPoint].x, y: cfg.roadNodes[targetPoint].y } : null)
      : (targetPoint ? { x: targetPoint.x, y: targetPoint.y } : null);

    if (!targetCoords) return;

    // Duplicate click suppression: if already walking towards the same target area, ignore rapid duplicate clicks!
    if (isWalking && lastTargetRef.current) {
      const dTarget = Math.hypot(targetCoords.x - lastTargetRef.current.x, targetCoords.y - lastTargetRef.current.y);
      if (dTarget < 1.2) {
        return;
      }
    }

    lastTargetRef.current = targetCoords;

    const bestWaypoints = findOptimalRoadPath(
      cur,
      targetPoint,
      edge,
      cfg.roadNodes,
      cfg.roadEdges,
      adjGraph
    );

    if (!bestWaypoints.length) return;

    // Split any diagonal segments into orthogonal (90-degree) steps (Up/Down/Left/Right)
    const orthogonalWaypoints = [];
    let prev = cur;
    for (const pt of bestWaypoints) {
      const dx = Math.abs(pt.x - prev.x);
      const dy = Math.abs(pt.y - prev.y);

      if (dx > 0.1 && dy > 0.1) {
        // Orthogonal 90-deg step: move horizontal first, then vertical
        orthogonalWaypoints.push({ x: pt.x, y: prev.y, id: `${pt.id || 'step'}_ortho_h` });
        orthogonalWaypoints.push({ x: pt.x, y: pt.y, id: pt.id || 'step_ortho_v' });
      } else {
        orthogonalWaypoints.push(pt);
      }
      prev = pt;
    }

    waypointsRef.current = orthogonalWaypoints;
    setIsWalking(true);
    setActiveZone(null);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [adjGraph, animate, isWalking]);

  /* ── Convert client px → map % ── */
  const pixelToMapPct = useCallback((clientX, clientY) => {
    if (!mapRef.current) return null;
    const rect = mapRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  /* ── Handle map click / tap ── */
  const handleMapInteract = useCallback((clientX, clientY) => {
    if (openLocation || menuOpen || !configRef.current) return;
    const cfg = configRef.current;
    const pct = pixelToMapPct(clientX, clientY);
    if (!pct) return;
    
    // We increase threshold for better UX, road width is approx 4-5%
    const threshold = isMobile ? cfg.meta.snapThresholdMobile : cfg.meta.snapThreshold;
    
    const snapped = snapToNearestPointOnRoad(pct.x, pct.y, cfg.roadNodes, cfg.roadEdges, threshold);
    if (!snapped) return; // Clicked on grass/water

    // Show click ripple animation exactly where clicked
    setClickAnim({ x: pct.x, y: pct.y, id: Date.now() });
    setTimeout(() => setClickAnim(null), 600);

    // Route to the snapped point on the road spine
    navigateTo(snapped, snapped.edge);
  }, [openLocation, menuOpen, pixelToMapPct, isMobile, navigateTo]);

  const handleMouseMove = useCallback((e) => {
    if (!configRef.current || !mapRef.current) return;
    const cfg = configRef.current;
    const pct = pixelToMapPct(e.clientX, e.clientY);
    if (!pct) return;
    const threshold = isMobile ? cfg.meta.snapThresholdMobile : cfg.meta.snapThreshold;
    const snapped = snapToNearestPointOnRoad(pct.x, pct.y, cfg.roadNodes, cfg.roadEdges, threshold);
    if (snapped) {
      mapRef.current.style.cursor = 'pointer';
    } else {
      mapRef.current.style.cursor = 'not-allowed';
    }
  }, [pixelToMapPct, isMobile]);

  const handleMapClick = useCallback((e) => {
    handleMapInteract(e.clientX, e.clientY);
  }, [handleMapInteract]);

  const handleTouchStart = useCallback((e) => {
    if (openLocation || menuOpen || !e.touches[0]) return;
    const t = e.touches[0];
    touchStateRef.current = {
      startX: t.clientX,
      startY: t.clientY,
      camStartX: cameraOffsetRef.current.x,
      camStartY: cameraOffsetRef.current.y,
      isDragging: false,
    };
  }, [openLocation, menuOpen]);

  const handleTouchMove = useCallback((e) => {
    if (openLocation || menuOpen || !e.touches[0] || !viewportRef.current || !mapRef.current) return;
    const t = e.touches[0];
    const ts = touchStateRef.current;
    const dx = t.clientX - ts.startX;
    const dy = t.clientY - ts.startY;

    if (Math.hypot(dx, dy) > 8) {
      ts.isDragging = true;
    }

    if (ts.isDragging) {
      const vp = viewportRef.current.getBoundingClientRect();
      const mapRect = mapRef.current.getBoundingClientRect();
      const vpW = vp.width || window.innerWidth;
      const vpH = vp.height || window.innerHeight;
      const mapW = mapRef.current.offsetWidth || mapRect.width;
      const mapH = mapRef.current.offsetHeight || mapRect.height;

      let targetX = ts.camStartX + dx;
      let targetY = ts.camStartY + dy;

      const minX = vpW - mapW;
      const maxX = 0;
      const minY = vpH - mapH;
      const maxY = 0;

      if (mapW <= vpW) {
        targetX = (vpW - mapW) / 2;
      } else {
        targetX = Math.min(maxX, Math.max(minX, targetX));
      }

      if (mapH <= vpH) {
        targetY = (vpH - mapH) / 2;
      } else {
        targetY = Math.min(maxY, Math.max(minY, targetY));
      }

      mapRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      cameraOffsetRef.current = { x: targetX, y: targetY };
    }
  }, [openLocation, menuOpen]);

  const handleTouchEnd = useCallback((e) => {
    if (openLocation || menuOpen) return;
    const ts = touchStateRef.current;
    if (ts.isDragging) {
      setCameraOffset({ x: cameraOffsetRef.current.x, y: cameraOffsetRef.current.y });
      return; // Drag exploration active, do not walk dog
    }
    const t = e.changedTouches[0];
    if (t) handleMapInteract(t.clientX, t.clientY);
  }, [openLocation, menuOpen, handleMapInteract]);

  /* ── Zone badge / building click ── */
  const handleZoneEnter = useCallback((zoneId) => {
    if (openLocation) return;
    const cfg = configRef.current;
    if (!cfg) return;

    const zoneObj = cfg.zones.find((z) => z.id === zoneId);
    const cur = posRef.current;
    const distToCP = zoneObj ? Math.hypot(cur.x - zoneObj.checkpointX, cur.y - zoneObj.checkpointY) : 999;

    if ((activeZone === zoneId || distToCP < 3.5) && !isWalking) {
      setOpenLocation(zoneId);
      return;
    }
    const doorId = `${zoneId}_door`;
    if (cfg.roadNodes[doorId]) navigateTo(doorId);
  }, [openLocation, activeZone, isWalking, navigateTo]);

  /* ── E key enter ── */
  useEffect(() => {
    const fn = (e) => {
      if ((e.key === 'e' || e.key === 'E') && activeZone && !openLocation) {
        setOpenLocation(activeZone);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [activeZone, openLocation]);

  const { authenticated, user, login, logout } = usePrivy();

  /* ── Sync Privy authentication ── */
  useEffect(() => {
    if (authenticated) {
      setConnected(true);
      const saved = localStorage.getItem('vv_player');
      if (saved) {
        setPlayer(JSON.parse(saved));
      } else {
        const twitterName = user?.twitter?.username?.toLowerCase()?.replace(/[^a-z0-9_]/g, '');
        if (twitterName && twitterName.length >= 3) {
          const autoPlayer = { name: twitterName, xp: 0, level: 1, vibeBalance: '0' };
          localStorage.setItem('vv_player', JSON.stringify(autoPlayer));
          setPlayer(autoPlayer);
        } else {
          setShowSetup(true);
        }
      }
    } else {
      setConnected(false);
    }
  }, [authenticated, user]);

  /* ── Connect / Setup ── */
  const handleConnect = useCallback(() => {
    if (authenticated) {
      setOpenLocation('home');
    } else {
      login();
    }
  }, [authenticated, login]);

  const handleSetup = useCallback((data) => {
    const p = { ...data, xp: 0, level: 1, vibeBalance: '0' };
    localStorage.setItem('vv_player', JSON.stringify(p));
    setPlayer(p);
    setShowSetup(false);
  }, []);

  if (!config) {
    return (
      <div className="vv-root vv-loading">
        <div className="vv-loading__text">Loading Vibe Verse...</div>
      </div>
    );
  }

  const activeZoneObj = config.zones.find((z) => z.id === activeZone);
  const mapTransform  = isMobile
    ? `translate(${cameraOffset.x}px, ${cameraOffset.y}px)`
    : 'none';

  return (
    <div className="vv-root">

      {/* ─────────────────────────────────────────────
          TOP BAR
      ───────────────────────────────────────────── */}
      <div className="vv-topbar">
        <div className="vv-topbar__left">
          <button className="vv-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="vv-menu-btn__icon"><span /><span /><span /></div>
            <span className="vv-menu-btn__title">Vibe Verse</span>
          </button>

          {!isMobile && (
            <div className="vv-topbar__socials">
              <a
                href="https://vibehome.dog"
                target="_blank"
                rel="noopener noreferrer"
                className="vv-social-btn"
                title="Official Website (vibehome.dog)"
              >
                <span className="vv-social-btn__emoji">🌐</span>
              </a>
              <a
                href="https://x.com/vibeB20"
                target="_blank"
                rel="noopener noreferrer"
                className="vv-social-btn"
                title="Official X / Twitter (@vibeB20)"
              >
                <img src="/x-logo.jpg" alt="X" className="vv-social-btn__icon" />
              </a>
              <a
                href="https://launch.o1.exchange/token/0xb200000000000000000000df24ecb8bf51100a01?chain=8453"
                target="_blank"
                rel="noopener noreferrer"
                className="vv-social-btn"
                title="o1 Exchange Launchpad"
              >
                <img src="/o1-logo.png" alt="o1" className="vv-social-btn__icon" />
              </a>
              <a
                href="https://dexscreener.com/base/0xa1a4159e61ac9fc48aa9e9992c8d4870ef8a496d5749af1d219e8002f74835c5"
                target="_blank"
                rel="noopener noreferrer"
                className="vv-social-btn"
                title="DexScreener Chart"
              >
                <img src="/dexscreener-logo.jpg" alt="DEX" className="vv-social-btn__icon" />
              </a>
            </div>
          )}
        </div>
        <div className="vv-topbar__right">
          {!isMobile && (
            <span className="vv-topbar__season">
              EPOCH 1: GENESIS
            </span>
          )}
          <button
            className="vv-btn-mint-nav"
            onClick={() => setOpenLocation('nft_mint')}
          >
            MINT NFT
          </button>
          <button
            className={`vv-btn-connect ${connected ? 'connected' : ''}`}
            onClick={handleConnect}
          >
            {connected ? (player ? `${player.name}.vibe` : 'Connected') : 'Connect Wallet'}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          HAMBURGER MENU
      ───────────────────────────────────────────── */}
      {menuOpen && (
        <div className="vv-neura-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="vv-neura-menu-card" onClick={(e) => e.stopPropagation()}>
            <div className="vv-neura-menu-header">
              <h2>VIBE VERSE</h2>
              <button className="vv-neura-menu-close" onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            <div className="vv-neura-menu-list">
              <button className="vv-neura-menu-item active" onClick={() => setMenuOpen(false)}>
                <span className="vv-menu-item-icon">🗺️</span>
                <span className="vv-menu-item-text">WORLD MAP</span>
              </button>
              {config.zones.map((z) => (
                <button
                  key={z.id}
                  className="vv-neura-menu-item"
                  onClick={() => { setMenuOpen(false); setOpenLocation(z.id); }}
                >
                  <span className="vv-menu-item-icon">{z.icon}</span>
                  <span className="vv-menu-item-text">{z.label}</span>
                </button>
              ))}

              <div style={{ margin: '14px 0 6px 0', borderTop: '1px solid rgba(0, 245, 255, 0.2)', paddingTop: '12px', fontSize: '9px', color: '#88aacc', fontWeight: 900 }}>
                QUICK LINKS
              </div>
              <a
                href="https://vibehome.dog"
                target="_blank"
                rel="noopener noreferrer"
                className="vv-neura-menu-item"
                style={{ textDecoration: 'none' }}
              >
                <span className="vv-menu-item-icon">🌐</span>
                <span className="vv-menu-item-text">WEBSITE (VIBEHOME.DOG)</span>
              </a>
              <a
                href="https://x.com/vibeB20"
                target="_blank"
                rel="noopener noreferrer"
                className="vv-neura-menu-item"
                style={{ textDecoration: 'none' }}
              >
                <span className="vv-menu-item-icon">𝕏</span>
                <span className="vv-menu-item-text">OFFICIAL X / TWITTER</span>
              </a>
              <a
                href="https://launch.o1.exchange/token/0xb200000000000000000000df24ecb8bf51100a01?chain=8453"
                target="_blank"
                rel="noopener noreferrer"
                className="vv-neura-menu-item"
                style={{ textDecoration: 'none' }}
              >
                <span className="vv-menu-item-icon">🦅</span>
                <span className="vv-menu-item-text">O1 EXCHANGE</span>
              </a>
              <a
                href="https://dexscreener.com/base/0xa1a4159e61ac9fc48aa9e9992c8d4870ef8a496d5749af1d219e8002f74835c5"
                target="_blank"
                rel="noopener noreferrer"
                className="vv-neura-menu-item"
                style={{ textDecoration: 'none' }}
              >
                <span className="vv-menu-item-icon">📊</span>
                <span className="vv-menu-item-text">DEXSCREENER CHART</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          MAP VIEWPORT
      ───────────────────────────────────────────── */}
      <div
        ref={viewportRef}
        className={`vv-map-viewport ${isMobile ? 'mobile' : 'desktop'}`}
      >
        <div
          ref={mapRef}
          className={`vv-map-wrap ${isMobile ? 'mobile' : 'desktop'}`}
          style={{
            transform: mapTransform,
            transition: isWalking ? 'none' : 'transform 0.3s ease-out',
          }}
          onClick={handleMapClick}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >

          {/* ══ LAYER 0 — Static Map Background (verse-map.jpg) ══ */}
          <div className="vv-layer vv-layer-bg">
            <img
              className="vv-map-img"
              src="/map-bg.jpg?v=static_verse_map"
              alt="Vibe Verse Map Background"
              draggable={false}
            />
          </div>

          {/* ══ LAYER 1 — Road Graph SVG Overlay (Hidden for production view) ══ */}

          {/* ══ LAYER 2 — Building Objects (Renders only if custom buildingSprite set) ══ */}
          <div className="vv-layer vv-layer-objects">
            {config.zones.map((zone) => (
              <BuildingObject
                key={zone.id}
                zone={zone}
                isActive={activeZone === zone.id}
                isHovered={hoveredZone === zone.id}
                onHoverChange={setHoveredZone}
                onEnter={handleZoneEnter}
              />
            ))}
          </div>

          {/* ══ LAYER 3 — Character ══ */}
          <div className="vv-layer vv-layer-character">
            <div
              ref={charRef}
              className={`vv-character ${isWalking ? 'walking' : ''}`}
              style={{ left: `${posRef.current.x}%`, top: `${posRef.current.y}%` }}
            >
              <div className="vv-character-sprite">
                <DogSprite walking={isWalking} direction={direction} />
              </div>
              {player && (
                <div className="vv-character__tag">
                  👑 {player.name}.vibe
                </div>
              )}
              <div className="vv-character__shadow" />
            </div>
          </div>

          {/* ══ LAYER 4 — Click Animation ══ */}
          {clickAnim && (
            <div
              key={clickAnim.id}
              className="vv-click-ripple"
              style={{ left: `${clickAnim.x}%`, top: `${clickAnim.y}%` }}
            />
          )}

          {/* ══ LAYER 5 — UI: Badges, Checkpoints, Enter prompt ══ */}
          <div className="vv-layer vv-layer-ui">
            {config.zones.map((zone) => (
              <ZoneBadge
                key={zone.id}
                zone={zone}
                isActive={activeZone === zone.id}
                isHovered={hoveredZone === zone.id}
                onEnter={handleZoneEnter}
                onHoverChange={setHoveredZone}
              />
            ))}

            {/* Enter prompt */}
            {activeZoneObj && !openLocation && !isWalking && (
              <div
                className="vv-enter-prompt"
                style={{
                  left: `${activeZoneObj.badgeX ?? activeZoneObj.checkpointX}%`,
                  top:  `calc(${activeZoneObj.badgeY ?? activeZoneObj.checkpointY}% - 75px)`,
                }}
              >
                <div
                  className="vv-enter-prompt__bubble"
                  onClick={() => setOpenLocation(activeZoneObj.id)}
                  onTouchEnd={() => setOpenLocation(activeZoneObj.id)}
                >
                  <div className="vv-enter-prompt__key">E</div>
                  <span className="vv-enter-prompt__text">Enter&nbsp;</span>
                  <span className="vv-enter-prompt__zone-name">{activeZoneObj.label}</span>
                </div>
                <div className="vv-enter-prompt__tail" />
              </div>
            )}

            {/* Vignette */}
            <div className="vv-map-vignette" />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          OVERLAYS
      ───────────────────────────────────────────── */}
      {openLocation && (
        <LocationOverlay
          zone={openLocation}
          zones={config.zones}
          player={player}
          onClose={() => setOpenLocation(null)}
          onNavigate={(targetZone) => setOpenLocation(targetZone)}
          onUpdatePlayer={(updatedPlayer) => {
            setPlayer(updatedPlayer);
            localStorage.setItem('vv_player', JSON.stringify(updatedPlayer));
          }}
        />
      )}
      {showSetup && <CharacterSetup onComplete={handleSetup} />}
    </div>
  );
}
