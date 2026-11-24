// Service Worker do TaskMobile
// Guarda os arquivos do app no celular para ele abrir rápido e poder ser instalado.
// As tarefas NÃO ficam no cache: elas sempre vêm do Supabase.
// Ao alterar qualquer arquivo do app, troque a versão abaixo (v1 -> v2).
const CACHE = "taskmobile-v2";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Instalação: salva os arquivos do app
self.addEventListener("install", function(evento) {
  evento.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ARQUIVOS);
    })
  );
  self.skipWaiting();
});

// Ativação: apaga caches de versões antigas
self.addEventListener("activate", function(evento) {
  evento.waitUntil(
    caches.keys().then(function(nomes) {
      return Promise.all(
        nomes.filter(function(nome) { return nome !== CACHE; })
             .map(function(nome) { return caches.delete(nome); })
      );
    })
  );
  self.clients.claim();
});

// Busca: arquivos do próprio app vêm do cache; o resto (Supabase) vai direto para a internet
self.addEventListener("fetch", function(evento) {
  const url = new URL(evento.request.url);

  if (evento.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  evento.respondWith(
    caches.match(evento.request).then(function(resposta) {
      return resposta || fetch(evento.request);
    })
  );
});
