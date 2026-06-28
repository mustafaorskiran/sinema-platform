# Graph Report - C:/Users/user/Desktop/Sinema & dizi yorum platformu/sinema-platform/src

## Executive Summary

Project contains 381 files with 803 nodes and 1621 edges, organized into 71 communities (plus 12 isolated nodes). Core abstractions: POST(), GET(), DELETE(). Architecture shows clean layering with no dependency cycles.

## Project Structure

- 381 files · ~173304 words
- Verdict: corpus is large enough that graph structure adds value.

- 803 nodes · 1621 edges · 83 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Key Files (read these for maximum insight)
1. `lib\admin.ts` (4 nodes, 0 methods)
2. `context\LocaleContext.tsx` (4 nodes, 0 methods)
3. `components\WatchCalendar.tsx` (3 nodes, 0 methods)
4. `app\yillik-hedef\page.tsx` (4 nodes, 0 methods)
5. `components\WatchlistButton.tsx` (4 nodes, 0 methods)
6. `app\film\[id]\page.tsx` (32 nodes, 0 methods)
7. `middleware.ts` (4 nodes, 0 methods)
8. `components\WatchProviders.tsx` (4 nodes, 0 methods)

## Runtime Dependencies (cross-file calls)
- app\liste\[id]\page.tsx -> app\liste\[id]\ListeItemsView.tsx (4 calls)
- app\api\watchlist\priority\route.ts -> app\api\admin\reviews\[id]\route.ts (2 calls)
- app\api\watchlist\route.ts -> app\api\admin\reviews\[id]\route.ts (2 calls)
- app\profil\[username]\gunluk\page.tsx -> app\sinemalar\page.tsx (1 calls)
- app\oyuncu\[id]\page.tsx -> app\sinemalar\page.tsx (1 calls)
- app\forum\[id]\page.tsx -> components\ReviewReplySection.tsx (1 calls)
- app\gunluk\page.tsx -> app\gunluk\DiaryPageClient.tsx (1 calls)
- app\sinemalar\page.tsx -> app\yayin-takvimi\YayinTakvimiClient.tsx (1 calls)
- app\versus\yeni\page.tsx -> app\versus\yeni\VersusYeniClient.tsx (1 calls)
- app\ne-izlesem\page.tsx -> components\FavoritesEditor.tsx (1 calls)

## God Nodes (most connected - your core abstractions)
1. `POST()` - 49 edges (app\auth\signout\route.ts)
2. `GET()` - 38 edges (app\auth\callback\route.ts)
3. `DELETE()` - 29 edges (app\api\watchlist\route.ts)
4. `timeAgo()` - 16 edges (components\ReviewReplySection.tsx)
5. `PATCH()` - 12 edges (app\api\watchlist\priority\route.ts)
6. `formatDate()` - 6 edges (app\sinemalar\page.tsx)
7. `getPasswordStrength()` - 6 edges (app\profil\duzenle\ProfilDuzenleForm.tsx)
8. `Navbar()` - 4 edges (components\Navbar.tsx)
9. `getHistory()` - 4 edges (components\Navbar.tsx)
10. `daysUntil()` - 4 edges (app\yayin-takvimi\YayinTakvimiClient.tsx)

## Surprising Connections (you probably didn't know these)
- `ForumPage()` --calls--> `timeAgo()`  [EXTRACTED]
  app\forum\page.tsx → components\ReviewReplySection.tsx
- `SifreSifirlaPage()` --calls--> `getPasswordStrength()`  [EXTRACTED]
  app\auth\sifre-sifirla\page.tsx → app\profil\duzenle\ProfilDuzenleForm.tsx
- `ProfilGunlukPage()` --calls--> `formatDate()`  [EXTRACTED]
  app\profil\[username]\gunluk\page.tsx → app\sinemalar\page.tsx
- `KayitPage()` --calls--> `getPasswordStrength()`  [EXTRACTED]
  app\auth\kayit\page.tsx → app\profil\duzenle\ProfilDuzenleForm.tsx
- `ProfilYorumlarPage()` --calls--> `timeAgo()`  [EXTRACTED]
  app\profil\[username]\yorumlar\page.tsx → components\ReviewReplySection.tsx
- `OyuncuPage()` --calls--> `formatDate()`  [EXTRACTED]
  app\oyuncu\[id]\page.tsx → app\sinemalar\page.tsx
- `PATCH()` --calls--> `checkAdmin()`  [EXTRACTED]
  app\api\watchlist\priority\route.ts → app\api\admin\users\[id]\route.ts
- `DELETE()` --calls--> `GET()`  [EXTRACTED]
  app\api\watchlist\route.ts → app\auth\callback\route.ts
- `DELETE()` --calls--> `logAction()`  [EXTRACTED]
  app\api\watchlist\route.ts → app\api\admin\reviews\[id]\route.ts
- `SinemalarPage()` --calls--> `daysUntil()`  [EXTRACTED]
  app\sinemalar\page.tsx → app\yayin-takvimi\YayinTakvimiClient.tsx

---

## Communities
*+ 12 isolated nodes omitted*

### Community 0 - "app / EvrenPage()"
Cohesion: 0.11
Nodes (19): EvrenPage(), page.tsx, page.tsx, KategoriPage(), robots.ts, GizlilikPage(), page.tsx, page.tsx (+11 more)

### Community 1 - "components / fmt()"
Cohesion: 0.67
Nodes (4): fmt(), RatingBar(), SinezonStats(), SinezonStats.tsx

### Community 2 - "[id] / TurlerPage()"
Cohesion: 0.08
Nodes (43): @/components/SinezonStats, @/components/VideoGallery, page.tsx, @/components/RatingSlider, @/components/ShareButtons, page.tsx, @/components/BackdropGallery, @/components/AIChatWidget (+35 more)

### Community 3 - "components / MovieCard()"
Cohesion: 0.11
Nodes (20): MovieCard(), page.tsx, ./QuizClient, KisilerPage(), ./UserHoverCard, ProfileCard(), next/image, MovieCard.tsx (+12 more)

### Community 4 - "components / StarRating()"
Cohesion: 0.50
Nodes (4): StarRating(), ReviewForm.tsx, @/lib/profanityFilter, StarRating.tsx

### Community 5 - "[id] / EnCokYorumlananLoading()"
Cohesion: 0.05
Nodes (37): loading.tsx, loading.tsx, loading.tsx, EnCokYorumlananLoading(), loading.tsx, FilmDetailLoading(), FilmlerLoading(), OyuncuLoading() (+29 more)

### Community 6 - "components / TurPage()"
Cohesion: 0.07
Nodes (31): FilmlerSidebar.tsx, TurPage(), page.tsx, page.tsx, AramaFiltreler.tsx, @/components/MovieCard, @/components/Pagination, page.tsx (+23 more)

### Community 7 - "[username] / ProfilPage()"
Cohesion: 0.11
Nodes (19): page.tsx, ProfilPage(), @/components/FavoritesEditor, @/components/WatchCalendar, page.tsx, ProfilRozetlerPage(), IstatistiklerPage(), @/components/WatchGoalWidget (+11 more)

### Community 8 - "[id] / POST()"
Cohesion: 0.06
Nodes (100): route.ts, route.ts, route.ts, route.ts, route.ts, route.ts, @supabase/supabase-js, route.ts (+92 more)

### Community 9 - "components / RatingSlider()"
Cohesion: 0.02
Nodes (91): ListFollowButton.tsx, handleSave(), ./HelpfulButton, YeniKonuPage(), PinReviewButton(), next/navigation, page.tsx, page.tsx (+83 more)

### Community 10 - "components / VideoGallery()"
Cohesion: 0.04
Nodes (45): CollectionButton.tsx, VideoGallery(), AISummary.tsx, ShareButtons.tsx, index.tsx, FollowButton(), InviteSection(), QuoteLikeButton() (+37 more)

### Community 11 - "components / TrailerSkeleton()"
Cohesion: 0.16
Nodes (14): @/components/HomeTrailerSection, HomeTrailerSection.tsx, HomeTrailerCards.tsx, ./FilmografiClient, @/components/HomeCarousel, TrailerSkeleton(), CreditCard(), KunyeClient.tsx (+6 more)

### Community 12 - "[id] / fmtRuntime()"
Cohesion: 0.25
Nodes (11): ListePage(), fmtRuntime(), ./ListeActions, RatingBadge(), ./ListeItemsView, ListeItemsView.tsx, page.tsx, getTitle() (+3 more)

### Community 13 - "duzenle / getPasswordStrength()"
Cohesion: 0.15
Nodes (18): getPasswordStrength(), page.tsx, GoogleAuthButton(), ./ProfilDuzenleForm, GirisPage(), SifremiUnuttumPage(), page.tsx, ResolveButton.tsx (+10 more)

### Community 14 - "bildirimler / timeAgo()"
Cohesion: 0.11
Nodes (25): BildirimlerPage(), Avatar(), NotificationBell(), page.tsx, page.tsx, ProfilYorumlarPage(), ./ConversationList, MesajlarPage() (+17 more)

### Community 15 - "haftalik / fetchTrendingWeek()"
Cohesion: 0.67
Nodes (3): page.tsx, fetchTrendingWeek(), weekRange()

### Community 16 - "offline / OfflinePage()"
Cohesion: 0.50
Nodes (4): page.tsx, ./ReloadButton, OfflinePage(), ReloadButton.tsx

### Community 17 - "fragmanlar / TypeBadge()"
Cohesion: 0.40
Nodes (5): TypeBadge(), page.tsx, ./FragmanlarClient, FragmanlarClient.tsx, TrailerCard()

### Community 18 - "components / RatingDistribution()"
Cohesion: 1.00
Nodes (2): RatingDistribution(), RatingDistribution.tsx

### Community 19 - "components / KullanicilarPage()"
Cohesion: 0.10
Nodes (20): KullanicilarPage(), ThemeToggle.tsx, Pagination.tsx, DeleteReviewButton.tsx, @/components/icons, CustomSelect.tsx, WatchlistButton.tsx, MobileFilterDrawer.tsx (+12 more)

### Community 20 - "alintilar / AdminAlıntilarPage()"
Cohesion: 0.67
Nodes (3): ./ApproveQuoteButton, page.tsx, AdminAlıntilarPage()

### Community 21 - "[slug] / UlkePage()"
Cohesion: 0.29
Nodes (7): UlkePage(), @/lib/countries, UlkelerPage(), UlkeClient.tsx, page.tsx, ./UlkeClient, page.tsx

### Community 22 - "lib / createClient()"
Cohesion: 0.15
Nodes (16): i18n.ts, getMediaTitle(), createClient(), tmdb-utils.ts, middleware(), getMediaDate(), getMediaYear(), next/headers (+8 more)

### Community 23 - "yil-ozeti / YilOzetiPage()"
Cohesion: 0.67
Nodes (4): gradientCard(), page.tsx, page.tsx, YilOzetiPage()

### Community 24 - "yayin-takvimi / daysUntil()"
Cohesion: 0.20
Nodes (12): ./YayinTakvimiClient, getWeekStart(), YayinTakvimiClient.tsx, formatDateHeader(), daysUntil(), SinemalarPage(), getToday(), page.tsx (+4 more)

### Community 25 - "lib / containsProfanity()"
Cohesion: 1.00
Nodes (2): containsProfanity(), profanityFilter.ts

### Community 26 - "components / EmptyState()"
Cohesion: 0.10
Nodes (20): page.tsx, page.tsx, EmptyState(), page.tsx, page.tsx, ProfilIzmeListesiPage(), SeasonTracker.tsx, route.ts (+12 more)

### Community 27 - "[slug] / fetchListItems()"
Cohesion: 0.40
Nodes (6): fetchListItems(), page.tsx, @/lib/curated-lists, page.tsx, OzelListeDetayPage(), OzelListelerPage()

### Community 28 - "components / YearlyChallenge()"
Cohesion: 0.67
Nodes (3): YearlyChallenge(), YearlyChallenge.tsx, ProgressRing()

### Community 29 - "lib / getTMDbLanguage()"
Cohesion: 0.67
Nodes (4): getTMDbLanguage(), i18n-config.ts, isValidLocale(), getLocaleInfo()

### Community 30 - "benzer-kullanicilar / Loading()"
Cohesion: 1.00
Nodes (2): loading.tsx, Loading()

### Community 31 - "izleme-listem / IzlemeLisTemPage()"
Cohesion: 0.25
Nodes (8): IzlemeLisTemPage(), ./PriorityButton, WatchlistNoteButton.tsx, page.tsx, ./RandomPickButton, ./WatchlistNoteButton, PriorityButton.tsx, RandomPickButton.tsx

### Community 32 - "trivia / AdminDashboard()"
Cohesion: 0.14
Nodes (14): AdminDashboard(), AdminTriviaPage(), ./PushForm, AdminPushPage(), @/lib/admin, AdminDeleteButton.tsx, ./AdminDeleteButton, page.tsx (+6 more)

### Community 33 - "components / Navbar()"
Cohesion: 0.12
Nodes (22): @/components/ServiceWorkerRegistration, UserDropdown.tsx, @/context/LocaleContext, removeFromHistory(), ./NavDropdown, addToHistory(), LanguageSwitcher.tsx, @/lib/i18n (+14 more)

### Community 34 - "benzer-kullanicilar / NoSimilarUsersPage()"
Cohesion: 0.33
Nodes (6): NoSimilarUsersPage(), LowDataPage(), page.tsx, BenzerKullanicilarPage(), ./BenzerClient, BenzerClient.tsx

### Community 35 - "components / ParentsGuide()"
Cohesion: 1.00
Nodes (2): ParentsGuide.tsx, ParentsGuide()

### Community 36 - "components / MoodPage()"
Cohesion: 0.11
Nodes (18): MoodPage(), SimilarWatchers.tsx, DavetPage(), page.tsx, FilmGecesiPage(), SimilarWatchers(), ShelfView.tsx, DunyaSinemasPage() (+10 more)

### Community 37 - "lib / computeBadges()"
Cohesion: 1.00
Nodes (2): badges.ts, computeBadges()

### Community 38 - "components / PushSubscribeButton()"
Cohesion: 1.00
Nodes (3): PushSubscribeButton(), urlBase64ToUint8Array(), PushSubscribeButton.tsx

### Community 39 - "[id] / formatDate()"
Cohesion: 0.47
Nodes (6): ProfilGunlukPage(), OyuncuPage(), formatDate(), page.tsx, page.tsx, ./KunyeClient

### Community 40 - "components / pick()"
Cohesion: 0.20
Nodes (11): NeIzlesemPage(), FavoritesEditor(), search(), FeaturedPickForm.tsx, pick(), page.tsx, BaskaOnerButton.tsx, ./BaskaOnerButton (+3 more)

### Community 41 - "raporlar / AdminRaporlarPage()"
Cohesion: 0.67
Nodes (4): AdminRaporlarPage(), ./ResolveButton, page.tsx, targetLink()

### Community 42 - "[sezon] / SezonPage()"
Cohesion: 0.50
Nodes (4): EpisodeRow.tsx, ./EpisodeRow, page.tsx, SezonPage()

### Community 43 - "gunluk / formatMonthKey()"
Cohesion: 0.50
Nodes (5): formatDay(), DiaryPageClient.tsx, page.tsx, ./DiaryPageClient, formatMonthKey()

### Community 44 - "components / AffiliateLinks()"
Cohesion: 1.00
Nodes (2): AffiliateLinks.tsx, AffiliateLinks()

### Community 45 - "karsilastir / KarsilastirPage()"
Cohesion: 0.67
Nodes (3): KarsilastirPage(), ./KarsilastirClient, page.tsx

### Community 46 - "listeler / ListerPage()"
Cohesion: 0.40
Nodes (5): ListerPage(), page.tsx, EditorialCard.tsx, ./EditorialCard, ./ListCard

### Community 47 - "components / onThumbMouseDown()"
Cohesion: 0.50
Nodes (4): onThumbMouseDown(), onTrackClick(), CastRow.tsx, CastRow()

### Community 48 - "components / AwardsSection()"
Cohesion: 1.00
Nodes (2): AwardsSection(), AwardsSection.tsx

### Community 49 - "components / calcAvg()"
Cohesion: 1.00
Nodes (3): calcAvg(), DemoRatings(), DemoRatings.tsx

### Community 50 - "koleksiyon / KoleksiyonPage()"
Cohesion: 0.50
Nodes (4): ./ShelfView, page.tsx, KoleksiyonPage(), page.tsx

### Community 52 - "components / AIChatWidget()"
Cohesion: 0.67
Nodes (3): AIChatWidget.tsx, AIChatWidget(), ask()

### Community 53 - "ozel-secim / DeletePickButton()"
Cohesion: 0.50
Nodes (4): DeletePickButton(), page.tsx, ./FeaturedPickForm, OzelSecimPage()

### Community 54 - "[slug] / ./TopicVoteClient"
Cohesion: 0.67
Nodes (3): ./TopicVoteClient, page.tsx, TopicVoteClient.tsx

### Community 55 - "ruh-hali / RuhHaliPage()"
Cohesion: 0.40
Nodes (5): page.tsx, @/lib/moods, RuhHaliPage(), page.tsx, RuhHaliDetayPage()

### Community 56 - "versus / VersusPage()"
Cohesion: 0.50
Nodes (4): VersusClient.tsx, page.tsx, ./VersusClient, VersusPage()

### Community 57 - "moderasyon / ReviewCard()"
Cohesion: 0.40
Nodes (5): ./ModerationActions, page.tsx, ReviewCard(), ModerationActions.tsx, AdminModerasyonPage()

### Community 59 - "components / CriticScores()"
Cohesion: 1.00
Nodes (2): CriticScores(), CriticScores.tsx

### Community 60 - "components / getLastNWeeks()"
Cohesion: 0.67
Nodes (3): ActivityHeatmap.tsx, getLastNWeeks(), level()

### Community 61 - "components / buildSearchUrl()"
Cohesion: 1.00
Nodes (3): buildSearchUrl(), WatchProviders.tsx, WatchProviders()

### Community 62 - "kullanicilar / AdminKullanicilarPage()"
Cohesion: 0.50
Nodes (4): AdminUserActions.tsx, AdminKullanicilarPage(), ./AdminUserActions, page.tsx

### Community 63 - "alintilar / AlintilarPage()"
Cohesion: 0.33
Nodes (6): AlintilarPage(), page.tsx, page.tsx, @/components/QuoteLikeButton, EmptyFeed(), @/components/UserHoverCard

### Community 64 - "components / ThemeScript()"
Cohesion: 1.00
Nodes (2): ThemeScript(), ThemeScript.tsx

### Community 65 - "listeler / AdminListelerPage()"
Cohesion: 0.40
Nodes (5): FeaturedListManager.tsx, page.tsx, ./EditorialListManager, AdminListelerPage(), ./FeaturedListManager

### Community 66 - "alintilar / AlintilarLoading()"
Cohesion: 1.00
Nodes (2): loading.tsx, AlintilarLoading()

### Community 67 - "tv-filmleri / TvFilmleriPage()"
Cohesion: 0.67
Nodes (3): ./TvFilmleriClient, page.tsx, TvFilmleriPage()

### Community 70 - "lib / getLimiter()"
Cohesion: 0.40
Nodes (5): @upstash/ratelimit, getLimiter(), rateLimit.ts, memLimit(), @upstash/redis

### Community 72 - "top10 / getTmdbDetail()"
Cohesion: 0.67
Nodes (3): page.tsx, getTmdbDetail(), TopList()

### Community 74 - "components / GoldDivider()"
Cohesion: 0.67
Nodes (3): GoldDivider(), FilterLabel(), TurSidebar.tsx

### Community 76 - "lib / checkSpam()"
Cohesion: 1.00
Nodes (2): checkSpam(), spamCheck.ts

### Community 77 - "components / Keywords()"
Cohesion: 1.00
Nodes (2): Keywords.tsx, Keywords()