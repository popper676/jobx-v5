import { describe, expect, it } from 'vitest';
import { formatResumeFileSize, isTextResume, MAX_RESUME_FILE_SIZE, readResumeText, validateResumeFile } from './resumeUploadService';

describe('resumeUploadService', () => {
  it('accepts supported resume formats within the size limit', () => {
    expect(validateResumeFile({ name: 'candidate-resume.pdf', size: 250_000 })).toBeUndefined();
    expect(validateResumeFile({ name: 'candidate-resume.docx', size: MAX_RESUME_FILE_SIZE })).toBeUndefined();
    expect(isTextResume({ name: 'resume.txt', size: 100, type: 'text/plain' })).toBe(true);
  });

  it('rejects unsupported, empty, and oversized files', () => {
    expect(validateResumeFile({ name: 'resume.png', size: 100 })).toContain('PDF');
    expect(validateResumeFile({ name: 'resume.pdf', size: 0 })).toContain('empty');
    expect(validateResumeFile({ name: 'resume.pdf', size: MAX_RESUME_FILE_SIZE + 1 })).toContain('5 MB');
  });

  it('formats selected file sizes for upload feedback', () => {
    expect(formatResumeFileSize(800)).toBe('800 B');
    expect(formatResumeFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
  });

  it('imports plain-text resume content for Copilot review', async () => {
    const file = {
      name: 'resume.txt',
      size: 48,
      type: 'text/plain',
      text: async () => '  Built accessible products for 10,000 users.  ',
    } as File;

    expect(await readResumeText(file)).toBe('Built accessible products for 10,000 users.');
  });
});
