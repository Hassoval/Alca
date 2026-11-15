import { useState, type FormEvent } from 'react';
import { Plus, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { StoryItem } from '../types/alca';
import { UserAvatar } from './UserAvatar';
import { MEDIA_ASSETS } from '../utils/mediaAssets';

interface StoriesStripProps {
  stories: StoryItem[];
  onViewStory: (storyId: string) => void;
  onCreateStory: (caption: string, subject: string) => void;
}

export function StoriesStrip({
  stories,
  onViewStory,
  onCreateStory,
}: StoriesStripProps) {
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newSubject, setNewSubject] = useState('Estudo');

  const handleOpenStory = (story: StoryItem) => {
    if (story.isOwn && !story.caption) {
      setShowCreateModal(true);
      return;
    }
    onViewStory(story.id);
    setActiveStory(story);
  };

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newCaption.trim()) return;
    onCreateStory(newCaption.trim(), newSubject.trim() || 'Campus');
    setNewCaption('');
    setShowCreateModal(false);
  };

  return (
    <>
      <section
        aria-label="Stories académicos"
        className="glass-surface rounded-3xl px-4 py-4"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-display font-semibold text-slate-900">
            Stories
          </h2>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="text-xs font-medium text-indigo-700 hover:text-indigo-900 py-1 px-2 rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap"
          >
            Partilhar momento
          </button>
        </div>

        <div className="flex items-start gap-3.5 overflow-x-auto no-scrollbar pb-1">
          {stories.map((story) => (
            <button
              key={story.id}
              type="button"
              onClick={() => handleOpenStory(story)}
              aria-label={`Ver story de ${story.authorName}`}
              className="group flex flex-col items-center gap-1.5 shrink-0 min-w-[64px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl p-0.5"
            >
              <div
                className={`relative p-[2.5px] rounded-full transition-transform duration-200 group-hover:scale-[1.04] ${
                  story.viewed
                    ? 'bg-slate-200'
                    : `bg-gradient-to-tr ${story.ringAccent}`
                }`}
              >
                <div className="bg-white p-[2px] rounded-full">
                  <UserAvatar
                    name={story.authorName}
                    initials={story.initials}
                    avatarKey={story.avatarKey}
                    size="lg"
                  />
                </div>
                {story.isOwn && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#0A0F44] text-white flex items-center justify-center border-2 border-white shadow-sm"
                  >
                    <Plus className="w-3 h-3" />
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-slate-700 max-w-[68px] truncate">
                {story.shortName}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Story de ${activeStory.authorName}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md rounded-3xl overflow-hidden bg-gradient-to-br from-[#312E81] via-[#1E1B4B] to-[#0F172A] text-white shadow-2xl border border-white/15"
            >
              <div className="p-5 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={activeStory.authorName}
                    initials={activeStory.initials}
                    avatarKey={activeStory.avatarKey}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-display font-semibold">
                      {activeStory.authorName}
                    </p>
                    <p className="text-xs text-indigo-200">
                      {activeStory.subject} · {activeStory.timestamp}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStory(null)}
                  aria-label="Fechar story"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {activeStory.mediaKey && (
                  <div className="rounded-2xl overflow-hidden border border-white/15 bg-white/5 aspect-[4/3]">
                    <img
                      src={MEDIA_ASSETS[activeStory.mediaKey]}
                      alt={activeStory.caption}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="text-base leading-relaxed text-white/95">
                  {activeStory.caption}
                </p>
                {activeStory.isOwn && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStory(null);
                      setShowCreateModal(true);
                    }}
                    className="w-full h-11 rounded-xl bg-white text-slate-900 font-medium text-sm hover:bg-indigo-50 transition-colors"
                  >
                    Atualizar o meu story
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Story Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Publicar novo story académico"
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onSubmit={handleCreateSubmit}
              className="w-full max-w-md glass-popover rounded-3xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-display font-semibold text-slate-900">
                  Novo Story Académico
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  aria-label="Cancelar novo story"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label
                  htmlFor="story-subject"
                  className="block text-xs font-medium text-slate-600 mb-1.5"
                >
                  Tema ou disciplina
                </label>
                <input
                  id="story-subject"
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="story-caption"
                  className="block text-xs font-medium text-slate-600 mb-1.5"
                >
                  O que estás a estudar agora?
                </label>
                <textarea
                  id="story-caption"
                  rows={3}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Ex: A rever protocolos TCP/UDP para a frequência..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#0A0F44] hover:bg-[#141B66] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Publicar Story</span>
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
