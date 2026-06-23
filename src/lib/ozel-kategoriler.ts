export interface OzelKategori {
  slug: string
  label: string
  keywords: string  // TMDb keyword ID'leri — pipe (|) = OR, virgül (,) = AND
  mediaType?: 'film' | 'dizi'   // tanımlanmamışsa her iki sayfada gösterilir
  maxYear?: string              // 'klasik' gibi yıl bazlı filtreler için
  language?: string             // TMDb with_original_language
  excludeLanguage?: string      // TMDb without_original_language
  maxRuntime?: string           // TMDb with_runtime.lte — kısa filmler için
  seriesType?: string           // TMDb with_type — dizi tipi filtresi
  genre?: string                // TMDb with_genres — tür ID'si
  minRating?: string            // TMDb vote_average.gte — minimum puan
}

export const OZEL_KATEGORILER: OzelKategori[] = [
  // ── Film özel kategorileri ────────────────────────────────────────────────
  { slug: 'yerli-yapimlar',   label: 'Yerli Filmler',    keywords: '', mediaType: 'film', language: 'tr' },
  { slug: 'yabanci-yapimlar', label: 'Yabancı Filmler',  keywords: '', mediaType: 'film', excludeLanguage: 'tr' },
  { slug: 'kisa-filmler',     label: 'Kısa Filmler',     keywords: '', mediaType: 'film', maxRuntime: '40' },
  { slug: 'festival-filmleri', label: 'Festival Filmleri', keywords: '314753', mediaType: 'film' },
  { slug: 'kult-filmler',     label: 'Kült Filmler',     keywords: '4370', mediaType: 'film' },
  { slug: 'oscar-kazananlar', label: 'Oscar Kazananlar', keywords: '155', mediaType: 'film' },
  { slug: 'imdb-top-250',     label: 'IMDb Top 250',     keywords: '', mediaType: 'film', minRating: '7.5' },

  // ── Dizi özel kategorileri ────────────────────────────────────────────────
  { slug: 'yerli-diziler',    label: 'Yerli Diziler',    keywords: '', mediaType: 'dizi', language: 'tr' },
  { slug: 'yabanci-diziler',  label: 'Yabancı Diziler',  keywords: '', mediaType: 'dizi', excludeLanguage: 'tr' },
  { slug: 'mini-diziler',     label: 'Mini Diziler',     keywords: '', mediaType: 'dizi', seriesType: '2' },
  { slug: 'bilim-kurgu',      label: 'Bilim Kurgu',      keywords: '', mediaType: 'dizi', genre: '10765' },

  // ── Temel kategoriler ─────────────────────────────────────────────────────
  { slug: 'biyografi',         label: 'Biyografi',         keywords: '9799'                    },
  { slug: 'spor',              label: 'Spor',              keywords: '333328'                  },
  { slug: 'polisiye',          label: 'Polisiye',          keywords: '703|179431'              },
  { slug: 'psikolojik',        label: 'Psikolojik',        keywords: '9717'                    },
  { slug: 'genclik',           label: 'Gençlik',           keywords: '704|6270'               },
  { slug: 'super-kahraman',    label: 'Süper Kahraman',    keywords: '9715'                    },
  { slug: 'cyberpunk',         label: 'Siberpunk',         keywords: '180547'                  },
  { slug: 'noir',              label: 'Kara Film',         keywords: '9807'                    },
  { slug: 'kiyamet-sonrasi',   label: 'Kıyamet Sonrası',  keywords: '4565'                    },
  { slug: 'dovus-sanatlari',   label: 'Dövüş Sanatları',  keywords: '2659'                    },
  { slug: 'zombi',             label: 'Zombi',             keywords: '12377'                   },
  { slug: 'vampir',            label: 'Vampir',            keywords: '9741'                    },
  { slug: 'uzay',              label: 'Uzay',              keywords: '3801|252634'             },
  { slug: 'distopya',          label: 'Distopya',          keywords: '3133'                    },
  { slug: 'gercek-hikaye',     label: 'Gerçek Hikaye',     keywords: '10683'                   },
  { slug: 'aile-dostu',        label: 'Aile Dostu',        keywords: '158718'                  },
  { slug: 'anime',             label: 'Anime',             keywords: '210024'                  },
  { slug: 'klasik',            label: 'Klasik',            keywords: '', maxYear: '1975'       },
  { slug: 'bagimsiz-film',     label: 'Bağımsız Film',     keywords: '281237'                  },

  // ── Genişletilmiş kategoriler ─────────────────────────────────────────────
  { slug: 'steampunk',          label: 'Steampunk',          keywords: '10028'                 },
  { slug: 'zaman-yolculugu',    label: 'Zaman Yolculuğu',    keywords: '4379'                 },
  { slug: 'alternatif-tarih',   label: 'Alternatif Tarih',   keywords: '12026'                },
  { slug: 'soygun',             label: 'Soygun',             keywords: '10051|9994|14798'      },
  { slug: 'hayatta-kalma',      label: 'Hayatta Kalma',      keywords: '4458'                 },
  { slug: 'found-footage',      label: 'Found Footage',      keywords: '163053'               },
  { slug: 'slasher',            label: 'Slasher',            keywords: '310'                  },
  { slug: 'psikolojik-korku',   label: 'Psikolojik Korku',   keywords: '295907'               },
  { slug: 'psikolojik-gerilim', label: 'Psikolojik Gerilim', keywords: '9717'                 },
  { slug: 'yol-filmi',          label: 'Yol Filmi',          keywords: '7312|167043'          },
  { slug: 'buyume-filmi',       label: 'Büyüme Filmi',       keywords: '704|6270'             },
  { slug: 'siyasi',             label: 'Siyasi',             keywords: '1562'                 },
  { slug: 'casus',              label: 'Casus / Ajan',       keywords: '470|14643'            },
  { slug: 'gangster',           label: 'Gangster',           keywords: '3070'                 },
  { slug: 'mahkeme',            label: 'Mahkeme',            keywords: '33519|214780|222517'  },
  { slug: 'afet',               label: 'Afet',               keywords: '6091|12554'           },
  { slug: 'mitoloji',           label: 'Mitoloji',           keywords: '2035|5656'            },
  { slug: 'epik',               label: 'Epik',               keywords: '6149'                 },
  { slug: 'canavar-filmi',      label: 'Canavar Filmi',      keywords: '9714'                 },
  { slug: 'neo-noir',           label: 'Neo Noir',           keywords: '4344'                 },
  { slug: 'kara-komedi',        label: 'Kara Komedi',        keywords: '3392'                 },
  { slug: 'askeri',             label: 'Askeri',             keywords: '162365'               },
  { slug: 'savas-drami',        label: 'Savaş Draması',      keywords: '9844'                 },
]
