import { useState, useMemo, useCallback } from 'react';
import { TreemapChart } from '../components/TreemapChart';
import { FileList } from '../components/FileList';
import { FolderList } from '../components/FolderList';
import { SearchBar } from '../components/SearchBar';
import { Breadcrumb } from '../components/Breadcrumb';
import { formatBytes } from '../utils/formatUtils';
import type { ScanResult, FolderEntry, FileEntry } from '../types';

interface ResultsPageProps {
  results: ScanResult;
}

type Tab = 'treemap' | 'files' | 'folders';

function flattenFiles(folder: FolderEntry): FileEntry[] {
  const files: FileEntry[] = [];
  for (const child of folder.children) {
    if (child.kind === 'file') {
      files.push(child);
    } else {
      files.push(...flattenFiles(child));
    }
  }
  return files;
}

function flattenFolders(folder: FolderEntry): FolderEntry[] {
  const folders: FolderEntry[] = [folder];
  for (const child of folder.children) {
    if (child.kind === 'folder') {
      folders.push(...flattenFolders(child));
    }
  }
  return folders;
}

function findFolder(root: FolderEntry, pathSegments: string[]): FolderEntry {
  let current = root;
  for (const segment of pathSegments) {
    const next = current.children.find(
      (c): c is FolderEntry => c.kind === 'folder' && c.name === segment
    );
    if (!next) break;
    current = next;
  }
  return current;
}

export function ResultsPage({ results }: ResultsPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('treemap');
  const [searchQuery, setSearchQuery] = useState('');
  const [drillPath, setDrillPath] = useState<string[]>([]);

  const currentFolder = useMemo(() => {
    if (drillPath.length === 0) return results.root;
    return findFolder(results.root, drillPath);
  }, [results.root, drillPath]);

  const allFiles = useMemo(() => flattenFiles(results.root), [results.root]);
  const allFolders = useMemo(() => flattenFolders(results.root).slice(1), [results.root]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return allFiles;
    const q = searchQuery.toLowerCase();
    return allFiles.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.path.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q)
    );
  }, [allFiles, searchQuery]);

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return allFolders;
    const q = searchQuery.toLowerCase();
    return allFolders.filter(
      (f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)
    );
  }, [allFolders, searchQuery]);

  const handleFolderSelect = useCallback((entry: FolderEntry) => {
    const relativePath = entry.path.replace(results.root.path, '').replace(/^\//, '');
    const segments = relativePath.split('/').filter(Boolean);
    setDrillPath(segments);
    setActiveTab('treemap');
  }, [results.root.path]);

  const handleBreadcrumbNavigate = useCallback((index: number) => {
    if (index < 0) {
      setDrillPath([]);
    } else {
      setDrillPath((prev) => prev.slice(0, index + 1));
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query) setActiveTab('files');
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'treemap', label: 'Treemap' },
    { key: 'files', label: `Files (${allFiles.length})` },
    { key: 'folders', label: `Folders (${allFolders.length})` },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        animation: 'fadeIn 0.3s ease forwards',
      }}
    >
      <div
        style={{
          padding: '20px 24px',
          borderBottom: `1px solid var(--color-border)`,
          background: 'var(--color-surface)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
              Scan Results
            </h2>
            <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <span>
                <strong style={{ color: 'var(--color-text)' }}>{formatBytes(results.totalSize)}</strong> total
              </span>
              <span>
                <strong style={{ color: 'var(--color-text)' }}>{results.totalFiles.toLocaleString()}</strong> files
              </span>
              <span>
                <strong style={{ color: 'var(--color-text)' }}>{results.totalFolders.toLocaleString()}</strong> folders
              </span>
              <span>
                in <strong style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>{results.rootPath}</strong>
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Breadcrumb path={drillPath} onNavigate={handleBreadcrumbNavigate} />
          <div style={{ flex: 1 }} />
          <div style={{ maxWidth: '280px', width: '100%' }}>
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0', borderBottom: `1px solid var(--color-border)`, padding: '0 24px', background: 'var(--color-surface)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.key ? 'var(--color-primary)' : 'transparent'}`,
              background: 'transparent',
              color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab.key ? 600 : 400,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {activeTab === 'treemap' && (
          <div style={{ height: '100%', minHeight: '500px', animation: 'fadeIn 0.3s ease forwards' }}>
            <TreemapChart
              root={results.root}
              onFolderSelect={handleFolderSelect}
              currentFolder={currentFolder}
            />
          </div>
        )}

        {activeTab === 'files' && (
          <div style={{ animation: 'fadeIn 0.3s ease forwards' }}>
            <div style={{ marginBottom: '12px' }}>
              {searchQuery && (
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Found {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
                  {searchQuery ? ` matching "${searchQuery}"` : ''}
                </span>
              )}
            </div>
            <div
              style={{
                background: 'var(--color-surface)',
                border: `1px solid var(--color-border)`,
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}
            >
              <FileList files={filteredFiles} />
            </div>
          </div>
        )}

        {activeTab === 'folders' && (
          <div style={{ animation: 'fadeIn 0.3s ease forwards' }}>
            <div style={{ marginBottom: '12px' }}>
              {searchQuery && (
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Found {filteredFolders.length} folder{filteredFolders.length !== 1 ? 's' : ''}
                  {searchQuery ? ` matching "${searchQuery}"` : ''}
                </span>
              )}
            </div>
            <FolderList folders={filteredFolders} onSelect={handleFolderSelect} />
          </div>
        )}
      </div>
    </div>
  );
}
