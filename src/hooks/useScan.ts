import { useState, useCallback } from 'react';
import { scanFolder } from '../services/scanService';
import type { ScanResult, ScanProgress } from '../types';

export function useScan() {
  const [path, setPath] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [results, setResults] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('folderscope-recent') || '[]');
    } catch {
      return [];
    }
  });

  const startScan = useCallback(async (scanPath: string) => {
    setScanning(true);
    setError(null);
    setResults(null);
    setProgress({ currentPath: '', filesFound: 0, foldersFound: 0, percent: 0 });

    try {
      const result = await scanFolder(scanPath, (p) => setProgress(p));
      setResults(result);
      setPath(scanPath);
      setRecentScans((prev) => {
        const updated = [scanPath, ...prev.filter((p) => p !== scanPath)].slice(0, 10);
        localStorage.setItem('folderscope-recent', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setScanning(false);
      setProgress(null);
    }
  }, []);

  const reset = useCallback(() => {
    setPath('');
    setScanning(false);
    setProgress(null);
    setResults(null);
    setError(null);
  }, []);

  return { path, scanning, progress, results, error, recentScans, startScan, reset };
}
