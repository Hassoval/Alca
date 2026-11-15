import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addPostComment,
  applyToOpportunity,
  authenticateWithRoleAccounts,
  computeAcademicStats,
  createNewPost,
  deletePostWithRole,
  filterLibraryContent,
  filterUnifiedFeed,
  getRolePermissions,
  resolveThemePreference,
  sendChatMessage,
  toggleArticleBookmark,
  togglePinPost,
  togglePostBookmark,
  togglePostLike,
  toggleThemeMode,
  validateLoginCredentials,
  validateSignupCredentials,
} from './alcaLogic';
import {
  DEMO_ACCOUNTS,
  INITIAL_ARTICLES,
  INITIAL_OPPORTUNITIES,
  INITIAL_POSTS,
  INITIAL_THREADS,
} from '../data/seedData';

test('validateLoginCredentials rejects empty or malformed credentials', () => {
  assert.equal(validateLoginCredentials('', '12345').valid, false);
  assert.equal(validateLoginCredentials('invalid-user', '12345').valid, false);
  assert.equal(validateLoginCredentials('maria@alca.edu', '12').valid, false);
  assert.equal(validateLoginCredentials('maria@alca.edu', 'alca2026').valid, true);
  assert.equal(validateLoginCredentials('+244 923 456 789', 'alca2026').valid, true);
});

test('validateSignupCredentials checks name length and email/password', () => {
  assert.equal(validateSignupCredentials('Jo', 'maria@alca.edu', 'alca2026').valid, false);
  assert.equal(
    validateSignupCredentials('Maria José', 'maria@alca.edu', 'alca2026').valid,
    true,
  );
});

test('authenticateWithRoleAccounts enforces passwords and resolves all 4 RBAC roles', () => {
  const wrongPass = authenticateWithRoleAccounts(
    DEMO_ACCOUNTS,
    'admin@alca.edu',
    'errada',
  );
  assert.equal(wrongPass.valid, false);

  const student = authenticateWithRoleAccounts(
    DEMO_ACCOUNTS,
    'maria@alca.edu',
    'alca2026',
  );
  assert.equal(student.valid, true);
  assert.equal(student.user?.role, 'estudante');

  const prof = authenticateWithRoleAccounts(
    DEMO_ACCOUNTS,
    'prof.kiala@alca.edu',
    'docente2026',
  );
  assert.equal(prof.valid, true);
  assert.equal(prof.user?.role, 'professor');

  const inst = authenticateWithRoleAccounts(
    DEMO_ACCOUNTS,
    'instituicao@alca.edu',
    'inst2026',
  );
  assert.equal(inst.valid, true);
  assert.equal(inst.user?.role, 'instituicao');

  const admin = authenticateWithRoleAccounts(
    DEMO_ACCOUNTS,
    'admin@alca.edu',
    'admin2026',
  );
  assert.equal(admin.valid, true);
  assert.equal(admin.user?.role, 'admin');
});

test('RBAC permissions restrict announcement, opportunity publishing, pinning, and moderation', () => {
  const estPerms = getRolePermissions('estudante');
  assert.equal(estPerms.canPublishAnnouncement, false);
  assert.equal(estPerms.canPublishOpportunity, false);
  assert.equal(estPerms.canPinAndModerate, false);

  const profPerms = getRolePermissions('professor');
  assert.equal(profPerms.canPublishAnnouncement, true);
  assert.equal(profPerms.canPublishOpportunity, false);

  const instPerms = getRolePermissions('instituicao');
  assert.equal(instPerms.canPublishAnnouncement, true);
  assert.equal(instPerms.canPublishOpportunity, true);
  assert.equal(instPerms.canReviewApplications, true);

  const adminPerms = getRolePermissions('admin');
  assert.equal(adminPerms.canPinAndModerate, true);
  assert.equal(adminPerms.canPublishOpportunity, true);

  // Student attempting to publish announcement falls back to student post
  const afterStudent = createNewPost(
    INITIAL_POSTS,
    'Maria José Eduardo',
    'Engenharia Informática',
    'Dúvida de estudo',
    'Redes',
    'estudante',
    'anuncio',
  );
  assert.equal(afterStudent[0].kind, 'estudante');

  // Professor publishing announcement creates pinned anuncio
  const afterProf = createNewPost(
    INITIAL_POSTS,
    'Prof. Domingos Kiala',
    'Docente · Redes II',
    'Aula prática às 14h.',
    'Anúncio Docente',
    'professor',
    'anuncio',
  );
  assert.equal(afterProf[0].kind, 'anuncio');
  assert.equal(afterProf[0].pinned, true);

  // Only privileged roles can pin/unpin or moderate others' posts
  const targetId = INITIAL_POSTS[1].id;
  const studentPinAttempt = togglePinPost(INITIAL_POSTS, targetId, 'estudante');
  assert.equal(studentPinAttempt[1].pinned, INITIAL_POSTS[1].pinned);

  const adminPin = togglePinPost(INITIAL_POSTS, targetId, 'admin');
  assert.equal(adminPin[1].pinned, true);

  const studentDeleteAttempt = deletePostWithRole(
    INITIAL_POSTS,
    targetId,
    'estudante',
    'Maria José Eduardo',
  );
  assert.equal(studentDeleteAttempt.length, INITIAL_POSTS.length);

  const adminDelete = deletePostWithRole(
    INITIAL_POSTS,
    targetId,
    'admin',
    'Moisés Hassoval (Admin)',
  );
  assert.equal(adminDelete.length, INITIAL_POSTS.length - 1);
});

test('filterUnifiedFeed separates Tudo, Estudantes, Anúncios, and Bolsas & Estágios', () => {
  const all = filterUnifiedFeed(INITIAL_POSTS, 'Tudo');
  assert.equal(all.length, INITIAL_POSTS.length);
  assert.equal(all[0].pinned, true);

  const anuncios = filterUnifiedFeed(INITIAL_POSTS, 'Anúncios');
  assert.equal(anuncios.every((p) => p.kind === 'anuncio'), true);

  const opps = filterUnifiedFeed(INITIAL_POSTS, 'Bolsas & Estágios');
  assert.equal(opps.every((p) => p.kind === 'oportunidade'), true);

  const students = filterUnifiedFeed(INITIAL_POSTS, 'Estudantes');
  assert.equal(students.every((p) => p.kind === 'estudante'), true);
});

test('filterLibraryContent filters by search query, category, and saved status', () => {
  const ipResult = filterLibraryContent(
    INITIAL_ARTICLES,
    INITIAL_OPPORTUNITIES,
    'IP',
    'Tudo',
    false,
  );
  assert.equal(ipResult.articles.length >= 1, true);
  assert.equal(
    ipResult.articles.some((a) => a.title.includes('endereço IP')),
    true,
  );

  const bolsasResult = filterLibraryContent(
    INITIAL_ARTICLES,
    INITIAL_OPPORTUNITIES,
    '',
    'Bolsas',
    false,
  );
  assert.equal(bolsasResult.articles.length, 0);
  assert.equal(
    bolsasResult.opportunities.every((o) => o.type === 'Bolsas'),
    true,
  );
});

test('togglePostLike, addPostComment, bookmarks, applications, and chat stay synchronized', () => {
  const firstId = INITIAL_POSTS[0].id;
  const initialLikes = INITIAL_POSTS[0].likes;

  const liked = togglePostLike(INITIAL_POSTS, firstId);
  assert.equal(liked[0].likedByMe, true);
  assert.equal(liked[0].likes, initialLikes + 1);

  const commented = addPostComment(
    INITIAL_POSTS,
    firstId,
    'Maria José Eduardo',
    'Excelente aviso!',
  );
  assert.equal(commented[0].comments.length, INITIAL_POSTS[0].comments.length + 1);

  const articlesAfter = toggleArticleBookmark(
    INITIAL_ARTICLES,
    INITIAL_ARTICLES[0].id,
  );
  const postsAfter = togglePostBookmark(INITIAL_POSTS, INITIAL_POSTS[0].id);
  const oppsAfter = applyToOpportunity(
    INITIAL_OPPORTUNITIES,
    INITIAL_OPPORTUNITIES[0].id,
  );

  const threadId = INITIAL_THREADS[0].id;
  const threadsAfter = sendChatMessage(
    INITIAL_THREADS,
    threadId,
    'Maria José Eduardo',
    'Alguém tem o PDF do laboratório 3?',
  );
  assert.equal(threadsAfter[0].unreadCount, 0);

  const stats = computeAcademicStats(
    postsAfter,
    articlesAfter,
    oppsAfter,
    threadsAfter,
  );
  assert.equal(stats.applicationsCount >= 1, true);
  assert.equal(stats.savedCount >= 2, true);
});

test('resolveThemePreference and toggleThemeMode handle stored and system theme modes', () => {
  assert.equal(resolveThemePreference('dark', false), 'dark');
  assert.equal(resolveThemePreference('light', true), 'light');
  assert.equal(resolveThemePreference(null, true), 'dark');
  assert.equal(resolveThemePreference(undefined, false), 'light');
  assert.equal(toggleThemeMode('light'), 'dark');
  assert.equal(toggleThemeMode('dark'), 'light');
});
