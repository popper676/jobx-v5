import { describe, expect, it } from 'vitest';
import { analyzeResume, createAchievementTemplate } from './resumeIntelligenceService';

describe('resumeIntelligenceService', () => {
  it('identifies missing resume evidence without inventing achievements', () => {
    const analysis = analyzeResume(
      { name: 'Avery Lee', title: 'Frontend Engineer', email: 'avery@example.com', phone: '' },
      [{ id: 1, company: 'Orbit', role: 'Frontend Engineer', description: 'Built reusable React components.' }],
    );

    expect(analysis.suggestions.some((suggestion) => suggestion.id === 'impact')).toBe(true);
    expect(analysis.actionVerbCount).toBe(1);
  });

  it('creates a structured template that asks the user for a truthful outcome', () => {
    expect(createAchievementTemplate('Built reusable components.', 'Frontend Engineer')).toContain('[truthful measurable outcome]');
  });

  it('keeps empty-draft guidance concise and non-duplicative', () => {
    const analysis = analyzeResume(
      { name: '', title: '', email: '', phone: '' },
      [{ id: 1, company: '', role: '', description: '' }],
    );

    expect(new Set(analysis.suggestions.map((suggestion) => suggestion.id)).size).toBe(analysis.suggestions.length);
  });
});
