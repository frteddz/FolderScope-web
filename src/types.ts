export interface FsEntry {
  name: string;
  path: string;
  size: number;
}

export interface FileEntry extends FsEntry {
  kind: 'file';
  type: string;
  modified: string;
}

export interface FolderEntry extends FsEntry {
  kind: 'folder';
  fileCount: number;
  children: (FileEntry | FolderEntry)[];
}

export interface ScanResult {
  rootPath: string;
  root: FolderEntry;
  totalSize: number;
  totalFiles: number;
  totalFolders: number;
  scanDuration: number;
}

export interface ScanProgress {
  currentPath: string;
  filesFound: number;
  foldersFound: number;
  percent: number;
}
