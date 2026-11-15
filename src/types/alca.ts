export type AppTab = 'inicio' | 'chat' | 'biblioteca' | 'perfil';

export type AccessRole = 'estudante' | 'professor' | 'instituicao' | 'admin';

export type FeedKind = 'estudante' | 'anuncio' | 'oportunidade';

export type FeedFilter = 'Tudo' | 'Estudantes' | 'Anúncios' | 'Bolsas & Estágios';

export type FilterCategory =
  | 'Tudo'
  | 'Redes'
  | 'Programação'
  | 'Bases de Dados'
  | 'Bolsas'
  | 'Estágios';

export type AssetKey = 'maria' | 'moises' | 'student' | 'mapa' | 'network';

export interface RolePermissions {
  roleLabel: string;
  canPublishStudentPost: boolean;
  canPublishAnnouncement: boolean;
  canPublishOpportunity: boolean;
  canPinAndModerate: boolean;
  canReviewApplications: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  handle: string;
  role: AccessRole;
  course: string;
  university: string;
  year: string;
  bio: string;
  avatarKey?: AssetKey;
  initials: string;
}

export interface DemoAccount {
  id: string;
  role: AccessRole;
  name: string;
  email: string;
  password: string;
  handle: string;
  course: string;
  university: string;
  year: string;
  bio: string;
  avatarKey?: AssetKey;
  initials: string;
}

export interface StoryItem {
  id: string;
  authorName: string;
  shortName: string;
  avatarKey?: AssetKey;
  initials: string;
  ringAccent: string;
  isOwn?: boolean;
  viewed: boolean;
  caption: string;
  subject: string;
  timestamp: string;
  mediaKey?: AssetKey;
}

export interface CommentItem {
  id: string;
  authorName: string;
  text: string;
  timestamp: string;
}

export interface PostItem {
  id: string;
  kind: FeedKind;
  authorName: string;
  authorRole: AccessRole;
  authorCourse: string;
  authorAvatarKey?: AssetKey;
  authorInitials: string;
  timestamp: string;
  content: string;
  category: string;
  pinned?: boolean;
  opportunityId?: string;
  mediaKey?: AssetKey;
  mediaVariant?: 'mapa' | 'photo';
  likes: number;
  likedByMe: boolean;
  shares: number;
  bookmarked: boolean;
  comments: CommentItem[];
}

export interface ArticleItem {
  id: string;
  title: string;
  snippet: string;
  fullSummary: string[];
  keyTakeaway: string;
  category: Exclude<FilterCategory, 'Tudo' | 'Bolsas' | 'Estágios'>;
  readTime: string;
  author: string;
  thumbKey?: AssetKey;
  thumbTone: 'indigo' | 'sky' | 'teal' | 'violet';
  bookmarked: boolean;
}

export interface OpportunityItem {
  id: string;
  title: string;
  organization: string;
  type: 'Bolsas' | 'Estágios';
  modality: string;
  deadline: string;
  benefit: string;
  description: string;
  requirements: string[];
  bookmarked: boolean;
  applied: boolean;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  isMe: boolean;
  text: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  title: string;
  subtitle: string;
  isGroup: boolean;
  avatarKey?: AssetKey;
  initials: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface NotificationItem {
  id: string;
  actorName: string;
  actorAvatarKey?: AssetKey;
  actorInitials: string;
  actionText: string;
  previewText: string;
  timestamp: string;
  targetPostId?: string;
  read: boolean;
}
