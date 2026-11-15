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
      indigo: 'from-indigo-100 to-slate-100 text-indigo-700',
      sky: 'from-sky-100 to-indigo-50 text-sky-700',
      teal: 'from-teal-100 to-emerald-50 text-teal-700',
      violet: 'from-violet-100 to-indigo-50 text-violet-700',
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
        className={`w-full h-full bg-gradient-to-br ${toneClasses[article.thumbTone]} flex items-center justify-center`}
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
              className="min-w-[44px] min-h-[44px] -ml-1.5 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display font-bold text-lg text-slate-900">
              Pesquisar
            </h1>
          </div>
          <div className="lg:hidden">
            <AlcaLogo tone="dark" size="sm" />
          </div>
        </div>

        {/* Search Input + Clear + Filter Funnel Button (Screen 4 & 5) */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
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
              className="w-full h-12 pl-10 pr-10 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                aria-label="Limpar pesquisa"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
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
            className={`min-w-[48px] h-12 rounded-2xl border flex items-center justify-center transition-colors ${
              filterOpen || activeCategory !== 'Tudo' || onlySaved
                ? 'bg-[#0A0F44] text-white border-[#0A0F44]'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
                  <span className="text-xs font-display font-semibold text-slate-900">
                    Filtrar por área ou oportunidade
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilterOpen(false)}
                    aria-label="Fechar painel de filtros"
                    className="min-w-[32px] min-h-[32px] rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
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
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setOnlySaved((prev) => !prev)}
                    aria-pressed={onlySaved}
                    className={`min-h-[40px] px-3 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors ${
                      onlySaved
                        ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        : 'text-slate-600 hover:bg-slate-100'
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
                    className="text-xs font-medium text-slate-500 hover:text-slate-900 px-2 py-1"
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
                  ? 'bg-[#0A0F44] text-white'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
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
            <h2 className="font-display font-bold text-base text-slate-900">
              Destaques
            </h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {filteredArticles.length} conteúdos
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="py-3.5 first:pt-1 last:pb-1 flex items-start gap-3.5 group"
              >
                <button
                  type="button"
                  onClick={() => setSelectedArticle(article)}
                  className="flex-1 min-w-0 flex items-start gap-3.5 text-left rounded-2xl p-1 -m-1 hover:bg-indigo-50/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200/70 bg-slate-50">
                    {getToneVisual(article)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-semibold text-sm text-slate-900 group-hover:text-indigo-800 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {article.snippet}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1.5">
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
                      ? 'text-indigo-700 bg-indigo-50'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
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
            <h2 className="font-display font-bold text-base text-slate-900">
              Bolsas & Estágios
            </h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {filteredOpportunities.length} oportunidades
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 flex flex-col justify-between gap-3 hover:border-indigo-300/80 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-indigo-700">
                        {opp.type} · Prazo {opp.deadline}
                      </p>
                      <h3 className="font-display font-semibold text-sm text-slate-900 mt-0.5">
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
                          ? 'text-indigo-700 bg-indigo-50'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Bookmark
                        className="w-4 h-4"
                        fill={opp.bookmarked ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>
                  <p className="text-xs text-slate-500">
                    {opp.organization} · {opp.modality}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOpportunity(opp)}
                    className="min-h-[40px] px-3 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Ver requisitos
                  </button>

                  <button
                    type="button"
                    onClick={() => onApplyOpportunity(opp.id)}
                    disabled={opp.applied}
                    className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      opp.applied
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#0A0F44] hover:bg-[#141B66] text-white'
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
          <p className="font-display font-semibold text-base text-slate-900">
            Nenhum conteúdo encontrado para esta pesquisa
          </p>
          <p className="text-sm text-slate-500">
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
            className="h-11 px-5 rounded-xl bg-[#0A0F44] text-white text-xs font-semibold hover:bg-[#141B66] transition-colors"
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
                  <p className="text-xs font-medium text-indigo-700">
                    {selectedArticle.category} · {selectedArticle.readTime}
                  </p>
                  <h2 className="font-display font-bold text-xl text-slate-900 mt-1">
                    {selectedArticle.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Por {selectedArticle.author}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  aria-label="Fechar artigo"
                  className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-slate-700">
                {selectedArticle.fullSummary.map((para, index) => (
                  <p key={index}>{para}</p>
                ))}
              </div>

              <div className="rounded-2xl bg-indigo-50/80 border border-indigo-100 p-4">
                <p className="text-xs font-semibold text-indigo-900">
                  Resumo-chave para revisão
                </p>
                <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
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
                  className="h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center gap-2"
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
                  <p className="text-xs font-medium text-indigo-700">
                    {selectedOpportunity.type} · {selectedOpportunity.organization}
                  </p>
                  <h2 className="font-display font-bold text-xl text-slate-900 mt-1">
                    {selectedOpportunity.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedOpportunity.modality} · Prazo: {selectedOpportunity.deadline}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOpportunity(null)}
                  aria-label="Fechar detalhes da oportunidade"
                  className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                {selectedOpportunity.description}
              </p>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-900">
                  Requisitos principais
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4">
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
                  className="h-11 px-5 rounded-xl bg-[#0A0F44] hover:bg-[#141B66] disabled:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
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
