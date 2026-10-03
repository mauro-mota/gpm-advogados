/* GPM Advogados Associados */

// WhatsApp de cada sócia (código do país + DDD + número, só dígitos).
const WHATSAPP = {
  maria: "5581999993446",
  ana: "5581997106464",
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ---------- WhatsApp ---------- */

function messageFor(topic) {
  if (!topic) return "Olá! Gostaria de orientação sobre um caso.";
  if (topic === "Outro assunto") return "Olá! Gostaria de orientação sobre um caso de outra área.";
  return `Olá! Gostaria de orientação sobre um caso de ${topic}.`;
}

function wireWhatsApp(link) {
  const number = WHATSAPP[link.dataset.socia] || WHATSAPP.maria;
  link.href = `https://wa.me/${number}?text=${encodeURIComponent(messageFor(link.dataset.topic))}`;
  link.target = "_blank";
  link.rel = "noopener";
}

document.querySelectorAll(".js-wa").forEach(wireWhatsApp);

/* ---------- Escolha do assunto ---------- */

const composer = document.getElementById("composer");
const bubble = composer.querySelector(".bubble");
const preview = composer.querySelector(".js-preview");
const composerWa = composer.querySelector(".js-composer-wa");
let swapTimer;

composer.addEventListener("change", (e) => {
  if (e.target.name === "socia") {
    composerWa.dataset.socia = e.target.value;
    wireWhatsApp(composerWa);
    return;
  }
  if (e.target.name !== "assunto") return;
  const topic = e.target.value;
  composerWa.dataset.topic = topic;
  wireWhatsApp(composerWa);

  // troca da mensagem com um leve desfoque e um recuo do balão: o balão "recebeu" o assunto
  if (reduceMotion.matches) {
    preview.textContent = messageFor(topic);
    return;
  }
  clearTimeout(swapTimer);
  preview.classList.add("swap");
  bubble.classList.add("swap");
  swapTimer = setTimeout(() => {
    preview.textContent = messageFor(topic);
    preview.classList.remove("swap");
    bubble.classList.remove("swap");
  }, 140);
});
composer.addEventListener("submit", (e) => e.preventDefault());

/* ---------- Revelar ao rolar (uma vez) ---------- */

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" });

  // pequena cascata entre irmãos que entram juntos
  document.querySelectorAll(".reveal, .reveal-mask").forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal") || c.classList.contains("reveal-mask"));
    const i = siblings.indexOf(el);
    if (i > 0) el.style.transitionDelay = `${Math.min(i, 6) * 60}ms`;
    io.observe(el);
  });

  // o símbolo da faixa Família se desenha quando a faixa entra
  const familia = document.querySelector(".familia");
  new IntersectionObserver(([entry], obs) => {
    if (!entry.isIntersecting) return;
    familia.classList.add("in");
    obs.disconnect();
  }, { threshold: 0.25 }).observe(familia);

  /* abertura no celular: a lente só pode começar abaixo dos botões; --lens-k encolhe o decágono quando falta altura */
  const hero = document.querySelector(".hero");
  const heroCopy = document.querySelector(".hero-copy");
  const portrait = window.matchMedia("(max-width: 767px) and (orientation: portrait)");
  const fitLens = () => {
    if (!portrait.matches) { hero.style.removeProperty("--lens-k"); return; }
    const vw = window.innerWidth, vh = window.innerHeight;
    const copyBottom = heroCopy.offsetTop + heroCopy.offsetHeight;
    const gap = 20; // folga entre o último botão e o topo da lente
    const available = vh - 0.06 * vw - copyBottom - gap; // a lente encosta a 6vw do rodapé
    const k = Math.min(1, Math.max(0, available / 2 / (0.42 * vw)));
    hero.style.setProperty("--lens-k", k.toFixed(3));
  };
  fitLens();
  new ResizeObserver(fitLens).observe(heroCopy);
  window.addEventListener("resize", fitLens, { passive: true });
  document.fonts?.ready.then(fitLens);

  /* topo com linha depois de rolar */
  const topBar = document.querySelector(".top");
  new IntersectionObserver(([entry]) => {
    topBar.classList.toggle("scrolled", !entry.isIntersecting);
  }).observe(document.querySelector(".top-sentinel"));

  /* barra fixa no celular: aparece depois da abertura, some no contato */
  const dock = document.querySelector(".dock");
  let heroVisible = true;
  let contactVisible = false;
  const update = () => dock.classList.toggle("show", !heroVisible && !contactVisible);
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; topBar.classList.toggle("past-hero", !entry.isIntersecting); update(); }, { threshold: 0.05 })
    .observe(document.querySelector(".hero"));
  new IntersectionObserver(([entry]) => { contactVisible = entry.isIntersecting; update(); }, { threshold: 0.1 })
    .observe(document.querySelector(".contact"));

  /* caminhos: a linha que cruza o meio da tela é a "em leitura" */
  const current = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("current", entry.isIntersecting));
  }, { rootMargin: "-42% 0px -42% 0px", threshold: 0 });
  document.querySelectorAll(".path").forEach((row) => current.observe(row));
} else {
  document.querySelectorAll(".reveal, .reveal-mask").forEach((el) => el.classList.add("in"));
  document.querySelector(".familia").classList.add("in");
}
