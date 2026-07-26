export const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_RESUME_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'txt']);

export interface ResumeFileDescriptor {
  name: string;
  size: number;
  type?: string;
}

function getExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

export function validateResumeFile(file: ResumeFileDescriptor): string | undefined {
  if (!ALLOWED_RESUME_EXTENSIONS.has(getExtension(file.name))) {
    return 'Upload a PDF, DOC, DOCX, or TXT resume.';
  }
  if (file.size <= 0) return 'The selected resume is empty.';
  if (file.size > MAX_RESUME_FILE_SIZE) return 'Resume files must be 5 MB or smaller.';
  return undefined;
}

export function isTextResume(file: ResumeFileDescriptor): boolean {
  return file.type === 'text/plain' || getExtension(file.name) === 'txt';
}

export async function readResumeText(file: File): Promise<string> {
  if (!isTextResume(file)) return '';
  return (await file.text()).trim().slice(0, 20_000);
}

export function formatResumeFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
