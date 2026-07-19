import { describe, it, expect, beforeEach } from 'vitest';
import { userService } from './userService';
import { db } from './db';

describe('userService', () => {
  beforeEach(() => {
    db.clear();
  });

  it('should return default user initially', () => {
    const user = userService.get();
    expect(user.id).toBe('1');
    expect(user.name).toBe('');
    expect(user.profileCompleted).toBe(false);
  });

  it('should update user properties correctly', () => {
    const updated = userService.update({ name: 'Alice Smith', title: 'React Developer' });
    expect(updated.name).toBe('Alice Smith');
    expect(updated.title).toBe('React Developer');
    
    // Check if persistence works
    const retrieved = userService.get();
    expect(retrieved.name).toBe('Alice Smith');
  });

  it('should return user with avatar properly formatted', () => {
    // Check default fallback avatar or initials-based avatar
    const u1 = userService.getWithAvatar();
    expect(u1.avatar).toBeDefined();

    // Set name to check initials avatar
    userService.update({ name: 'Bob Jones' });
    const u2 = userService.getWithAvatar();
    expect(u2.avatar).toContain('Bob%20Jones');

    // Set custom avatar
    userService.update({ avatar: 'https://custom-avatar.com/bob.jpg' });
    const u3 = userService.getWithAvatar();
    expect(u3.avatar).toBe('https://custom-avatar.com/bob.jpg');
  });

  it('should complete profile and set completed status', () => {
    const completed = userService.completeProfile({
      bio: 'Fullstack Engineer',
      location: 'San Francisco',
    });
    expect(completed.profileCompleted).toBe(true);
    expect(completed.bio).toBe('Fullstack Engineer');
    expect(completed.location).toBe('San Francisco');
  });

  it('should update skill endorsements', () => {
    userService.update({
      skills: [
        { skill: 'React', endorsements: 5 },
        { skill: 'TypeScript', endorsements: 10 }
      ]
    });

    const updated = userService.updateSkill(1, 11);
    expect(updated.skills[1].endorsements).toBe(11);
    expect(updated.skills[0].endorsements).toBe(5);
  });

  it('should reset user profile back to default', () => {
    userService.update({ name: 'Charlie', title: 'Designer' });
    const resetUser = userService.reset();
    expect(resetUser.name).toBe('');
    expect(userService.get().name).toBe('');
  });
});
