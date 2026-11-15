import type {
  AccessRole,
  ArticleItem,
  ChatThread,
  DemoAccount,
  FeedFilter,
  FeedKind,
  FilterCategory,
  NotificationItem,
  OpportunityItem,
  PostItem,
  RolePermissions,
  StoryItem,
  UserProfile,
} from '../types/alca';

export interface AuthValidationResult {
  valid: boolean;
  error?: string;
}

export function getRolePermissions(role: AccessRole): RolePermissions {
  switch (role) {
    case 'professor':
      return {
        roleLabel: 'Professor',
        canPublishStudentPost: true,
        canPublishAnnouncement: true,
        canPublishOpportunity: false,
        canPinAndModerate: true,
        canReviewApplications: false,
      };
    case 'instituicao':
      return {
        roleLabel: 'Instituição',
        canPublishStudentPost: false,
        canPublishAnnouncement: true,
        canPublishOpportunity: true,
        canPinAndModerate: true,
        canReviewApplications: true,
      };
    case 'admin':
      return {
        roleLabel: 'Administrador',
        canPublishStudentPost: true,
        canPublishAnnouncement: true,
        canPublishOpportunity: true,
        canPinAndModerate: true,
        canReviewApplications: true,
      };
    case 'estudante':
    default:
      return {
        roleLabel: 'Estudante',
        canPublishStudentPost: true,
        canPublishAnnouncement: false,
        canPublishOpportunity: false,
        canPinAndModerate: false,
        canReviewApplications: false,
      };
  }
}

export function accountToUserProfile(account: DemoAccount): UserProfile {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    handle: account.handle,
    role: account.role,
    course: account.course,
    university: account.university,
    year: account.year,
    bio: account.bio,
    avatarKey: account.avatarKey,
    initials: account.initials,
  };
}

export function authenticateWithRoleAccounts(
  accounts: DemoAccount[],
  identifier: string,
  password: string,
): { valid: boolean; user?: UserProfile; error?: string } {
  const baseCheck = validateLoginCredentials(identifier, password);
  if (!baseCheck.valid) {
    return { valid: false, error: baseCheck.error };
  }

  const normalizedId = identifier.trim().toLowerCase();
  const matched = accounts.find(
    (acc) => acc.email.toLowerCase() === normalizedId,
  );

  if (matched) {
    if (matched.password !== password.trim()) {
      return {
        valid: false,
        error: `Password incorreta para a conta ${matched.email}.`,
      };
    }
    return { valid: true, user: accountToUserProfile(matched) };
  }

  // Fallback for custom valid phone/email login as Estudante
  return {
    valid: true,
    user: {
      ...accountToUserProfile(accounts[0]),
      email: identifier.trim(),
    },
  };
}

export function validateLoginCredentials(
  identifier: string,
  password: string,
): AuthValidationResult {
  const cleanId = identifier.trim();
  if (!cleanId) {
    return {
      valid: false,
      error: 'Insere o teu e-mail académico ou número de telefone.',
    };
  }
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId);
  const isPhone = /^[+\d\s()-]{7,}$/.test(cleanId);
  if (!isEmail && !isPhone) {
    return {
      valid: false,
      error: 'Usa um e-mail válido (ex: maria@alca.edu) ou número de telefone.',
    };
  }
  if (password.trim().length < 4) {
    return {
      valid: false,
      error: 'A password deve ter pelo menos 4 caracteres.',
    };
  }
  return { valid: true };
}

export function validateSignupCredentials(
  name: string,
  identifier: string,
  password: string,
): AuthValidationResult {
  if (name.trim().length < 3) {
    return {
      valid: false,
      error: 'Indica o teu nome completo para o perfil académico.',
    };
  }
  return validateLoginCredentials(identifier, password);
}

export function filterUnifiedFeed(
  posts: PostItem[],
  feedFilter: FeedFilter,
): PostItem[] {
  const filtered = posts.filter((post) => {
    if (feedFilter === 'Tudo') return true;
    if (feedFilter === 'Estudantes') return post.kind === 'estudante';
    if (feedFilter === 'Anúncios') return post.kind === 'anuncio';
    if (feedFilter === 'Bolsas & Estágios') return post.kind === 'oportunidade';
    return true;
  });

  // Pinned announcements appear cleanly at the top while keeping chronological order
  return [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });
}

export function filterLibraryContent(
  articles: ArticleItem[],
  opportunities: OpportunityItem[],
  query: string,
  activeCategory: FilterCategory,
  onlySaved: boolean,
): { articles: ArticleItem[]; opportunities: OpportunityItem[] } {
  const normalized = query.trim().toLowerCase();

  const matchesQuery = (text: string) =>
    !normalized || text.toLowerCase().includes(normalized);

  const filteredArticles = articles.filter((article) => {
    if (onlySaved && !article.bookmarked) return false;
    if (
      activeCategory !== 'Tudo' &&
      (activeCategory === 'Bolsas' ||
        activeCategory === 'Estágios' ||
        article.category !== activeCategory)
    ) {
      return false;
    }
    return matchesQuery(`${article.title} ${article.snippet} ${article.category}`);
  });

  const filteredOpportunities = opportunities.filter((opp) => {
    if (onlySaved && !opp.bookmarked) return false;
    if (activeCategory !== 'Tudo' && activeCategory !== opp.type) {
      return false;
    }
    return matchesQuery(
      `${opp.title} ${opp.organization} ${opp.type} ${opp.description}`,
    );
  });

  return {
    articles: filteredArticles,
    opportunities: filteredOpportunities,
  };
}

export function togglePostLike(posts: PostItem[], postId: string): PostItem[] {
  return posts.map((post) => {
    if (post.id !== postId) return post;
    const likedByMe = !post.likedByMe;
    return {
      ...post,
      likedByMe,
      likes: likedByMe ? post.likes + 1 : Math.max(0, post.likes - 1),
    };
  });
}

export function togglePostBookmark(posts: PostItem[], postId: string): PostItem[] {
  return posts.map((post) =>
    post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post,
  );
}

export function togglePinPost(
  posts: PostItem[],
  postId: string,
  actorRole: AccessRole,
): PostItem[] {
  if (!getRolePermissions(actorRole).canPinAndModerate) return posts;
  return posts.map((post) =>
    post.id === postId ? { ...post, pinned: !post.pinned } : post,
  );
}

export function deletePostWithRole(
  posts: PostItem[],
  postId: string,
  actorRole: AccessRole,
  actorName: string,
): PostItem[] {
  const canModerate = getRolePermissions(actorRole).canPinAndModerate;
  return posts.filter((post) => {
    if (post.id !== postId) return true;
    if (canModerate) return false;
    return post.authorName !== actorName;
  });
}

export function addPostComment(
  posts: PostItem[],
  postId: string,
  authorName: string,
  text: string,
): PostItem[] {
  const cleanText = text.trim();
  if (!cleanText) return posts;
  return posts.map((post) => {
    if (post.id !== postId) return post;
    return {
      ...post,
      comments: [
        ...post.comments,
        {
          id: `c-${Date.now()}-${post.comments.length + 1}`,
          authorName,
          text: cleanText,
          timestamp: 'Agora',
        },
      ],
    };
  });
}

export function createNewPost(
  posts: PostItem[],
  authorName: string,
  authorCourse: string,
  content: string,
  category: string,
  authorRole: AccessRole = 'estudante',
  requestedKind: FeedKind = 'estudante',
  opportunityId?: string,
): PostItem[] {
  const clean = content.trim();
  if (!clean) return posts;

  const perms = getRolePermissions(authorRole);
  let resolvedKind: FeedKind = requestedKind;
  if (resolvedKind === 'anuncio' && !perms.canPublishAnnouncement) {
    resolvedKind = 'estudante';
  }
  if (resolvedKind === 'oportunidade' && !perms.canPublishOpportunity) {
    resolvedKind = perms.canPublishAnnouncement ? 'anuncio' : 'estudante';
  }

  const initials = authorName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const newPost: PostItem = {
    id: `post-${Date.now()}`,
    kind: resolvedKind,
    authorName,
    authorRole,
    authorCourse,
    authorAvatarKey:
      authorRole === 'estudante'
        ? 'maria'
        : authorRole === 'admin'
          ? 'moises'
          : undefined,
    authorInitials: initials || 'AL',
    timestamp: 'Agora mesmo',
    content: clean,
    category:
      category ||
      (resolvedKind === 'anuncio'
        ? 'Anúncio Académico'
        : resolvedKind === 'oportunidade'
          ? 'Bolsas & Estágios'
          : 'Partilha Académica'),
    pinned: resolvedKind === 'anuncio',
    opportunityId,
    likes: 0,
    likedByMe: false,
    shares: 0,
    bookmarked: false,
    comments: [],
  };

  return [newPost, ...posts];
}

export function toggleArticleBookmark(
  articles: ArticleItem[],
  articleId: string,
): ArticleItem[] {
  return articles.map((item) =>
    item.id === articleId ? { ...item, bookmarked: !item.bookmarked } : item,
  );
}

export function toggleOpportunityBookmark(
  opportunities: OpportunityItem[],
  oppId: string,
): OpportunityItem[] {
  return opportunities.map((opp) =>
    opp.id === oppId ? { ...opp, bookmarked: !opp.bookmarked } : opp,
  );
}

export function applyToOpportunity(
  opportunities: OpportunityItem[],
  oppId: string,
): OpportunityItem[] {
  return opportunities.map((opp) =>
    opp.id === oppId ? { ...opp, applied: true } : opp,
  );
}

export function sendChatMessage(
  threads: ChatThread[],
  threadId: string,
  senderName: string,
  text: string,
): ChatThread[] {
  const clean = text.trim();
  if (!clean) return threads;
  return threads.map((thread) => {
    if (thread.id !== threadId) return thread;
    return {
      ...thread,
      unreadCount: 0,
      messages: [
        ...thread.messages,
        {
          id: `msg-${Date.now()}-${thread.messages.length + 1}`,
          senderName,
          isMe: true,
          text: clean,
          timestamp: 'Agora',
        },
      ],
    };
  });
}

export function markThreadRead(
  threads: ChatThread[],
  threadId: string,
): ChatThread[] {
  return threads.map((thread) =>
    thread.id === threadId ? { ...thread, unreadCount: 0 } : thread,
  );
}

export function markStoryViewed(
  stories: StoryItem[],
  storyId: string,
): StoryItem[] {
  return stories.map((story) =>
    story.id === storyId ? { ...story, viewed: true } : story,
  );
}

export function dismissNotification(
  notifications: NotificationItem[],
  notificationId: string,
): NotificationItem[] {
  return notifications.map((item) =>
    item.id === notificationId ? { ...item, read: true } : item,
  );
}

export function computeAcademicStats(
  posts: PostItem[],
  articles: ArticleItem[],
  opportunities: OpportunityItem[],
  threads: ChatThread[],
) {
  const savedCount =
    posts.filter((p) => p.bookmarked).length +
    articles.filter((a) => a.bookmarked).length +
    opportunities.filter((o) => o.bookmarked).length;
  const applicationsCount = opportunities.filter((o) => o.applied).length;
  const unreadMessages = threads.reduce((acc, t) => acc + t.unreadCount, 0);
  return {
    savedCount,
    applicationsCount,
    unreadMessages,
    totalPosts: posts.length,
  };
}
