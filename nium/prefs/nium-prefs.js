// Nium — preferências padrão. O apply.py coloca este bloco no fim de browser/app/profile/firefox.js.
// Só valores padrão: a pessoa pode mudar tudo em about:preferences.

// Abas na lateral (barra lateral nova do Firefox)
pref("sidebar.revamp", true);
pref("sidebar.verticalTabs", true);

// Sem telemetria, estudos ou experimentos
pref("datareporting.policy.dataSubmissionEnabled", false);
pref("datareporting.healthreport.uploadEnabled", false);
pref("toolkit.telemetry.unified", false);
pref("toolkit.telemetry.enabled", false);
pref("toolkit.telemetry.archive.enabled", false);
pref("app.shield.optoutstudies.enabled", false);
pref("app.normandy.enabled", false);
pref("browser.discovery.enabled", false);
pref("browser.crashReports.unsubmittedCheck.autoSubmit2", false);

// Nova aba do Nium: limpa, sem patrocínio, notícias, clima nem widgets.
// (A nova aba só aplica os padrões dela quando não há um padrão já definido aqui.)
pref("browser.newtabpage.activity-stream.default.sites", "https://www.youtube.com/,https://www.wikipedia.org/,https://www.reddit.com/,https://mail.google.com/");
pref("browser.newtabpage.activity-stream.showSponsored", false);
pref("browser.newtabpage.activity-stream.system.showSponsored", false);
pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
pref("browser.newtabpage.activity-stream.showWeather", false);
pref("browser.newtabpage.activity-stream.system.showWeather", false);
pref("browser.newtabpage.activity-stream.showWebNotifications", false);
pref("browser.newtabpage.activity-stream.system.showWebNotifications", false);
pref("browser.newtabpage.activity-stream.widgets.enabled", false);
pref("browser.newtabpage.activity-stream.widgets.system.enabled", false);
pref("browser.newtabpage.activity-stream.newtabWallpapers.highlightEnabled", false);
pref("browser.newtabpage.activity-stream.telemetry", false);

// Conta Mozilla (sincronização da Mozilla) desligada: o Nium terá a própria sincronização
pref("identity.fxaccounts.enabled", false);

// Abre as abas da última vez (como Arc/Zen) — e some a barra "Open previous tabs?"
pref("browser.startup.page", 3);

// Sem telas e propagandas do Firefox
pref("browser.aboutwelcome.enabled", false);
pref("startup.homepage_welcome_url", "");
pref("startup.homepage_welcome_url.additional", "");
pref("startup.homepage_override_url", "");
pref("browser.startup.homepage_override.mstone", "ignore");
pref("browser.messaging-system.whatsNewPanel.enabled", false);
pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons", false);
pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features", false);
pref("browser.preferences.moreFromMozilla", false);
pref("browser.vpn_promo.enabled", false);
pref("browser.privatebrowsing.vpnpromourl", "");
pref("browser.promo.focus.enabled", false);
pref("browser.promo.pin.enabled", false);
pref("browser.uitour.enabled", false);
pref("extensions.getAddons.showPane", false);
pref("extensions.htmlaboutaddons.recommendations.enabled", false);
pref("identity.fxaccounts.toolbar.enabled", false);
pref("browser.tabs.firefox-view", false);
pref("browser.referrals.enabled", false);

// Barra lateral do Nium: só favoritos e histórico (sem chat de IA de terceiros, sem abas sincronizadas)
pref("sidebar.main.tools", "bookmarks,history");

// Sem o aviso "arraste para fixar" na lateral (aparecia quebrado) e sem barra de favoritos,
// como no Nium Electron (Ctrl+Shift+B mostra a barra quando quiser)
pref("sidebar.verticalTabs.dragToPinPromo.dismissed", true);
pref("browser.toolbars.bookmarks.visibility", "never");

// Nova aba do Nium também na página inicial (sem o cache da página inicial do Firefox)
pref("browser.startup.homepage.abouthome_cache.enabled", false);

// Nova aba sempre atualizada (sem pré-carregar) e a página inicial é a mesma nova aba,
// para os atalhos ficarem guardados num lugar só
pref("browser.newtab.preload", false);
pref("browser.startup.homepage", "about:newtab");

// Barras mais finas (modo compacto do Firefox)
pref("browser.compactmode.show", true);
pref("browser.uidensity", 1);

// Nium Shield (uBlock Origin) vem na pasta do perfil: liga sem perguntar só as extensões
// dessa pasta (as de outros lugares continuam pedindo confirmação)
pref("extensions.autoDisableScopes", 14);
