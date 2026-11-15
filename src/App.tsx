/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BookOpen, Home, MessageCircle, User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  AppTab,
  ArticleItem,
  ChatThread,
  DemoAccount,
  FeedKind,
  FilterCategory,
  NotificationItem,
  OpportunityItem,
  PostItem,
  StoryItem,
  UserProfile,
} from './types/alca';
import {
  CURRENT_USER,
  EXTRA_FEED_ITEMS,
  INITIAL_ARTICLES,
  INITIAL_NOTIFICATIONS,
  INITIAL_OPPORTUNITIES,
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_THREADS,
} from './data/seedData';
import {
  accountToUserProfile,
  addPostComment,
  applyToOpportunity,
  computeAcademicStats,
  createNewPost,
  deletePostWithRole,
  dismissNotification,
  markStoryViewed,
  markThreadRead,
  resolveThemePreference,
  sendChatMessage,
  toggleArticleBookmark,
  toggleOpportunityBookmark,
  togglePinPost,
  togglePostBookmark,
  togglePostLike,
  toggleThemeMode,
  type ThemeMode,
} from './utils/alcaLogic';
import { AuthScreen } from './components/AuthScreen';
import { SkeletonShimmer } from './components/SkeletonShimmer';
import { FeedView } from './components/FeedView';
import { LibrarySearchView } from './components/LibrarySearchView';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { DesktopLeftRail, DesktopRightRail } from './components/DesktopRails';

const STORAGE_KEY = 'alca_academic_state_v2';
const THEME_STORAGE_KEY = 'alca_theme_v1';

const TAB_ORDER: Record<AppTab, number> = {
  inicio: 0,
  chat: 1,
  biblioteca: 2,
  perfil: 3,
};

interface PersistedState {
  isAuthenticated: boolean;
  user: UserProfile;
  posts: PostItem[];
  articles: ArticleItem[];
  opportunities: OpportunityItem[];
  threads: ChatThread[];
  stories: StoryItem[];
  notifications: NotificationItem[];
  extraLoaded: boolean;
}

function loadInitialState(): PersistedState {
  const autostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        return {
          ...parsed,
          isAuthenticated: autostart ? true : parsed.isAuthenticated,
        };
      }
    } catch {
      // Ignore malformed storage and fall back to seed data
    }
  }

  return {
    isAuthenticated: autostart,
    user: CURRENT_USER,
    posts: INITIAL_POSTS,
    articles: INITIAL_ARTICLES,
    opportunities: INITIAL_OPPORTUNITIES,
    threads: INITIAL_THREADS,
    stories: INITIAL_STORIES,
    notifications: INITIAL_NOTIFICATIONS,
    extraLoaded: false,
  };
}

function loadInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const resolved = resolveThemePreference(stored, false);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    return resolved;
  } catch {
    return 'light';
  }
}

export default function App() {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [theme, setTheme] = useState<ThemeMode>(loadInitialTheme);
  const [activeTab, setActiveTab] = useState<AppTab>('inicio');
  const [navDirection, setNavDirection] = useState<number>(1);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState(
    'A conectar o teu espaço académico...',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<FilterCategory>('Tudo');
  const [activeThreadId, setActiveThreadId] = useState<string>(
    INITIAL_THREADS[0].id,
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage quota errors
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => toggleThemeMode(prev));
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const triggerGentleLoading = (nextTab: AppTab, label: string) => {
    setLoadingLabel(label);
    setIsLoadingView(true);
    setActiveTab(nextTab);
    window.setTimeout(() => {
      setIsLoadingView(false);
    }, 600);
  };

  const handleAuthenticated = (authenticatedUser: UserProfile) => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user: authenticatedUser,
    }));
    triggerGentleLoading(
      'inicio',
      `A preparar o espaço de ${authenticatedUser.name}...`,
    );
  };

  const handleSwitchAccount = (account: DemoAccount) => {
    const nextUser = accountToUserProfile(account);
    setState((prev) => ({
      ...prev,
      user: nextUser,
    }));
    triggerGentleLoading(
      'inicio',
      `A alternar acesso para ${nextUser.name}...`,
    );
  };

  const handleLogout = () => {
    setState((prev) => ({ ...prev, isAuthenticated: false }));
    setActiveTab('inicio');
  };

  const handleTabChange = (tab: AppTab) => {
    if (tab === activeTab) return;
    setNavDirection(TAB_ORDER[tab] >= TAB_ORDER[activeTab] ? 1 : -1);
    setActiveTab(tab);
  };

  const handleOpenSearch = (
    initialQuery = '',
    category: FilterCategory = 'Tudo',
  ) => {
    setSearchQuery(initialQuery);
    setSearchCategory(category);
    handleTabChange('biblioteca');
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setState((prev) => ({
      ...prev,
      threads: markThreadRead(prev.threads, threadId),
    }));
  };

  const handleCreateRolePost = (
    content: string,
    category: string,
    kind: FeedKind,
    opportunityData?: {
      title: string;
      organization: string;
      type: 'Bolsas' | 'Estágios';
      deadline: string;
    },
  ) => {
    setState((prev) => {
      let nextOpportunities = prev.opportunities;
      let newOppId: string | undefined;

      if (kind === 'oportunidade' && opportunityData) {
        newOppId = `opp-${Date.now()}`;
        const createdOpp: OpportunityItem = {
          id: newOppId,
          title: opportunityData.title,
          organization: opportunityData.organization,
          type: opportunityData.type,
          modality: 'Publicado na ALÇA',
          deadline: opportunityData.deadline,
          benefit: 'Oportunidade académica verificada',
          description: content.trim(),
          requirements: [
            'Estudante com matrícula ativa na instituição',
            'Candidatura submetida dentro do prazo indicado',
          ],
          bookmarked: false,
          applied: false,
        };
        nextOpportunities = [createdOpp, ...prev.opportunities];
      }

      return {
        ...prev,
        opportunities: nextOpportunities,
        posts: createNewPost(
          prev.posts,
          prev.user.name,
          prev.user.course,
          content,
          category,
          prev.user.role,
          kind,
          newOppId,
        ),
      };
    });
  };

  const handleLoadMoreFeed = () => {
    setState((prev) => {
      if (prev.extraLoaded) return prev;
      const existingIds = new Set(prev.posts.map((p) => p.id));
      const newOnes = EXTRA_FEED_ITEMS.filter((p) => !existingIds.has(p.id));
      return {
        ...prev,
        extraLoaded: true,
        posts: [...prev.posts, ...newOnes],
      };
    });
  };

  const handleShareToChat = (post: PostItem) => {
    const targetThreadId = state.threads[0]?.id ?? 'th-redes';
    const excerpt =
      post.content.length > 80
        ? `${post.content.slice(0, 80)}...`
        : post.content;
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) =>
        p.id === post.id ? { ...p, shares: p.shares + 1 } : p,
      ),
      threads: sendChatMessage(
        prev.threads,
        targetThreadId,
        prev.user.name,
        `Partilhou publicação de ${post.authorName}: “${excerpt}”`,
      ),
    }));
  };

  const stats = computeAcademicStats(
    state.posts,
    state.articles,
    state.opportunities,
    state.threads,
  );

  if (!state.isAuthenticated) {
    return (
      <AuthScreen
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FD] dark:bg-[#0B1021] text-slate-900 dark:text-slate-100 relative transition-colors duration-300">
      {/* Subtle soothing ambient glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/4 w-[32rem] h-[32rem] rounded-full bg-indigo-200/35 dark:bg-indigo-600/20 blur-3xl -z-0 transition-colors duration-300"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-0 right-1/5 w-[28rem] h-[28rem] rounded-full bg-sky-200/35 dark:bg-sky-600/15 blur-3xl -z-0 transition-colors duration-300"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Left Rail */}
          <DesktopLeftRail
            activeTab={activeTab}
            unreadMessages={stats.unreadMessages}
            user={state.user}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onChangeTab={handleTabChange}
          />

          {/* Main Central Workspace with Smooth Directional Section Transitions */}
          <main className="lg:col-span-9 xl:col-span-6 min-w-0">
            {isLoadingView ? (
              <SkeletonShimmer label={loadingLabel} />
            ) : (
              <AnimatePresence mode="wait" custom={navDirection}>
                <motion.div
                  key={activeTab}
                  custom={navDirection}
                  initial={{ opacity: 0, x: navDirection * 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: navDirection * -14 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeTab === 'inicio' && (
                    <FeedView
                      user={state.user}
                      stories={state.stories}
                      posts={state.posts}
                      opportunities={state.opportunities}
                      notifications={state.notifications}
                      hasMoreItems={!state.extraLoaded}
                      theme={theme}
                      onToggleTheme={handleToggleTheme}
                      onLoadMore={handleLoadMoreFeed}
                      onOpenSearch={(q) => handleOpenSearch(q ?? '', 'Tudo')}
                      onOpenOpportunities={() =>
                        handleOpenSearch('', 'Bolsas')
                      }
                      onToggleLike={(postId) =>
                        setState((prev) => ({
                          ...prev,
                          posts: togglePostLike(prev.posts, postId),
                        }))
                      }
                      onToggleBookmark={(postId) =>
                        setState((prev) => ({
                          ...prev,
                          posts: togglePostBookmark(prev.posts, postId),
                        }))
                      }
                      onTogglePin={(postId) =>
                        setState((prev) => ({
                          ...prev,
                          posts: togglePinPost(
                            prev.posts,
                            postId,
                            prev.user.role,
                          ),
                        }))
                      }
                      onDeletePost={(postId) =>
                        setState((prev) => ({
                          ...prev,
                          posts: deletePostWithRole(
                            prev.posts,
                            postId,
                            prev.user.role,
                            prev.user.name,
                          ),
                        }))
                      }
                      onAddComment={(postId, text) =>
                        setState((prev) => ({
                          ...prev,
                          posts: addPostComment(
                            prev.posts,
                            postId,
                            prev.user.name,
                            text,
                          ),
                        }))
                      }
                      onCreatePost={handleCreateRolePost}
                      onApplyOpportunity={(oppId) =>
                        setState((prev) => ({
                          ...prev,
                          opportunities: applyToOpportunity(
                            prev.opportunities,
                            oppId,
                          ),
                        }))
                      }
                      onShareToChat={handleShareToChat}
                      onViewStory={(storyId) =>
                        setState((prev) => ({
                          ...prev,
                          stories: markStoryViewed(prev.stories, storyId),
                        }))
                      }
                      onCreateStory={(caption, subject) =>
                        setState((prev) => ({
                          ...prev,
                          stories: prev.stories.map((st) =>
                            st.isOwn
                              ? {
                                  ...st,
                                  caption,
                                  subject,
                                  timestamp: 'Agora mesmo',
                                  viewed: false,
                                }
                              : st,
                          ),
                        }))
                      }
                      onDismissNotification={(id) =>
                        setState((prev) => ({
                          ...prev,
                          notifications: dismissNotification(
                            prev.notifications,
                            id,
                          ),
                        }))
                      }
                    />
                  )}

                  {activeTab === 'biblioteca' && (
                    <LibrarySearchView
                      articles={state.articles}
                      opportunities={state.opportunities}
                      query={searchQuery}
                      onQueryChange={setSearchQuery}
                      activeCategory={searchCategory}
                      onCategoryChange={setSearchCategory}
                      onBackToFeed={() => handleTabChange('inicio')}
                      onToggleArticleBookmark={(id) =>
                        setState((prev) => ({
                          ...prev,
                          articles: toggleArticleBookmark(prev.articles, id),
                        }))
                      }
                      onToggleOpportunityBookmark={(id) =>
                        setState((prev) => ({
                          ...prev,
                          opportunities: toggleOpportunityBookmark(
                            prev.opportunities,
                            id,
                          ),
                        }))
                      }
                      onApplyOpportunity={(id) =>
                        setState((prev) => ({
                          ...prev,
                          opportunities: applyToOpportunity(
                            prev.opportunities,
                            id,
                          ),
                        }))
                      }
                    />
                  )}

                  {activeTab === 'chat' && (
                    <ChatView
                      threads={state.threads}
                      activeThreadId={activeThreadId}
                      onSelectThread={handleSelectThread}
                      onSendMessage={(threadId, text) =>
                        setState((prev) => ({
                          ...prev,
                          threads: sendChatMessage(
                            prev.threads,
                            threadId,
                            prev.user.name,
                            text,
                          ),
                        }))
                      }
                    />
                  )}

                  {activeTab === 'perfil' && (
                    <ProfileView
                      user={state.user}
                      posts={state.posts}
                      articles={state.articles}
                      opportunities={state.opportunities}
                      theme={theme}
                      onToggleTheme={handleToggleTheme}
                      onLogout={handleLogout}
                      onOpenLibrary={() => handleOpenSearch('', 'Bolsas')}
                      onSwitchAccount={handleSwitchAccount}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </main>

          {/* Desktop Right Discovery Rail */}
          <DesktopRightRail
            opportunities={state.opportunities}
            threads={state.threads}
            onQuickSearch={(q) => handleOpenSearch(q, 'Tudo')}
            onOpenOpportunities={() => handleOpenSearch('', 'Bolsas')}
            onOpenThread={(threadId) => {
              handleSelectThread(threadId);
              handleTabChange('chat');
            }}
          />
        </div>
      </div>

      {/* Fixed Bottom 4-Tab Glass Navigation on Mobile */}
      <nav
        aria-label="Navegação inferior"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-slate-200/80 dark:border-slate-800/80"
      >
        <div className="max-w-lg mx-auto grid grid-cols-4 h-16 items-center px-2">
          {[
            { id: 'inicio' as AppTab, label: 'Início', icon: Home },
            {
              id: 'chat' as AppTab,
              label: 'Chat',
              icon: MessageCircle,
              badge: stats.unreadMessages,
            },
            { id: 'biblioteca' as AppTab, label: 'Biblioteca', icon: BookOpen },
            { id: 'perfil' as AppTab, label: 'Perfil', icon: User },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-colors ${
                  active
                    ? 'text-[#0A0F44] dark:text-indigo-300 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="relative">
                  <Icon
                    className="w-5 h-5"
                    strokeWidth={active ? 2.4 : 1.8}
                    aria-hidden="true"
                  />
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[11px] leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
