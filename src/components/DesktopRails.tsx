import {
  BookOpen,
  Briefcase,
  Home,
  MessageCircle,
  Search,
  User,
} from 'lucide-react';
import type {
  AppTab,
  ChatThread,
  OpportunityItem,
  UserProfile,
} from '../types/alca';
import { getRolePermissions } from '../utils/alcaLogic';
import { AlcaLogo } from './AlcaLogo';
import { UserAvatar } from './UserAvatar';

interface DesktopLeftRailProps {
  activeTab: AppTab;
  unreadMessages: number;
  user: UserProfile;
  onChangeTab: (tab: AppTab) => void;
}

export function DesktopLeftRail({
  activeTab,
  unreadMessages,
  user,
  onChangeTab,
}: DesktopLeftRailProps) {
  const perms = getRolePermissions(user.role);

  const navItems: {
    id: AppTab;
    label: string;
    icon: typeof Home;
    badge?: number;
  }[] = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageCircle, badge: unreadMessages },
    { id: 'biblioteca', label: 'Biblioteca', icon: BookOpen },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  return (
    <aside className="hidden lg:flex lg:col-span-3 flex-col justify-between sticky top-6 h-[calc(100vh-3rem)] glass-surface rounded-3xl p-5">
      <div className="space-y-7">
        <div className="px-2">
          <AlcaLogo tone="dark" size="md" />
          <p className="text-xs text-slate-500 mt-1.5">
            Vida académica conectada
          </p>
        </div>

        <nav aria-label="Navegação principal" className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`w-full min-h-[46px] px-3.5 rounded-2xl flex items-center justify-between text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#0A0F44] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-950'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center tabular-nums ${
                      active
                        ? 'bg-white text-[#0A0F44]'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={() => onChangeTab('perfil')}
        className="w-full rounded-2xl bg-white/75 hover:bg-indigo-50/60 border border-white/80 shadow-xs p-3 flex items-center gap-3 text-left transition-colors"
      >
        <UserAvatar
          name={user.name}
          initials={user.initials}
          avatarKey={user.avatarKey}
          size="sm"
        />
        <div className="min-w-0">
          <p className="text-xs font-display font-semibold text-slate-900 truncate">
            {user.name}
          </p>
          <p className="text-[11px] text-indigo-700 font-medium truncate">
            {perms.roleLabel} · {user.course}
          </p>
        </div>
      </button>
    </aside>
  );
}

interface DesktopRightRailProps {
  opportunities: OpportunityItem[];
  threads: ChatThread[];
  onQuickSearch: (query: string) => void;
  onOpenOpportunities: () => void;
  onOpenThread: (threadId: string) => void;
}

export function DesktopRightRail({
  opportunities,
  threads,
  onQuickSearch,
  onOpenOpportunities,
  onOpenThread,
}: DesktopRightRailProps) {
  return (
    <aside className="hidden xl:flex xl:col-span-3 flex-col gap-5 sticky top-6 h-fit">
      {/* Quick Search Widget */}
      <div className="glass-surface rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-sm text-slate-900">
            Pesquisa Rápida
          </h2>
          <Search className="w-4 h-4 text-indigo-600" aria-hidden="true" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['Roteador vs. Switch', 'Endereço IP', 'DNS', 'Cabo UTP'].map(
            (topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => onQuickSearch(topic)}
                className="px-3 py-1.5 rounded-xl bg-white/75 hover:bg-indigo-50 hover:text-indigo-800 border border-white/80 text-xs font-medium text-slate-700 transition-colors"
              >
                {topic}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Bolsas & Estágios Highlights */}
      <div className="glass-surface rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-sm text-slate-900">
            Bolsas & Estágios
          </h2>
          <button
            type="button"
            onClick={onOpenOpportunities}
            className="text-xs font-medium text-indigo-700 hover:underline"
          >
            Ver tudo
          </button>
        </div>
        <div className="space-y-2.5">
          {opportunities.slice(0, 2).map((opp) => (
            <button
              key={opp.id}
              type="button"
              onClick={onOpenOpportunities}
              className="w-full text-left rounded-2xl bg-white/75 hover:bg-indigo-50/50 border border-white/80 p-3 space-y-1 transition-colors"
            >
              <p className="text-[11px] font-medium text-indigo-700 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" aria-hidden="true" />
                <span>{opp.type} · {opp.deadline}</span>
              </p>
              <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                {opp.title}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {opp.organization}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Chat Jump */}
      <div className="glass-surface rounded-3xl p-4 space-y-3">
        <h2 className="font-display font-semibold text-sm text-slate-900">
          Conversas da Turma
        </h2>
        <div className="space-y-1.5">
          {threads.slice(0, 3).map((th) => (
            <button
              key={th.id}
              type="button"
              onClick={() => onOpenThread(th.id)}
              className="w-full rounded-2xl px-2.5 py-2 hover:bg-indigo-50/50 flex items-center justify-between gap-2 text-left transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {th.title}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {th.messages.at(-1)?.text ?? th.subtitle}
                </p>
              </div>
              {th.unreadCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                  {th.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
