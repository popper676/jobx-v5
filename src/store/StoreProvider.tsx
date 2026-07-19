import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Job } from '../data';
import { authService, AuthState } from '../services/authService';
import { userService, User } from '../services/userService';
import { jobService, SavedJob, AppliedJob } from '../services/jobService';
import { postService, Post, PostVisibility } from '../services/postService';
import { messageService, Conversation, Message } from '../services/messageService';
import { notificationService, Notification } from '../services/notificationService';
import { myDayService, MyDay, MyDayItem } from '../services/myDayService';
import { antiGhostingService } from '../services/antiGhostingService';
import { employerJobService } from '../services/employerJobService';
import { getJobIntelligence } from '../services/careerIntelligenceService';
import { Application } from '../types';
import { getJobTrustProfile } from '../services/trustService';

interface StoreState {
  auth: AuthState;
  user: User;
  posts: Post[];
  savedJobs: SavedJob[];
  appliedJobs: AppliedJob[];
  conversations: Conversation[];
  currentMessages: Message[];
  activeChat: Conversation | null;
  notifications: Notification[];
  myDays: MyDay[];
  applications: Application[];
}

interface StoreActions {
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  completeProfile: (data: Partial<User>) => void;
  endorseSkill: (index: number) => void;
  createPost: (content: string, category: string, images?: string[], video?: string) => boolean;
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  sharePost: (postId: string) => void;
  deletePost: (postId: string) => void;
  updatePost: (postId: string, content: string) => void;
  updatePostVisibility: (postId: string, visibility: PostVisibility) => void;
  saveJob: (jobId: string) => void;
  unsaveJob: (jobId: string) => void;
  applyToJob: (jobId: string) => { success: boolean; error?: string };
  setActiveChat: (conversation: Conversation) => void;
  sendMessage: (conversationId: string, text: string) => void;
  searchConversations: (query: string) => void;
  searchJobs: (query: string, location: string) => Job[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  createMyDay: (items: MyDayItem[]) => boolean;
  markMyDayViewed: (dayId: string) => void;
  deleteMyDay: (dayId: string) => void;
  respondToApplication: (applicationId: string, decision: 'accepted' | 'rejected') => void;
  resetAll: () => void;
}

type Store = StoreState & StoreActions;

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(authService.getState());
  const [user, setUser] = useState<User>(userService.get());
  const [posts, setPosts] = useState<Post[]>(postService.getAll());
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(jobService.getSaved());
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>(jobService.getApplied());
  const [conversations, setConversations] = useState<Conversation[]>(messageService.getConversations());
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChatState] = useState<Conversation | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(notificationService.getAll());
  const [myDays, setMyDays] = useState<MyDay[]>(myDayService.getAll());
  const [applications, setApplications] = useState<Application[]>(antiGhostingService.getApplications());

  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const result = authService.login(email, password);
    if (result.success && result.state) {
      setAuth(result.state);
      userService.update({ id: result.state.userId, name: result.state.name, email: result.state.email });
      setUser(userService.get());
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const signup = useCallback((name: string, email: string, password: string): { success: boolean; error?: string } => {
    const result = authService.signup(name, email, password);
    if (result.success && result.state) {
      setAuth(result.state);
      userService.update({ id: result.state.userId, name: result.state.name, email: result.state.email });
      setUser(userService.get());
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const logout = useCallback(() => {
    const state = authService.logout();
    setAuth(state);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    const updated = userService.update(updates);
    setUser({ ...updated });
  }, []);

  const completeProfile = useCallback((data: Partial<User>) => {
    const updated = userService.completeProfile(data);
    setUser({ ...updated });
  }, []);

  const endorseSkill = useCallback((index: number) => {
    const u = userService.get();
    if (u.skills[index]) {
      const updated = userService.updateSkill(index, u.skills[index].endorsements + 1);
      setUser({ ...updated });
    }
  }, []);

  const createPost = useCallback((content: string, category: string, images?: string[], video?: string): boolean => {
    const u = userService.get();
    const result = postService.createPost(content, category, u.id, u.name, u.title, u.avatar, images, video);
    if (!result) return false;
    setPosts(postService.getAll());
    return true;
  }, []);

  const toggleLikePost = useCallback((postId: string) => {
    postService.toggleLike(postId);
    setPosts(postService.getAll());
  }, []);

  const toggleSavePost = useCallback((postId: string) => {
    postService.toggleSave(postId);
    setPosts(postService.getAll());
  }, []);

  const addComment = useCallback((postId: string, text: string) => {
    const u = userService.get();
    postService.addComment(postId, text, u.id, u.name, u.avatar);
    setPosts(postService.getAll());
  }, []);

  const sharePost = useCallback((postId: string) => {
    postService.sharePost(postId);
    setPosts(postService.getAll());
  }, []);

  const deletePost = useCallback((postId: string) => {
    postService.deletePost(postId);
    setPosts(postService.getAll());
  }, []);

  const updatePost = useCallback((postId: string, content: string) => {
    postService.updatePost(postId, content);
    setPosts(postService.getAll());
  }, []);

  const updatePostVisibility = useCallback((postId: string, visibility: PostVisibility) => {
    postService.updateVisibility(postId, visibility);
    setPosts(postService.getAll());
  }, []);

  const saveJob = useCallback((jobId: string) => {
    const updated = jobService.saveJob(jobId);
    setSavedJobs([...updated]);
  }, []);

  const unsaveJob = useCallback((jobId: string) => {
    const updated = jobService.unsaveJob(jobId);
    setSavedJobs([...updated]);
  }, []);

  const applyToJob = useCallback((jobId: string): { success: boolean; error?: string } => {
    const job = jobService.getById(jobId);
    if (!job) return { success: false, error: 'This job is no longer available.' };

    const user = userService.get();
    const matchScore = getJobIntelligence(job, user).score;
    const trustProfile = getJobTrustProfile(job);
    const applicationResult = antiGhostingService.createApplication({
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.company,
      candidateId: user.id,
      candidateName: user.name,
      candidateHeadline: user.title,
      candidateAvatar: user.avatar,
      matchScore,
      responseCommitmentDays: trustProfile.responseCommitmentDays,
    });
    if (!applicationResult.ok) return { success: false, error: applicationResult.error };

    const updated = jobService.applyToJob(jobId);
    setAppliedJobs([...updated]);
    setApplications(antiGhostingService.getApplications());
    return { success: true };
  }, []);

  const handleSetActiveChat = useCallback((conversation: Conversation) => {
    setActiveChatState(conversation);
    const msgs = messageService.getMessages(conversation.id);
    setCurrentMessages(msgs);
    messageService.markAsRead(conversation.id);
    setConversations(messageService.getConversations());
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const u = userService.get();
    const result = messageService.sendMessage(conversationId, text, u.id, u.name);
    setConversations([...result.conversations]);
    setCurrentMessages([...result.messages]);
    setActiveChatState(prev => {
      if (prev && prev.id === conversationId) {
        const updated = result.conversations.find(c => c.id === conversationId);
        return updated || prev;
      }
      return prev;
    });
  }, []);

  const searchConversations = useCallback((query: string) => {
    setConversations(messageService.searchConversations(query));
  }, []);

  const searchJobs = useCallback((query: string, location: string): Job[] => {
    return jobService.search(query, location);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    notificationService.markAsRead(id);
    setNotifications(notificationService.getAll());
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    notificationService.markAllAsRead();
    setNotifications(notificationService.getAll());
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    notificationService.add(notification);
    setNotifications(notificationService.getAll());
  }, []);

  const createMyDay = useCallback((items: MyDayItem[]): boolean => {
    const u = userService.get();
    const result = myDayService.createMyDay(u.id, u.name, u.avatar, items);
    if (!result) return false;
    setMyDays(myDayService.getAll());
    return true;
  }, []);

  const markMyDayViewed = useCallback((dayId: string) => {
    const u = userService.get();
    myDayService.markViewed(dayId, u.id);
    setMyDays(myDayService.getAll());
  }, []);

  const deleteMyDay = useCallback((dayId: string) => {
    myDayService.deleteMyDay(dayId);
    setMyDays(myDayService.getAll());
  }, []);

  const respondToApplication = useCallback((applicationId: string, decision: 'accepted' | 'rejected') => {
    const application = antiGhostingService.employerRespondToApplication(applicationId, decision);
    setApplications(antiGhostingService.getApplications());
    if (application?.candidateId === userService.get().id) {
      notificationService.add({
        type: 'job_alert',
        userId: 'jobx-system',
        userName: application.companyName || 'Employer',
        userAvatar: '',
        action: decision === 'accepted' ? 'Application shortlisted' : 'Application update',
        title: decision === 'accepted' ? 'You have been shortlisted' : 'Application update',
        message: decision === 'accepted'
          ? `${application.companyName || 'The employer'} shortlisted you for ${application.jobTitle}.`
          : `${application.companyName || 'The employer'} has decided not to move forward with ${application.jobTitle}.`,
        time: 'Just now',
        read: false,
        link: '/applications',
      });
      setNotifications(notificationService.getAll());
    }
  }, []);

  React.useEffect(() => {
    const currentApps = antiGhostingService.getApplications();
    const updatedApps = antiGhostingService.checkExpiredApplications();
    const expiredIds = updatedApps.filter(a => a.status === 'Expired').map(a => a.id);
    const oldExpiredIds = currentApps.filter(a => a.status === 'Expired').map(a => a.id);
    
    const newlyExpired = updatedApps.filter(a => expiredIds.includes(a.id) && !oldExpiredIds.includes(a.id));
    
    if (newlyExpired.length > 0) {
      setApplications(updatedApps);
      let newNotifs = false;
      const currentUser = userService.get();
      newlyExpired.forEach(app => {
        if (app.candidateId === currentUser.id) {
          notificationService.add({
            type: 'job_alert',
            userId: 'jobx-system',
            userName: 'JobX',
            userAvatar: '',
            action: 'Application expired',
            title: 'Application Expired',
            message: `Your application for ${app.jobTitle} has expired without an employer response.`,
            time: 'Just now',
            read: false,
            link: '/jobs',
          });
          newNotifs = true;
        }
      });
      if (newNotifs) setNotifications(notificationService.getAll());
    }
  }, []);

  const resetAll = useCallback(() => {
    authService.logout();
    userService.reset();
    jobService.reset();
    employerJobService.reset();
    antiGhostingService.reset();
    postService.reset();
    messageService.reset();
    notificationService.reset();
    myDayService.reset();
    setAuth(authService.getState());
    setUser(userService.get());
    setPosts(postService.getAll());
    setSavedJobs(jobService.getSaved());
    setAppliedJobs(jobService.getApplied());
    setConversations(messageService.getConversations());
    setCurrentMessages([]);
    setActiveChatState(null);
    setNotifications(notificationService.getAll());
    setMyDays(myDayService.getAll());
    setApplications(antiGhostingService.getApplications());
  }, []);

  const store: Store = {
    auth, user, posts, savedJobs, appliedJobs,
    conversations, currentMessages, activeChat, notifications, myDays, applications,
    login, signup, logout, updateUser, completeProfile, endorseSkill, createPost, toggleLikePost, toggleSavePost,
    addComment, sharePost, deletePost, updatePost, updatePostVisibility, saveJob, unsaveJob, applyToJob,
    setActiveChat: handleSetActiveChat, sendMessage, searchConversations, searchJobs,
    markNotificationRead, markAllNotificationsRead, addNotification,
    createMyDay, markMyDayViewed, deleteMyDay, respondToApplication, resetAll,
  };

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
