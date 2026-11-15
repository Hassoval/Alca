import { useState, type FormEvent } from 'react';
import {
  Bell,
  Bookmark,
  Briefcase,
  CheckCircle2,
  Heart,
  Maximize2,
  Megaphone,
  MessageCircle,
  Pin,
  RefreshCw,
  Search,
  Send,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  FeedFilter,
  FeedKind,
  NotificationItem,
  OpportunityItem,
  PostItem,
  StoryItem,
  UserProfile,
} from '../types/alca';
import { filterUnifiedFeed, getRolePermissions } from '../utils/alcaLogic';
import { AlcaLogo } from './AlcaLogo';
import { UserAvatar } from './UserAvatar';
import { StoriesStrip } from './StoriesStrip';
import { MEDIA_ASSETS } from '../utils/mediaAssets';

interface FeedViewProps {
  user: UserProfile;
  stories: StoryItem[];
  posts: PostItem[];
  opportunities: OpportunityItem[];
  notifications: NotificationItem[];
  hasMoreItems: boolean;
  onLoadMore: () => void;
  onOpenSearch: (initialQuery?: string) => void;
  onOpenOpportunities: () => void;
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onTogglePin: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onCreatePost: (
    content: string,
    category: string,
    kind: FeedKind,
    opportunityData?: {
      title: string;
      organization: string;
      type: 'Bolsas' | 'Estágios';
      deadline: string;
    },
  ) => void;
  onApplyOpportunity: (oppId: string) => void;
  onShareToChat: (post: PostItem) => void;
  onViewStory: (storyId: string) => void;
  onCreateStory: (caption: string, subject: string) => void;
  onDismissNotification: (id: string) => void;
}

const FEED_FILTERS: FeedFilter[] = [
  'Tudo',
  'Estudantes',
  'Anúncios',
  'Bolsas & Estágios',
];

export function FeedView({
  user,
  stories,
  posts,
  opportunities,
  notifications,
  hasMoreItems,
  onLoadMore,
  onOpenSearch,
  onOpenOpportunities,
  onToggleLike,
  onToggleBookmark,
  onTogglePin,
  onDeletePost,
  onAddComment,
  onCreatePost,
  onApplyOpportunity,
  onShareToChat,
  onViewStory,
  onCreateStory,
  onDismissNotification,
}: FeedViewProps) {
  const perms = getRolePermissions(user.role);

  const defaultKind: FeedKind = perms.canPublishStudentPost
    ? 'estudante'
    : 'anuncio';
  const [composerKind, setComposerKind] = useState<FeedKind>(defaultKind);
  const [composerText, setComposerText] = useState('');
  const [composerCategory, setComposerCategory] = useState('Redes de Computadores');

  // Extra fields when Instituição / Admin creates an opportunity in the feed
  const [oppTitle, setOppTitle] = useState('');
  const [oppType, setOppType] = useState<'Bolsas' | 'Estágios'>('Bolsas');
  const [oppDeadline, setOppDeadline] = useState('20 Dez 2026');

  const [feedFilter, setFeedFilter] = useState<FeedFilter>('Tudo');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showNotifications, setShowNotifications] = useState(true);
  const [expandedImage, setExpandedImage] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const activeNotification = notifications.find((n) => !n.read);
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const visiblePosts = filterUnifiedFeed(posts, feedFilter);

  const handlePublish = (e: FormEvent) => {
    e.preventDefault();
    if (!composerText.trim()) return;

    if (composerKind === 'oportunidade') {
      onCreatePost(
        composerText,
        oppType === 'Bolsas' ? 'Bolsa Académica' : 'Estágio Curricular',
        'oportunidade',
        {
          title: oppTitle.trim() || 'Nova Oportunidade Académica ALÇA',
          organization: user.name,
          type: oppType,
          deadline: oppDeadline.trim() || '20 Dez 2026',
        },
      );
      setOppTitle('');
      setComposerText('');
      return;
    }

    onCreatePost(
      composerText,
      composerKind === 'anuncio' ? `Anúncio · ${perms.roleLabel}` : composerCategory,
      composerKind,
    );
    setComposerText('');
  };

  const handleCommentSubmit = (e: FormEvent, postId: string) => {
    e.preventDefault();
    const text = commentInputs[postId] ?? '';
    if (!text.trim()) return;
    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleShare = (post: PostItem) => {
    onShareToChat(post);
    setShareFeedback(`Publicação de ${post.authorName} partilhada no Chat.`);
    setTimeout(() => setShareFeedback(null), 2600);
  };

  const handleTriggerLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      onLoadMore();
      setIsLoadingMore(false);
    }, 360);
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-10">
      {/* Screen 2 / 3 Soft Periwinkle-to-Porcelain Glass Header */}
      <header className="relative rounded-3xl bg-gradient-to-b from-[#C7D2FE]/85 via-[#E0E7FF]/70 to-white/90 backdrop-blur-xl border border-white/80 shadow-[0_12px_36px_-16px_rgba(79,70,229,0.22)] px-4 pt-4 pb-5 sm:px-6 sm:pt-5">
        <div className="flex items-center justify-between gap-3">
          <div className="lg:hidden">
            <AlcaLogo tone="dark" size="sm" />
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-medium text-indigo-800/85">
              Nível de acesso: {perms.roleLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label={`Notificações (${unreadNotifCount} por ler)`}
            aria-expanded={showNotifications}
            className="relative min-w-[44px] min-h-[44px] rounded-full bg-white/85 hover:bg-white flex items-center justify-center text-slate-800 border border-white shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            )}
          </button>
        </div>

        {/* User Row */}
        <div className="mt-3 flex items-center gap-3">
          <UserAvatar
            name={user.name}
            initials={user.initials}
            avatarKey={user.avatarKey}
            size="md"
          />
          <div className="min-w-0">
            <h1 className="font-display font-bold text-sm sm:text-base text-slate-900 tracking-tight truncate">
              {user.name}
            </h1>
            <p className="text-xs text-slate-600 truncate">
              {perms.roleLabel} · {user.course}
            </p>
          </div>
        </div>

        {/* Search Trigger Bar */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onOpenSearch('')}
            className="w-full h-11 px-4 rounded-2xl bg-white/85 hover:bg-white border border-indigo-200/70 shadow-xs flex items-center gap-3 text-left text-sm text-slate-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Search className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
            <span className="truncate">
              O que há de Programação, Redes ou Bolsas?
            </span>
          </button>
        </div>

        {/* Screen 3 Floating Glass Notification Card */}
        <AnimatePresence>
          {showNotifications && activeNotification && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 glass-popover rounded-2xl p-3.5 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <UserAvatar
                  name={activeNotification.actorName}
                  initials={activeNotification.actorInitials}
                  avatarKey={activeNotification.actorAvatarKey}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900">
                    {activeNotification.actorName}{' '}
                    <span className="font-normal text-slate-600">
                      · {activeNotification.actionText}
                    </span>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                    {activeNotification.previewText}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDismissNotification(activeNotification.id)}
                aria-label="Dispensar notificação"
                className="min-w-[36px] min-h-[36px] -mr-1 -mt-1 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Stories Strip */}
      <StoriesStrip
        stories={stories}
        onViewStory={onViewStory}
        onCreateStory={onCreateStory}
      />

      {/* Role-Aware Dynamic Composer */}
      <form
        onSubmit={handlePublish}
        className="glass-surface rounded-3xl p-4 sm:p-5 space-y-3"
      >
        {(perms.canPublishAnnouncement || perms.canPublishOpportunity) && (
          <div className="flex flex-wrap items-center gap-1.5 pb-1 border-b border-slate-100">
            {perms.canPublishStudentPost && (
              <button
                type="button"
                onClick={() => setComposerKind('estudante')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  composerKind === 'estudante'
                    ? 'bg-[#0A0F44] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Partilha
              </button>
            )}
            {perms.canPublishAnnouncement && (
              <button
                type="button"
                onClick={() => setComposerKind('anuncio')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  composerKind === 'anuncio'
                    ? 'bg-[#0A0F44] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Anúncio Oficial</span>
              </button>
            )}
            {perms.canPublishOpportunity && (
              <button
                type="button"
                onClick={() => setComposerKind('oportunidade')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  composerKind === 'oportunidade'
                    ? 'bg-[#0A0F44] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Nova Bolsa / Estágio</span>
              </button>
            )}
          </div>
        )}

        {composerKind === 'oportunidade' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={oppTitle}
              onChange={(e) => setOppTitle(e.target.value)}
              placeholder="Título da bolsa ou estágio"
              aria-label="Título da bolsa ou estágio"
              className="sm:col-span-2 h-10 px-3 rounded-xl border border-slate-200 bg-white/90 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setOppType('Bolsas')}
                className={`flex-1 h-10 rounded-xl text-xs font-medium border transition-colors ${
                  oppType === 'Bolsas'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Bolsa
              </button>
              <button
                type="button"
                onClick={() => setOppType('Estágios')}
                className={`flex-1 h-10 rounded-xl text-xs font-medium border transition-colors ${
                  oppType === 'Estágios'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Estágio
              </button>
            </div>
            <input
              type="text"
              value={oppDeadline}
              onChange={(e) => setOppDeadline(e.target.value)}
              placeholder="Prazo (ex: 20 Dez 2026)"
              aria-label="Prazo da oportunidade"
              className="sm:col-span-3 h-10 px-3 rounded-xl border border-slate-200 bg-white/90 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        <div className="flex items-start gap-3">
          <UserAvatar
            name={user.name}
            initials={user.initials}
            avatarKey={user.avatarKey}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <label htmlFor="feed-composer" className="sr-only">
              Escreve uma publicação, anúncio ou oportunidade
            </label>
            <textarea
              id="feed-composer"
              rows={2}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder={
                composerKind === 'anuncio'
                  ? 'Escreve um anúncio oficial para estudantes e turmas...'
                  : composerKind === 'oportunidade'
                    ? 'Descreve os benefícios e critérios desta bolsa ou estágio...'
                    : 'Partilha um resumo, dúvida de disciplina ou dica de estudo...'
              }
              className="w-full bg-white/75 hover:bg-white focus:bg-white rounded-2xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200/80 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {composerKind === 'estudante' ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { value: 'Redes de Computadores', label: 'Redes' },
                { value: 'Programação', label: 'Programação' },
                { value: 'Bolsas & Estágios', label: 'Bolsas' },
              ].map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setComposerCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                    composerCategory === cat.value
                      ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-xs text-indigo-700 font-medium">
              {composerKind === 'anuncio'
                ? 'Será fixado como Anúncio Oficial no feed'
                : 'Será publicado no feed e na Biblioteca'}
            </span>
          )}

          <button
            type="submit"
            disabled={!composerText.trim()}
            className="h-10 px-4 rounded-xl bg-[#0A0F44] hover:bg-[#141B66] disabled:opacity-45 text-white text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {composerKind === 'anuncio'
                ? 'Publicar Anúncio'
                : composerKind === 'oportunidade'
                  ? 'Publicar Vaga'
                  : 'Publicar'}
            </span>
          </button>
        </div>
      </form>

      {/* Unified Feed Segmented Filter */}
      <nav
        aria-label="Filtrar feed principal"
        className="glass-surface rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar"
      >
        {FEED_FILTERS.map((filter) => {
          const active = feedFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setFeedFilter(filter)}
              aria-pressed={active}
              className={`flex-1 min-h-[40px] px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                active
                  ? 'bg-[#0A0F44] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </nav>

      {shareFeedback && (
        <div
          role="status"
          className="glass-popover rounded-2xl px-4 py-3 text-xs font-medium text-indigo-900"
        >
          {shareFeedback}
        </div>
      )}

      {/* Aggregated Dynamic Feed */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {visiblePosts.map((post, idx) => {
            const isCommentsOpen = openCommentsPostId === post.id;
            const linkedOpp = post.opportunityId
              ? opportunities.find((o) => o.id === post.opportunityId)
              : undefined;

            const surfaceClass =
              post.kind === 'anuncio'
                ? 'bg-gradient-to-br from-indigo-50/85 via-white/85 to-white/90 backdrop-blur-xl border border-indigo-200/75 shadow-[0_10px_32px_-12px_rgba(79,70,229,0.14)]'
                : post.kind === 'oportunidade'
                  ? 'bg-gradient-to-br from-sky-50/85 via-white/85 to-white/90 backdrop-blur-xl border border-sky-200/75 shadow-[0_10px_32px_-12px_rgba(14,165,233,0.12)]'
                  : 'glass-surface';

            return (
              <motion.article
                key={post.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  duration: 0.24,
                  delay: Math.min(idx * 0.04, 0.2),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`${surfaceClass} rounded-3xl p-4 sm:p-5 space-y-3.5`}
              >
                {/* Kind Kicker for Announcements and Opportunities */}
                {(post.kind === 'anuncio' ||
                  post.kind === 'oportunidade' ||
                  post.pinned) && (
                  <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                    <span className="inline-flex items-center gap-1.5 text-indigo-700">
                      {post.kind === 'anuncio' ? (
                        <Megaphone className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : post.kind === 'oportunidade' ? (
                        <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <Pin className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span>
                        {post.pinned ? 'Fixado · ' : ''}
                        {post.kind === 'anuncio'
                          ? 'Anúncio Académico'
                          : post.kind === 'oportunidade'
                            ? 'Oportunidade Verificada'
                            : 'Em Destaque'}
                      </span>
                    </span>

                    {perms.canPinAndModerate && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onTogglePin(post.id)}
                          aria-label={
                            post.pinned
                              ? `Desafixar publicação de ${post.authorName}`
                              : `Fixar publicação de ${post.authorName}`
                          }
                          className="px-2 py-1 rounded-lg text-[11px] font-medium text-indigo-700 hover:bg-indigo-100/70 transition-colors"
                        >
                          {post.pinned ? 'Desafixar' : 'Fixar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeletePost(post.id)}
                          aria-label={`Moderar e remover publicação de ${post.authorName}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Post Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      name={post.authorName}
                      initials={post.authorInitials}
                      avatarKey={post.authorAvatarKey}
                      size="md"
                    />
                    <div className="min-w-0">
                      <h2 className="text-sm font-display font-semibold text-slate-900 truncate">
                        {post.authorName}
                      </h2>
                      <p className="text-xs text-slate-500 truncate">
                        {post.category} · {post.timestamp}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleBookmark(post.id)}
                    aria-label={
                      post.bookmarked
                        ? `Remover publicação de ${post.authorName} dos guardados`
                        : `Guardar publicação de ${post.authorName}`
                    }
                    aria-pressed={post.bookmarked}
                    className={`min-w-[44px] min-h-[44px] -mr-2 -mt-1 rounded-full flex items-center justify-center transition-colors ${
                      post.bookmarked
                        ? 'text-indigo-700 bg-indigo-50'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Bookmark
                      className="w-4 h-4"
                      fill={post.bookmarked ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                {/* Post Copy */}
                <p className="text-sm sm:text-[15px] leading-relaxed text-slate-800">
                  {post.content}
                </p>

                {/* Linked Opportunity Action Box inside Feed */}
                {linkedOpp && (
                  <div className="rounded-2xl bg-white/85 border border-sky-200/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-display font-semibold text-slate-900 truncate">
                        {linkedOpp.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {linkedOpp.organization} · {linkedOpp.modality} · Prazo{' '}
                        {linkedOpp.deadline}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={onOpenOpportunities}
                        className="h-9 px-3 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
                      >
                        Ver detalhes
                      </button>
                      <button
                        type="button"
                        onClick={() => onApplyOpportunity(linkedOpp.id)}
                        disabled={linkedOpp.applied}
                        className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                          linkedOpp.applied
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-[#0A0F44] hover:bg-[#141B66] text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {linkedOpp.applied ? 'Candidatura enviada' : 'Candidatar'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Post Media */}
                {post.mediaKey && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200/70 bg-slate-100 group">
                    <img
                      src={MEDIA_ASSETS[post.mediaKey]}
                      alt={
                        post.mediaVariant === 'mapa'
                          ? `Mapa de estudo partilhado por ${post.authorName}`
                          : `Imagem partilhada por ${post.authorName}`
                      }
                      referrerPolicy="no-referrer"
                      className="w-full max-h-72 object-cover"
                    />
                    {post.mediaVariant === 'mapa' && (
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end justify-between p-4">
                        <div>
                          <p className="font-display font-bold text-white text-lg tracking-wide">
                            MAPA
                          </p>
                          <p className="text-xs text-slate-200">
                            Esquema visual de revisão académica
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedImage({
                              src: MEDIA_ASSETS[post.mediaKey!],
                              title: `Mapa de Estudo · ${post.authorName}`,
                            })
                          }
                          aria-label="Expandir mapa de estudo"
                          className="min-w-[44px] min-h-[44px] px-3 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Expandir</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Row */}
                <div className="pt-1 border-t border-slate-100/90 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleLike(post.id)}
                      aria-label={`Gostar da publicação de ${post.authorName}`}
                      aria-pressed={post.likedByMe}
                      className={`min-h-[44px] px-3 rounded-xl flex items-center gap-1.5 text-xs font-medium tabular-nums transition-colors ${
                        post.likedByMe
                          ? 'text-rose-600 bg-rose-50/80'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={post.likedByMe ? 'currentColor' : 'none'}
                      />
                      <span>{post.likes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setOpenCommentsPostId((prev) =>
                          prev === post.id ? null : post.id,
                        )
                      }
                      aria-label={`Comentar publicação de ${post.authorName}`}
                      aria-expanded={isCommentsOpen}
                      className="min-h-[44px] px-3 rounded-xl flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 tabular-nums transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments.length}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShare(post)}
                      aria-label={`Partilhar publicação de ${post.authorName} no Chat`}
                      className="min-h-[44px] px-3 rounded-xl flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 tabular-nums transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{post.shares}</span>
                    </button>
                  </div>

                  <span className="text-xs text-slate-400 hidden sm:inline truncate">
                    {post.authorCourse}
                  </span>
                </div>

                {/* Inline Comments */}
                <AnimatePresence>
                  {isCommentsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 space-y-3 overflow-hidden"
                    >
                      {post.comments.length > 0 ? (
                        <ul className="space-y-2">
                          {post.comments.map((c) => (
                            <li
                              key={c.id}
                              className="rounded-2xl bg-slate-50/90 px-3.5 py-2.5 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-slate-900">
                                  {c.authorName}
                                </span>
                                <span className="text-slate-400">{c.timestamp}</span>
                              </div>
                              <p className="text-slate-700 mt-1 leading-relaxed">
                                {c.text}
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500 px-1">
                          Ainda sem comentários. Sê o primeiro a contribuir!
                        </p>
                      )}

                      <form
                        onSubmit={(e) => handleCommentSubmit(e, post.id)}
                        className="flex items-center gap-2"
                      >
                        <label htmlFor={`comment-${post.id}`} className="sr-only">
                          Escrever comentário
                        </label>
                        <input
                          id={`comment-${post.id}`}
                          type="text"
                          value={commentInputs[post.id] ?? ''}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          placeholder="Adicionar comentário construtivo..."
                          className="flex-1 h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          Enviar
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Dynamic Load More with Custom Shimmer Animation */}
      {hasMoreItems && (
        <div className="space-y-3">
          {isLoadingMore ? (
            <div className="glass-surface rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full shimmer-block" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-36 rounded shimmer-block" />
                  <div className="h-2.5 w-24 rounded shimmer-block" />
                </div>
              </div>
              <div className="h-3 w-full rounded shimmer-block" />
              <div className="h-3 w-2/3 rounded shimmer-block" />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleTriggerLoadMore}
              className="w-full h-12 glass-surface hover:bg-white/95 rounded-2xl text-xs font-display font-semibold text-indigo-900 flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              <span>Carregar mais anúncios e oportunidades</span>
            </button>
          )}
        </div>
      )}

      {/* Expanded Media Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={expandedImage.title}
          >
            <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden bg-white shadow-2xl">
              <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
                <p className="font-display font-semibold text-sm text-slate-900">
                  {expandedImage.title}
                </p>
                <button
                  type="button"
                  onClick={() => setExpandedImage(null)}
                  aria-label="Fechar imagem expandida"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={expandedImage.src}
                alt={expandedImage.title}
                referrerPolicy="no-referrer"
                className="w-full max-h-[75vh] object-contain bg-slate-50"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
