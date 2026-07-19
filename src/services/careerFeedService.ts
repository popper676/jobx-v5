import type { Post } from './postService';
import type { User } from './userService';

export interface PersonalizedFeedItem {
  post: Post;
  score: number;
  reason: string;
  matchedTopics: string[];
}

const ROLE_STOP_WORDS = new Set([
  'and', 'at', 'for', 'from', 'the', 'with', 'engineer', 'manager', 'specialist', 'developer',
  'senior', 'junior', 'lead', 'staff', 'principal', 'intern', 'consultant',
]);

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasPhrase(text: string, phrase: string): boolean {
  const normalizedPhrase = normalize(phrase);
  return normalizedPhrase.length > 1 && ` ${text} `.includes(` ${normalizedPhrase} `);
}

function postText(post: Post): string {
  return normalize(`${post.content} ${post.authorTitle} ${post.category}`);
}

function userRoleTopics(user: User): string[] {
  return [...new Set(`${user.title} ${user.bio}`
    .split(/[^a-zA-Z0-9+#]+/)
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length >= 4 && !ROLE_STOP_WORDS.has(word)))];
}

function recencyBoost(createdAt: string): number {
  const time = new Date(createdAt).getTime();
  if (Number.isNaN(time)) return 0;
  const ageInDays = Math.max(0, (Date.now() - time) / (1000 * 60 * 60 * 24));
  if (ageInDays <= 1) return 8;
  if (ageInDays <= 7) return 5;
  if (ageInDays <= 30) return 2;
  return 0;
}

/**
 * Ranks the existing social posts from visible career signals. It keeps the reason
 * beside each item so the product can be transparent about personalization.
 */
export function getPersonalizedCareerFeed(user: User, posts: Post[]): PersonalizedFeedItem[] {
  const skills = [...new Set(user.skills.map(({ skill }) => skill).filter(Boolean))];
  const roleTopics = userRoleTopics(user);

  return posts
    .map((post) => {
      const text = postText(post);
      const matchedSkills = skills.filter((skill) => hasPhrase(text, skill));
      const matchedRoles = roleTopics.filter((topic) => hasPhrase(text, topic));
      const opportunitySignal = post.category === 'Opportunities' || /\bhiring\b|\bcareer\b|\binterview\b|\bjob\b/.test(text);
      const engagementBoost = Math.min(12, Math.round(Math.log10(post.likes + post.comments.length * 4 + post.shares * 3 + 1) * 4));
      const score = Math.round(
        matchedSkills.length * 34
        + matchedRoles.length * 14
        + (opportunitySignal ? 10 : 0)
        + (post.saved ? 8 : 0)
        + engagementBoost
        + recencyBoost(post.createdAt),
      );
      const matchedTopics = [...matchedSkills, ...matchedRoles.filter((topic) => !matchedSkills.some((skill) => normalize(skill) === topic))];
      const reason = matchedSkills.length
        ? `Matches your ${matchedSkills.slice(0, 2).join(' and ')} skills.`
        : matchedRoles.length
          ? `Connects with your ${matchedRoles.slice(0, 2).join(' and ')} career focus.`
          : opportunitySignal
            ? 'A career opportunity picked for your feed.'
            : 'A useful conversation in your professional network.';

      return { post, score, reason, matchedTopics };
    })
    .sort((first, second) => {
      if (second.score !== first.score) return second.score - first.score;
      return new Date(second.post.createdAt).getTime() - new Date(first.post.createdAt).getTime();
    });
}
