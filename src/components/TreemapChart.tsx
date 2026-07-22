import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { FolderEntry, FsEntry } from '../types';
import { formatBytes } from '../utils/formatUtils';

interface TreemapRect {
  name: string;
  path: string;
  size: number;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  isFolder: boolean;
  fileCount: number;
  entry: FsEntry;
}

interface TreemapChartProps {
  root: FolderEntry;
  onFolderSelect: (entry: FolderEntry) => void;
  currentFolder?: FolderEntry;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getColor(index: number, depth: number): string {
  const hue = (index * 137.508 + depth * 30) % 360;
  const sat = 55 + depth * 8;
  const lit = 58 - depth * 9;
  return `hsl(${hue}, ${Math.min(sat, 80)}%, ${Math.max(lit, 28)}%)`;
}

function worstRatio(rowSizes: number[], side: number): number {
  if (rowSizes.length === 0) return Infinity;
  const sum = rowSizes.reduce((a, b) => a + b, 0);
  if (sum === 0 || side === 0) return Infinity;
  const max = Math.max(...rowSizes);
  const min = Math.min(...rowSizes);
  const s2 = side * side;
  return Math.max(
    (s2 * max) / (sum * sum),
    (sum * sum) / (s2 * min)
  );
}

function squarifyLayout(
  entries: TreemapRect[],
  totalSize: number,
  x: number,
  y: number,
  w: number,
  h: number
): TreemapRect[] {
  if (entries.length === 0 || totalSize === 0) return [];

  const sorted = [...entries].sort((a, b) => b.size - a.size);
  const result: TreemapRect[] = [];
  let cx = x, cy = y, cw = w, ch = h;

  let i = 0;
  while (i < sorted.length) {
    const row: TreemapRect[] = [];
    let rowSum = 0;
    const remainingTotal = sorted.slice(i).reduce((s, e) => s + e.size, 0);
    if (remainingTotal === 0) break;

    while (i < sorted.length) {
      const item = sorted[i];
      const side = Math.min(cw, ch);
      const ratioWithout = worstRatio(row.map(r => r.size), side);
      const ratioWith = worstRatio([...row.map(r => r.size), item.size], side);

      if (row.length > 0 && ratioWith > ratioWithout) break;

      row.push(item);
      rowSum += item.size;
      i++;
    }

    if (cw >= ch) {
      const rowH = ch * (rowSum / (rowSum + sorted.slice(i).reduce((s, e) => s + e.size, 0) || 1));
      const clampedRowH = Math.max(rowH, 8);
      let rowX = cx;
      for (const item of row) {
        const itemW = cw * (item.size / (rowSum || 1));
        const clampedW = Math.max(itemW, 2);
        result.push({ ...item, x: rowX, y: cy, width: clampedW, height: Math.max(clampedRowH, 2) });
        rowX += itemW;
      }
      cy += clampedRowH;
      ch = Math.max(ch - clampedRowH, 0);
    } else {
      const rowW = cw * (rowSum / (rowSum + sorted.slice(i).reduce((s, e) => s + e.size, 0) || 1));
      const clampedRowW = Math.max(rowW, 8);
      let rowY = cy;
      for (const item of row) {
        const itemH = ch * (item.size / (rowSum || 1));
        const clampedH = Math.max(itemH, 2);
        result.push({ ...item, x: cx, y: rowY, width: Math.max(clampedRowW, 2), height: clampedH });
        rowY += itemH;
      }
      cx += clampedRowW;
      cw = Math.max(cw - clampedRowW, 0);
    }
  }

  return result;
}

type SortMode = 'size' | 'name' | 'count';

export function TreemapChart({ root, onFolderSelect, currentFolder }: TreemapChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [hovered, setHovered] = useState<TreemapRect | null>(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });
  const [sortMode, setSortMode] = useState<SortMode>('size');
  const folder = currentFolder || root;

  const items = useMemo(() => {
    if (!folder.children) return [];
    return folder.children
      .filter((c) => c.size > 0)
      .sort((a, b) => {
        if (sortMode === 'name') return a.name.localeCompare(b.name);
        if (sortMode === 'count') {
          const aCount = a.kind === 'folder' ? a.fileCount : 0;
          const bCount = b.kind === 'folder' ? b.fileCount : 0;
          return bCount - aCount;
        }
        return b.size - a.size;
      })
      .map((entry) => ({
        name: entry.name,
        path: entry.path,
        size: entry.size,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        depth: 1,
        color: entry.kind === 'folder'
          ? getColor(hashString(entry.name), 0)
          : getColor(hashString(entry.path.split('.').pop() || 'file'), 2),
        isFolder: entry.kind === 'folder',
        fileCount: entry.kind === 'folder' ? entry.fileCount : 0,
        entry,
      }));
  }, [folder, sortMode]);

  const layout = useMemo(() => {
    const total = items.reduce((s, i) => s + i.size, 0);
    const padding = 4;
    const w = Math.max(dimensions.width - padding * 2, 100);
    const h = Math.max(dimensions.height - padding * 2, 100);
    const raw = squarifyLayout(items, total, padding, padding, w, h);

    return raw.map((r) => ({
      ...r,
      color: getColor(
        hashString(r.name),
        r.isFolder ? 1 : 2
      ),
    }));
  }, [items, dimensions]);

  const [displayLayout, setDisplayLayout] = useState(layout);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayLayout(layout);
    }, 50);
    return () => clearTimeout(timer);
  }, [layout]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.floor(width), height: Math.floor(height) });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent, rect: TreemapRect) => {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (bounds) {
      setTooltip({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    }
    setHovered(rect);
  }, []);

  const handleClick = useCallback((rect: TreemapRect) => {
    if (rect.isFolder) {
      onFolderSelect(rect.entry as FolderEntry);
    }
  }, [onFolderSelect]);

  const totalSize = folder.children.reduce((s, c) => s + c.size, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          {folder.name} — {formatBytes(totalSize)} across {folder.children.length} items
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['size', 'name', 'count'] as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              style={{
                padding: '4px 10px',
                border: `1px solid ${sortMode === mode ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-sm)',
                background: sortMode === mode ? 'var(--color-primary-light)' : 'var(--color-surface)',
                color: sortMode === mode ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all var(--transition-fast)',
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: '400px',
          background: 'var(--color-surface)',
          border: `1px solid var(--color-border)`,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          style={{ display: 'block' }}
        >
          <defs>
            <filter id="treemap-shadow">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.15" />
            </filter>
          </defs>
          {displayLayout.map((rect) => {
            const isHovered = hovered?.path === rect.path;
            const showLabel = rect.width > 40 && rect.height > 20;
            const showSubLabel = rect.width > 60 && rect.height > 35;
            const labelSize = Math.min(
              Math.max(Math.min(rect.width / rect.name.length * 1.2, rect.height * 0.3), 8),
              14
            );
            return (
              <g
                key={rect.path}
                onClick={() => handleClick(rect)}
                onMouseMove={(e) => handleMouseMove(e, rect)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: rect.isFolder ? 'pointer' : 'default' }}
              >
                <rect
                  x={rect.x}
                  y={rect.y}
                  width={Math.max(rect.width - 1, 1)}
                  height={Math.max(rect.height - 1, 1)}
                  rx={3}
                  ry={3}
                  fill={rect.color}
                  fillOpacity={isHovered ? 0.85 : 0.7}
                  stroke={isHovered ? 'var(--color-text)' : 'var(--color-surface)'}
                  strokeWidth={isHovered ? 2 : 1}
                  filter={isHovered ? 'url(#treemap-shadow)' : undefined}
                  style={{
                    transition: 'all var(--transition-normal)',
                    transformOrigin: `${rect.x + rect.width / 2}px ${rect.y + rect.height / 2}px`,
                  }}
                />
                {rect.isFolder && rect.width > 16 && rect.height > 16 && (
                  <g
                    transform={`translate(${rect.x + 4}, ${rect.y + 4})`}
                    opacity={0.5}
                  >
                    <path
                      d="M0 0h8l2 2h6v2"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}
                {showLabel && (
                  <text
                    x={rect.x + 6}
                    y={rect.y + (showSubLabel ? 16 : 12)}
                    fill="white"
                    fontSize={labelSize}
                    fontWeight={600}
                    style={{
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      pointerEvents: 'none',
                    }}
                  >
                    {rect.name.length * (labelSize * 0.6) > rect.width - 12
                      ? rect.name.slice(0, Math.floor((rect.width - 12) / (labelSize * 0.6))) + '…'
                      : rect.name}
                  </text>
                )}
                {showSubLabel && (
                  <text
                    x={rect.x + 6}
                    y={rect.y + rect.height - 6}
                    fill="white"
                    fontSize={Math.max(labelSize - 2, 9)}
                    fontWeight={500}
                    opacity={0.85}
                    style={{
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      pointerEvents: 'none',
                    }}
                  >
                    {formatBytes(rect.size)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(tooltip.x + 12, dimensions.width - 200)}px`,
              top: `${Math.max(tooltip.y - 80, 0)}px`,
              background: 'var(--color-surface)',
              border: `1px solid var(--color-border)`,
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
              pointerEvents: 'none',
              animation: 'scaleIn 0.15s ease forwards',
              minWidth: '160px',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '4px' }}>
              {hovered.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              <div>Size: {formatBytes(hovered.size)}</div>
              <div>Share: {totalSize > 0 ? ((hovered.size / totalSize) * 100).toFixed(1) : '0'}%</div>
              {hovered.isFolder && <div>Items: {hovered.fileCount}</div>}
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem', marginTop: '2px' }}>
                {hovered.isFolder ? 'Click to drill down' : 'File'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
