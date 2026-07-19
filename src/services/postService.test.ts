import { describe, it, expect, beforeEach } from 'vitest';
import { postService } from './postService';
import { db } from './db';

describe('postService', () => {
  beforeEach(() => {
    db.clear();
  });

  it('should return default posts initially', () => {
    const posts = postService.getAll();
    expect(posts.length).toBe(3);
    expect(posts[0].authorName).toBe('Sarah Chen');
  });

  it('should filter posts by category', () => {
    const all = postService.getByCategory('All');
    expect(all.length).toBe(3);

    const thoughts = postService.getByCategory('Thoughts');
    expect(thoughts.length).toBe(1);
    expect(thoughts[0].id).toBe('2');
  });

  it('should create new post and add it to the top', () => {
    const newPost = postService.createPost('Hello World! #testing', 'Thoughts', '1', 'Me', 'Software Engineer', 'avatar_url');
    expect(newPost).toBeDefined();
    expect(newPost?.content).toBe('Hello World! #testing');
    expect(newPost?.authorName).toBe('Me');

    const posts = postService.getAll();
    expect(posts.length).toBe(4);
    expect(posts[0].content).toBe('Hello World! #testing');
  });

  it('should toggle like on posts', () => {
    const initialPost = postService.getAll()[0];
    const originalLikes = initialPost.likes;
    expect(initialPost.liked).toBe(false);

    // Like
    let posts = postService.toggleLike(initialPost.id);
    let updatedPost = posts.find(p => p.id === initialPost.id);
    expect(updatedPost?.liked).toBe(true);
    expect(updatedPost?.likes).toBe(originalLikes + 1);

    // Unlike
    posts = postService.toggleLike(initialPost.id);
    updatedPost = posts.find(p => p.id === initialPost.id);
    expect(updatedPost?.liked).toBe(false);
    expect(updatedPost?.likes).toBe(originalLikes);
  });

  it('should toggle save on posts', () => {
    const initialPost = postService.getAll()[0];
    expect(initialPost.saved).toBe(false);

    // Save
    let posts = postService.toggleSave(initialPost.id);
    let updatedPost = posts.find(p => p.id === initialPost.id);
    expect(updatedPost?.saved).toBe(true);

    // Unsave
    posts = postService.toggleSave(initialPost.id);
    updatedPost = posts.find(p => p.id === initialPost.id);
    expect(updatedPost?.saved).toBe(false);
  });

  it('should add comment to posts', () => {
    const post = postService.getAll()[0];
    const initialCommentCount = post.comments.length;

    const posts = postService.addComment(post.id, 'Nice post!', '2', 'Bob', 'bob_avatar');
    const updatedPost = posts.find(p => p.id === post.id);
    expect(updatedPost?.comments.length).toBe(initialCommentCount + 1);
    expect(updatedPost?.comments[updatedPost.comments.length - 1].text).toBe('Nice post!');
    expect(updatedPost?.comments[updatedPost.comments.length - 1].authorName).toBe('Bob');
  });

  it('should share, update, and change visibility of a post', () => {
    const post = postService.getAll()[0];
    expect(post.shares).toBe(5);

    // Share
    let posts = postService.sharePost(post.id);
    expect(posts.find(p => p.id === post.id)?.shares).toBe(6);

    // Update post content
    posts = postService.updatePost(post.id, 'New Content');
    expect(posts.find(p => p.id === post.id)?.content).toBe('New Content');

    // Update visibility
    posts = postService.updateVisibility(post.id, 'friends');
    expect(posts.find(p => p.id === post.id)?.visibility).toBe('friends');
  });

  it('should delete posts', () => {
    const postsBefore = postService.getAll();
    expect(postsBefore.length).toBe(3);

    const postsAfter = postService.deletePost('1');
    expect(postsAfter.length).toBe(2);
    expect(postsAfter.find(p => p.id === '1')).toBeUndefined();
  });
});
