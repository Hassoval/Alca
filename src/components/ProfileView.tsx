import { useState } from 'react';
import {
  Bookmark,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import type {
  ArticleItem,
  DemoAccount,
  OpportunityItem,
  PostItem,
  UserProfile,
} from '../types/alca';
import { DEMO_ACCOUNTS } from '../data/seedData';
import { getRolePermissions } from '../utils/alcaLogic';
import { ThemeToggle } from './ThemeToggle';
import { UserAvatar } from './UserAvatar';

interface ProfileViewProps {
  user: UserProfile;
  posts: PostItem[];
  articles: ArticleItem[];
  opportunities: OpportunityItem[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenLibrary: () => void;
  onSwitchAccount: (account: DemoAccount) => void;
}

export function ProfileView({
  user,
  posts,
  articles,
  opportunities,
  theme,
  onToggleTheme,
  onLogout,
  onOpenLibrary,
  onSwitchAccount,
}: ProfileViewProps) {
  const [tab, setTab] = useState<'guardados' | 'candidaturas' | 'publicacoes'>(
    'guardados',
  );

  const perms = getRolePermissions(user.role);
  const savedArticles = articles.filter((a) => a.bookmarked);
  const savedPosts = posts.filter((p) => p.bookmarked);
  const appliedOpps = opportunities.filter((o) => o.applied);
  const myPosts = posts.filter((p) => p.authorName === user.name);

  return (
    <div className="space-y-5 pb-24 lg:pb-10">
      <section className="glass-surface rounded-3xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={user.name}
              initials={user.initials}
              avatarKey={user.avatarKey}
              size="xl"
            />
            <div>
              <h1 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100">
                {user.name}
              </h1>
              <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mt-0.5">
                {perms.roleLabel} · {user.course}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user.university} · {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} showLabel />
            <button
              type="button"
              onClick={onLogout}
              className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors duration-300"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Terminar Sessão</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {user.bio}
        </p>

        {/* Active RBAC Permissions Summary */}
        <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/60 border border-indigo-100/90 dark:border-indigo-500/30 p-3.5 space-y-1.5 transition-colors duration-300">
          <p className="text-xs font-display font-semibold text-indigo-950 dark:text-indigo-100 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <span>Permissões deste nível de acesso ({perms.roleLabel})</span>
          </p>
          <p className="text-xs text-indigo-900/85 dark:text-indigo-200/85 leading-relaxed">
            {[
              perms.canPublishStudentPost && 'Publicar no feed social',
              perms.canPublishAnnouncement && 'Publicar e fixar anúncios oficiais',
              perms.canPublishOpportunity && 'Criar bolsas e estágios',
              perms.canPinAndModerate && 'Moderar publicações',
              perms.canReviewApplications && 'Acompanhar candidaturas',
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        {/* Clean Tabular Summary */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-2xl bg-white/75 dark:bg-slate-800/70 border border-white dark:border-slate-700/70 p-3 text-center transition-colors duration-300">
            <p className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 tabular-nums">
              {savedArticles.length + savedPosts.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Guardados</p>
          </div>
          <div className="rounded-2xl bg-white/75 dark:bg-slate-800/70 border border-white dark:border-slate-700/70 p-3 text-center transition-colors duration-300">
            <p className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 tabular-nums">
              {appliedOpps.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Candidaturas</p>
          </div>
          <div className="rounded-2xl bg-white/75 dark:bg-slate-800/70 border border-white dark:border-slate-700/70 p-3 text-center transition-colors duration-300">
            <p className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 tabular-nums">
              {myPosts.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Publicações</p>
          </div>
        </div>
      </section>

      {/* Quick Role Switcher for Testing All 4 Access Levels */}
      <section className="glass-surface rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">
            Alternar Nível de Acesso (Teste Rápido)
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">4 perfis</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DEMO_ACCOUNTS.map((acc) => {
            const accPerms = getRolePermissions(acc.role);
            const active = user.role === acc.role;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => onSwitchAccount(acc)}
                className={`min-h-[44px] px-3 py-2 rounded-2xl text-left border transition-all duration-300 ${
                  active
                    ? 'bg-[#0A0F44] dark:bg-indigo-500 text-white border-[#0A0F44] dark:border-indigo-500'
                    : 'bg-white/80 dark:bg-slate-800/75 hover:bg-indigo-50/70 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <span className="block text-xs font-semibold truncate">
                  {accPerms.roleLabel}
                </span>
                <span
                  className={`block text-[10px] truncate mt-0.5 ${
                    active ? 'text-indigo-200 dark:text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {acc.email}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Profile Content Tabs */}
      <section className="glass-surface rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl transition-colors duration-300">
          {[
            { id: 'guardados', label: 'Guardados' },
            {
              id: 'candidaturas',
              label: perms.canReviewApplications
                ? 'Candidaturas Recebidas'
                : 'Candidaturas',
            },
            { id: 'publicacoes', label: 'Minhas Partilhas' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setTab(
                  item.id as 'guardados' | 'candidaturas' | 'publicacoes',
                )
              }
              className={`flex-1 min-h-[40px] px-3 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                tab === item.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'guardados' && (
          <div className="space-y-2.5">
            {savedArticles.length === 0 && savedPosts.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Ainda não guardaste artigos ou mapas mentais.
                </p>
                <button
                  type="button"
                  onClick={onOpenLibrary}
                  className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:underline"
                >
                  Explorar Biblioteca ALÇA
                </button>
              </div>
            ) : (
              <>
                {savedArticles.map((art) => (
                  <div
                    key={art.id}
                    className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-800/70 p-3.5 flex items-center justify-between gap-3 transition-colors duration-300"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                        Artigo · {art.category}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {art.title}
                      </p>
                    </div>
                    <Bookmark
                      className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0"
                      fill="currentColor"
                    />
                  </div>
                ))}
                {savedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-800/70 p-3.5 flex items-center justify-between gap-3 transition-colors duration-300"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Publicação de {post.authorName}
                      </p>
                      <p className="text-sm text-slate-800 dark:text-slate-200 truncate">
                        {post.content}
                      </p>
                    </div>
                    <Bookmark
                      className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0"
                      fill="currentColor"
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab === 'candidaturas' && (
          <div className="space-y-2.5">
            {appliedOpps.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <GraduationCap
                  className="w-6 h-6 text-slate-400 dark:text-slate-500 mx-auto"
                  aria-hidden="true"
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {perms.canReviewApplications
                    ? 'Nenhuma candidatura submetida nesta sessão ainda.'
                    : 'Nenhuma candidatura submetida ainda.'}
                </p>
                <button
                  type="button"
                  onClick={onOpenLibrary}
                  className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:underline"
                >
                  Ver Bolsas & Estágios abertos
                </button>
              </div>
            ) : (
              appliedOpps.map((opp) => (
                <div
                  key={opp.id}
                  className="rounded-2xl border border-emerald-200/80 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/40 p-3.5 flex items-center justify-between gap-3 transition-colors duration-300"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {perms.canReviewApplications
                          ? `Candidatura recebida · ${opp.organization}`
                          : `Candidatura enviada · ${opp.organization}`}
                      </span>
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                      {opp.title}
                    </p>
                  </div>
                  <Briefcase className="w-4 h-4 text-emerald-700 dark:text-emerald-300 shrink-0" />
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'publicacoes' && (
          <div className="space-y-2.5">
            {myPosts.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                As publicações que criares no feed vão aparecer aqui.
              </p>
            ) : (
              myPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-800/70 p-3.5 space-y-1 transition-colors duration-300"
                >
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {post.category} · {post.timestamp}
                  </p>
                  <p className="text-sm text-slate-800 dark:text-slate-200">
                    {post.content}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
