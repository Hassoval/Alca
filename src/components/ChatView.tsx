import { useState, type FormEvent } from 'react';
import { ArrowLeft, Search, Send, Users } from 'lucide-react';
import type { ChatThread } from '../types/alca';
import { UserAvatar } from './UserAvatar';

interface ChatViewProps {
  threads: ChatThread[];
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  onSendMessage: (threadId: string, text: string) => void;
}

export function ChatView({
  threads,
  activeThreadId,
  onSelectThread,
  onSendMessage,
}: ChatViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const filteredThreads = threads.filter((t) =>
    `${t.title} ${t.subtitle}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeThread =
    threads.find((t) => t.id === activeThreadId) ?? threads[0];

  const handleOpenThread = (id: string) => {
    onSelectThread(id);
    setMobileShowThread(true);
  };

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!draftMessage.trim() || !activeThread) return;
    onSendMessage(activeThread.id, draftMessage);
    setDraftMessage('');
  };

  return (
    <div className="pb-24 lg:pb-10">
      <div className="glass-surface rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
        {/* Threads List */}
        <aside
          className={`md:col-span-5 border-r border-slate-200/70 dark:border-slate-800 flex flex-col ${
            mobileShowThread ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
                Conversas
              </h1>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Turmas & Colegas
              </span>
            </div>

            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <label htmlFor="chat-search" className="sr-only">
                Procurar conversa
              </label>
              <input
                id="chat-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Procurar colega ou grupo..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors duration-300"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1 overflow-y-auto">
            {filteredThreads.map((thread) => {
              const lastMsg = thread.messages.at(-1);
              const isSelected = thread.id === activeThread?.id;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => handleOpenThread(thread.id)}
                  className={`w-full px-4 py-3.5 flex items-center gap-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/75 dark:bg-indigo-500/15'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {thread.isGroup && !thread.avatarKey ? (
                    <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" aria-hidden="true" />
                    </div>
                  ) : (
                    <UserAvatar
                      name={thread.title}
                      initials={thread.initials}
                      avatarKey={thread.avatarKey}
                      size="md"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-display font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {thread.title}
                      </p>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums shrink-0">
                        {lastMsg?.timestamp ?? ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {lastMsg ? lastMsg.text : thread.subtitle}
                      </p>
                      {thread.unreadCount > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center tabular-nums shrink-0">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Active Conversation Thread */}
        <section
          aria-label="Conversa ativa"
          className={`md:col-span-7 flex flex-col bg-white/55 dark:bg-slate-900/45 transition-colors duration-300 ${
            mobileShowThread ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeThread ? (
            <>
              <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-white/75 dark:bg-slate-900/70 transition-colors duration-300">
                <button
                  type="button"
                  onClick={() => setMobileShowThread(false)}
                  aria-label="Voltar à lista de conversas"
                  className="md:hidden min-w-[40px] min-h-[40px] -ml-1 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <UserAvatar
                  name={activeThread.title}
                  initials={activeThread.initials}
                  avatarKey={activeThread.avatarKey}
                  size="sm"
                />
                <div className="min-w-0">
                  <h2 className="text-sm font-display font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {activeThread.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {activeThread.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px]">
                {activeThread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.isMe ? 'items-end' : 'items-start'
                    }`}
                  >
                    {!msg.isMe && (
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 px-1">
                        {msg.senderName}
                      </span>
                    )}
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed transition-colors duration-300 ${
                        msg.isMe
                          ? 'bg-[#0A0F44] dark:bg-indigo-500 text-white rounded-br-sm'
                          : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`text-[10px] mt-1 tabular-nums text-right ${
                          msg.isMe ? 'text-indigo-200 dark:text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick study reply suggestions */}
              <div className="px-4 pt-2 flex flex-wrap items-center gap-1.5">
                {[
                  'Encontro na biblioteca!',
                  'Partilha o resumo?',
                  'Obrigado pela ajuda!',
                ].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => onSendMessage(activeThread.id, quick)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 text-[11px] font-medium text-indigo-800 dark:text-indigo-200 whitespace-nowrap transition-colors"
                  >
                    {quick}
                  </button>
                ))}
              </div>

              <form
                onSubmit={handleSend}
                className="p-4 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 mt-2 bg-white/75 dark:bg-slate-900/70 transition-colors duration-300"
              >
                <label htmlFor="chat-message-input" className="sr-only">
                  Escrever mensagem académica
                </label>
                <input
                  id="chat-message-input"
                  type="text"
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  placeholder="Escrever mensagem para a turma..."
                  className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Enviar mensagem"
                  disabled={!draftMessage.trim()}
                  className="min-w-[44px] h-11 px-4 rounded-xl bg-[#0A0F44] dark:bg-indigo-500 hover:bg-[#141B66] dark:hover:bg-indigo-400 disabled:opacity-45 text-white flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-sm text-slate-500 dark:text-slate-400">
              Seleciona uma conversa para começar.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
