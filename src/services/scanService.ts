import type { FileEntry, FolderEntry, ScanResult, ScanProgress } from '../types';

function rand(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - rand(0, daysAgo));
  return d.toISOString();
}

const FILE_CATEGORIES: Record<string, Record<string, { size: [number, number]; count: [number, number] }>> = {
  Documents: {
    '.pdf': { size: [0.1, 8], count: [3, 12] },
    '.docx': { size: [0.02, 1.5], count: [2, 8] },
    '.xlsx': { size: [0.01, 0.8], count: [1, 5] },
    '.txt': { size: [0.001, 0.05], count: [5, 15] },
    '.md': { size: [0.001, 0.02], count: [2, 8] },
  },
  Downloads: {
    '.zip': { size: [5, 200], count: [2, 6] },
    '.exe': { size: [1, 60], count: [2, 8] },
    '.dmg': { size: [0.5, 4], count: [1, 3] },
    '.pdf': { size: [0.5, 10], count: [2, 8] },
    '.torrent': { size: [0.01, 0.1], count: [1, 4] },
  },
  Pictures: {
    '.jpg': { size: [2, 8], count: [15, 80] },
    '.png': { size: [1, 5], count: [10, 40] },
    '.gif': { size: [0.5, 3], count: [2, 8] },
    '.heic': { size: [3, 7], count: [1, 10] },
  },
  Videos: {
    '.mp4': { size: [50, 800], count: [2, 8] },
    '.mkv': { size: [200, 1500], count: [1, 4] },
    '.mov': { size: [100, 500], count: [1, 3] },
    '.avi': { size: [200, 700], count: [1, 2] },
  },
  Music: {
    '.mp3': { size: [3, 12], count: [20, 80] },
    '.flac': { size: [15, 40], count: [5, 15] },
    '.wav': { size: [30, 60], count: [1, 4] },
    '.aac': { size: [2, 8], count: [3, 12] },
  },
  Projects: {
    '.ts': { size: [0.001, 0.1], count: [10, 40] },
    '.tsx': { size: [0.001, 0.05], count: [5, 20] },
    '.js': { size: [0.001, 0.1], count: [5, 15] },
    '.json': { size: [0.001, 0.5], count: [3, 10] },
    '.css': { size: [0.001, 0.03], count: [2, 8] },
    '.html': { size: [0.001, 0.02], count: [1, 5] },
  },
  Desktop: {
    '.txt': { size: [0.001, 0.01], count: [1, 5] },
    '.lnk': { size: [0.001, 0.001], count: [2, 8] },
    '.png': { size: [0.5, 3], count: [1, 5] },
  },
};

function generateFiles(
  category: string,
  parentPath: string,
  depth: number
): FileEntry[] {
  const configs = FILE_CATEGORIES[category];
  if (!configs || depth > 3) return [];

  const files: FileEntry[] = [];

  for (const [ext, cfg] of Object.entries(configs)) {
    const count = rand(cfg.count[0], cfg.count[1]);
    for (let i = 0; i < count; i++) {
      const name = `${category}${i > 0 ? `_${i}` : ''}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`;
      const sizeMB = rand(cfg.size[0], cfg.size[1]);
      files.push({
        kind: 'file',
        name,
        path: `${parentPath}/${name}`,
        size: sizeMB * 1024 * 1024,
        type: ext.slice(1),
        modified: randomDate(90),
      });
    }
  }

  return files;
}

const SUBFOLDER_NAMES = [
  ['Work', 'Personal', 'Archive', 'Backup', 'Old'],
  ['Subfolder', 'Data', 'Export', 'Temp', 'Misc'],
  ['Module', 'Core', 'Config', 'Assets', 'Output'],
  ['Photos', 'Screenshots', 'Edits', 'Raw', 'Albums'],
  ['Music', 'Podcasts', 'Recordings', 'Playlists'],
  ['Web', 'Mobile', 'Desktop', 'CLI', 'Lib'],
  ['Current', '2023', '2024', '2025', 'Drafts'],
];

function generateSubfolders(
  category: string,
  parentPath: string,
  depth: number
): FolderEntry[] {
  if (depth >= 3) return [];
  const folders: FolderEntry[] = [];
  const names = SUBFOLDER_NAMES[(depth + category.length) % SUBFOLDER_NAMES.length];
  const count = rand(1, 4);

  for (let i = 0; i < count; i++) {
    const name = names[i % names.length];
    const folderPath = `${parentPath}/${name}`;
    const subFiles = generateFiles(category, folderPath, depth + 1);
    const subFolders = generateSubfolders(category, folderPath, depth + 1);
    const allChildren = [...subFiles, ...subFolders];
    const totalSize = allChildren.reduce((s, c) => s + c.size, 0);

    folders.push({
      kind: 'folder',
      name,
      path: folderPath,
      size: totalSize,
      fileCount: subFiles.length,
      children: allChildren,
    });
  }

  return folders;
}

const ROOT_FOLDERS = [
  { name: 'Documents', weight: 0.12 },
  { name: 'Downloads', weight: 0.25 },
  { name: 'Pictures', weight: 0.08 },
  { name: 'Videos', weight: 0.30 },
  { name: 'Music', weight: 0.05 },
  { name: 'Projects', weight: 0.15 },
  { name: 'Desktop', weight: 0.05 },
];

export function scanFolder(
  path: string,
  onProgress?: (p: ScanProgress) => void
): Promise<ScanResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let totalSize = 0;

    const children: (FileEntry | FolderEntry)[] = [];
    let scanned = 0;
    const total = ROOT_FOLDERS.length;

    const processNext = (index: number) => {
      if (index >= ROOT_FOLDERS.length) {
        const childrenTotal = children.reduce((s, c) => s + c.size, 0);
        const root: FolderEntry = {
          kind: 'folder',
          name: path.split('/').pop() || path.split('\\').pop() || 'root',
          path,
          size: childrenTotal,
          fileCount: children.filter(c => c.kind === 'file').length,
          children,
        };

        onProgress?.({
          currentPath: '',
          filesFound: root.fileCount,
          foldersFound: children.filter(c => c.kind === 'folder').length,
          percent: 100,
        });

        resolve({
          rootPath: path,
          root,
          totalSize: childrenTotal,
          totalFiles: root.fileCount,
          totalFolders: children.filter(c => c.kind === 'folder').length,
          scanDuration: Date.now() - startTime,
        });
        return;
      }

      const folder = ROOT_FOLDERS[index];
      const delay = rand(80, 300);

      setTimeout(() => {
        const folderPath = `${path}/${folder.name}`;
        onProgress?.({
          currentPath: folderPath,
          filesFound: Math.round((scanned / total) * 500),
          foldersFound: scanned,
          percent: Math.round((scanned / total) * 100),
        });

        const files = generateFiles(folder.name, folderPath, 1);
        const subfolders = generateSubfolders(folder.name, folderPath, 1);
        const allChildren = [...files, ...subfolders];
        const folderSize = allChildren.reduce((s, c) => s + c.size, 0);

        children.push({
          kind: 'folder',
          name: folder.name,
          path: folderPath,
          size: folderSize,
          fileCount: files.length,
          children: allChildren,
        });

        scanned++;
        totalSize += folderSize;
        processNext(index + 1);
      }, delay);
    };

    processNext(0);
  });
}
