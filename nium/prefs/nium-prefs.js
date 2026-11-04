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

// Nova aba sem conteúdo patrocinado
pref("browser.newtabpage.activity-stream.showSponsored", false);
pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
pref("browser.newtabpage.activity-stream.default.sites", "");

// Conta Mozilla (sincronização da Mozilla) desligada: o Nium terá a própria sincronização
pref("identity.fxaccounts.enabled", false);
