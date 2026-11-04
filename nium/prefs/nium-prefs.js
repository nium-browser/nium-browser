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
