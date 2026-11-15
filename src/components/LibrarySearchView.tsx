import { useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Cpu,
  Filter,
  Globe,
  Network,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type {
  ArticleItem,
  FilterCategory,
  OpportunityItem,
} from '../types/alca';
import { AlcaLogo } from './AlcaLogo';
import { filterLibraryContent } from '../utils/alcaLogic';
import { MEDIA_ASSETS } from '../utils/mediaAssets';

interface LibrarySearchViewProps {
  articles: ArticleItem[];
  opportunities: OpportunityItem[];
  query: string;
  onQueryChange: (val: string) => void;
  activeCategory: FilterCategory;
  onCategoryChange: (cat: FilterCategory) => void;
  onBackToFeed: () => void;
  onToggleArticleBookmark: (id: string) => void;
  onToggleOpportunityBookmark: (id: string) => void;
  onApplyOpportunity: (id: string) => void;
}

const FILTER_OPTIONS: FilterCategory[] = [
  'Tudo',
  'Redes',
  'Programação',
  'Bases de Dados',
  'Bolsas',
  'Estágios',
];

export function LibrarySearchView({
  articles,
  opportunities,
  query,
  onQueryChange,
  activeCategory,
  onCategoryChange,
  onBackToFeed,
  onToggleArticleBookmark,
  onToggleOpportunityBookmark,
  onApplyOpportunity,
}: LibrarySearchViewProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(
    null,
  );
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<OpportunityItem | null>(null);

  const { articles: filteredArticles, opportunities: filteredOpportunities } =
    filterLibraryContent(
      articles,
      opportunities,
      query,
      activeCategory,
      onlySaved,
    );

  const getToneVisual = (article: ArticleItem) => {
    if (article.thumbKey) {
      return (
        <img
          src={MEDIA_ASSETS[article.thumbKey]}
          alt={article.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      );
    }
    const toneClasses = {
      indigo:
        'from-indigo-100 to-slate-100 dark:from-indigo-950 dark:to-slate-900 text-indigo-700 dark:text-indigo-300',
      sky: 'from-sky-100 to-indigo-50 dark:from-sky-950 dark:to-indigo-950 text-sky-700 dark:text-sky-300',
      teal: 'from-teal-100 to-emerald-50 dark:from-teal-950 dark:to-emerald-950 text-teal-700 dark:text-teal-300',
      violet:
        'from-violet-100 to-indigo-50 dark:from-violet-950 dark:to-indigo-950 text-violet-700 dark:text-violet-300',
    };
    const Icon =
      article.id.includes('wifi')
        ? ShieldCheck
        : article.id.includes('dns')
          ? Globe
          : article.id.includes('ip')
            ? Network
            : article.category === 'Programação'
              ? Cpu
              : BookOpen;

    return (
      <div
        className={`w-full h-full bg-gradient-to-br ${toneClasses[article.thumbTone]} flex items-center justify-center transition-colors duration-300`}
      >
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-10 relative">
      {/* Screen 4 Header: Back + Pesquisar + ALÇA */}
      <header className="glass-surface rounded-3xl p-4 sm:p-5 space-y-4 relative z-20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToFeed}
              aria-label="Voltar ao Início"
              className="min-w-[44px] min-h-[44px] -ml-1.5 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
              Pesquisar
            </h1>
          </div>
          <div className="lg:hidden">
            <AlcaLogo tone="auto" size="sm" />
          </div>
        </div>

        {/* Search Input + Clear + Filter Funnel Button (Screen 4 & 5) */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <label htmlFor="library-search-input" className="sr-only">
              Pesquisar artigos académicos, redes, bolsas e estágios
            </label>
            <input
              id="library-search-input"
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Redes de Computadores, IP, Bolsas..."
              className="w-full h-12 pl-10 pr-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all duration-300"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                aria-label="Limpar pesquisa"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setFilterOpen((prev) => !prev)}
            aria-label="Abrir filtros de pesquisa"
            aria-expanded={filterOpen}
            className={`min-w-[48px] h-12 rounded-2xl border flex items-center justify-center transition-colors duration-300 ${
              filterOpen || activeCategory !== 'Tudo' || onlySaved
                ? 'bg-[#0A0F44] dark:bg-indigo-500 text-white border-[#0A0F44] dark:border-indigo-500'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Screen 5 Frosted Glass Filter Popover */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-14 w-full sm:w-80 glass-popover rounded-3xl p-4 z-30 space-y-3"
                role="dialog"
                aria-label="Filtros da biblioteca"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-semibold text-slate-900 dark:text-slate-100">
                    Filtrar por área ou oportunidade
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilterOpen(false)}
                    aria-label="Fechar painel de filtros"
                    className="min-w-[32px] min-h-[32px] rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {FILTER_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        onCategoryChange(cat);
                        setFilterOpen(false);
                      }}
                      className={`min-h-[40px] px-3 rounded-xl text-xs font-medium text-left transition-colors ${
                        activeCategory === cat
                          ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                          : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setOnlySaved((prev) => !prev)}
                    aria-pressed={onlySaved}
                    className={`min-h-[40px] px-3 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${
                      onlySaved
                        ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/40'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Apenas guardados</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onCategoryChange('Tudo');
                      setOnlySaved(false);
                      onQueryChange('');
                      setFilterOpen(false);
                    }}
                    className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-2 py-1"
                  >
                    Limpar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Segmented Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {FILTER_OPTIONS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                activeCategory === cat
                  ? 'bg-[#0A0F44] dark:bg-indigo-500 text-white'
                  : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Invisible click-away layer when filter popover is open */}
      {filterOpen && (
        <div
          aria-hidden="true"
          onClick={() => setFilterOpen(false)}
          className="fixed inset-0 z-10"
        />
      )}

      <div
        className={`space-y-5 transition-all duration-200 ${
          filterOpen ? 'blur-[2px] opacity-55 pointer-events-none select-none' : ''
        }`}
      >
      {/* Destaques: Academic Study Articles (Screen 4) */}
      {filteredArticles.length > 0 && (
        <section className="glass-surface rounded-3xl p-4 sm:p-5 space-y-3">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
              Destaques
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {filteredArticles.length} conteúdos
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="py-3.5 first:pt-1 last:pb-1 flex items-start gap-3.5 group"
              >
                <button
                  type="button"
                  onClick={() => setSelectedArticle(article)}
                  className="flex-1 min-w-0 flex items-start gap-3.5 text-left rounded-2xl p-1 -m-1 hover:bg-indigo-50/40 dark:hover:bg-indigo-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200/70 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800">
                    {getToneVisual(article)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-800 dark:group-hover:text-indigo-300 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {article.snippet}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                      {article.category} · {article.readTime} · {article.author}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleArticleBookmark(article.id)}
                  aria-label={
                    article.bookmarked
                      ? `Remover ${article.title} dos guardados`
                      : `Guardar artigo ${article.title}`
                  }
                  aria-pressed={article.bookmarked}
                  className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    article.bookmarked
                      ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Bookmark
                    className="w-4 h-4"
                    fill={article.bookmarked ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bolsas & Estágios Section */}
      {filteredOpportunities.length > 0 && (
        <section className="glass-surface rounded-3xl p-4 sm:p-5 space-y-3.5">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
              Bolsas & Estágios
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {filteredOpportunities.length} oportunidades
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-700/70 bg-white/85 dark:bg-slate-800/65 p-4 flex flex-col justify-between gap-3 hover:border-indigo-300/80 dark:hover:border-indigo-500/40 transition-colors duration-300"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
                        {opp.type} · Prazo {opp.deadline}
                      </p>
                      <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                        {opp.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleOpportunityBookmark(opp.id)}
                      aria-label={
                        opp.bookmarked
                          ? `Remover ${opp.title} dos guardados`
                          : `Guardar ${opp.title}`
                      }
                      aria-pressed={opp.bookmarked}
                      className={`min-w-[40px] min-h-[40px] -mt-1 -mr-1 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        opp.bookmarked
                          ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Bookmark
                        className="w-4 h-4"
                        fill={opp.bookmarked ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {opp.organization} · {opp.modality}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOpportunity(opp)}
                    className="min-h-[40px] px-3 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors"
                  >
                    Ver requisitos
                  </button>

                  <button
                    type="button"
                    onClick={() => onApplyOpportunity(opp.id)}
                    disabled={opp.applied}
                    className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      opp.applied
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-[#0A0F44] dark:bg-indigo-500 hover:bg-[#141B66] dark:hover:bg-indigo-400 text-white'
                    }`}
                  >
                    {opp.applied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Candidatura enviada</span>
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Candidatar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {filteredArticles.length === 0 && filteredOpportunities.length === 0 && (
        <div className="glass-surface rounded-3xl p-8 text-center space-y-3">
          <p className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
            Nenhum conteúdo encontrado para esta pesquisa
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Experimenta limpar os filtros ou pesquisar por termos como IP, DNS,
            Wi-Fi ou Bolsa.
          </p>
          <button
            type="button"
            onClick={() => {
              onQueryChange('');
              onCategoryChange('Tudo');
              setOnlySaved(false);
            }}
            className="h-11 px-5 rounded-xl bg-[#0A0F44] dark:bg-indigo-500 text-white text-xs font-semibold hover:bg-[#141B66] dark:hover:bg-indigo-400 transition-colors"
          >
            Mostrar todos os destaques
          </button>
        </div>
      )}
      </div>

      {/* Article Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={selectedArticle.title}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              className="w-full max-w-lg glass-popover rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    {selectedArticle.category} · {selectedArticle.readTime}
                  </p>
                  <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 mt-1">
                    {selectedArticle.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Por {selectedArticle.author}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  aria-label="Fechar artigo"
                  className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedArticle.fullSummary.map((para, index) => (
                  <p key={index}>{para}</p>
                ))}
              </div>

              <div className="rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-500/30 p-4">
                <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  Resumo-chave para revisão
                </p>
                <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-1 leading-relaxed">
                  {selectedArticle.keyTakeaway}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onToggleArticleBookmark(selectedArticle.id);
                    setSelectedArticle((prev) =>
                      prev ? { ...prev, bookmarked: !prev.bookmarked } : null,
                    );
                  }}
                  className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors"
                >
                  <Bookmark
                    className="w-4 h-4"
                    fill={selectedArticle.bookmarked ? 'currentColor' : 'none'}
                  />
                  <span>
                    {selectedArticle.bookmarked ? 'Guardado' : 'Guardar na Biblioteca'}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opportunity Details Modal */}
      <AnimatePresence>
        {selectedOpportunity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={selectedOpportunity.title}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              className="w-full max-w-lg glass-popover rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    {selectedOpportunity.type} · {selectedOpportunity.organization}
                  </p>
                  <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 mt-1">
                    {selectedOpportunity.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {selectedOpportunity.modality} · Prazo: {selectedOpportunity.deadline}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOpportunity(null)}
                  aria-label="Fechar detalhes da oportunidade"
                  className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedOpportunity.description}
              </p>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Requisitos principais
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4">
                  {selectedOpportunity.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onApplyOpportunity(selectedOpportunity.id);
                    setSelectedOpportunity((prev) =>
                      prev ? { ...prev, applied: true } : null,
                    );
                  }}
                  disabled={selectedOpportunity.applied}
                  className="h-11 px-5 rounded-xl bg-[#0A0F44] dark:bg-indigo-500 hover:bg-[#141B66] dark:hover:bg-indigo-400 disabled:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {selectedOpportunity.applied
                      ? 'Candidatura registada'
                      : 'Enviar candidatura académica'}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
