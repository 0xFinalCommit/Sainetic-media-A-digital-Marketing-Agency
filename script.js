const serviceData = {
  web: { label: "Web Design", title: "Websites built to move people.", description: "Strategic, responsive websites that make your value obvious and turn more visits into qualified conversations.", timeline: "3-6 weeks", price: "Rs. 25,000", deliverables: ["UX strategy and wireframes", "Custom responsive design", "Speed optimized development", "SEO and analytics foundation"] },
  graphic: { label: "Graphic Design", title: "A visual language people remember.", description: "Cohesive brand and campaign design that makes every customer touchpoint feel unmistakably yours.", timeline: "2-4 weeks", price: "Rs. 15,000", deliverables: ["Creative direction", "Identity and logo system", "Social and campaign toolkit", "Brand usage guidelines"] },
  video: { label: "Video Editing", title: "Stories engineered to hold attention.", description: "Sharp, platform-native video that earns the pause, communicates quickly, and keeps your brand moving.", timeline: "5-10 days", price: "Rs. 8,000", deliverables: ["Narrative and pacing", "Professional edit and grade", "Motion graphics and captions", "Multi-format exports"] },
  ads: { label: "Meta Ads", title: "Performance without the guesswork.", description: "End-to-end Meta campaigns combining strong creative, disciplined testing, and clear reporting.", timeline: "Monthly", price: "Rs. 20,000/mo", deliverables: ["Campaign and funnel strategy", "Creative testing system", "Audience and budget optimization", "Weekly performance reporting"] }
};

const pricingData = {
  oneTime: {
    starter: { price: "&#8377;15K<span>+</span>", description: "For new businesses ready to show up professionally.", features: ["Strategic kickoff", "One core service", "2 revision rounds", "90-day support"], cta: "Start a project" },
    growth: { price: "&#8377;35K<span>+</span>", description: "For ambitious brands ready to sharpen and scale.", features: ["Growth strategy", "Two integrated services", "Priority collaboration", "180-day support"], cta: "Build momentum" },
    premium: { price: "Custom", description: "For category leaders who need an embedded creative team.", features: ["Full creative direction", "All four capabilities", "Dedicated team", "Continuous optimization"], cta: "Talk to us" }
  },
  monthly: {
    starter: { price: "&#8377;10K<span>/mo</span>", description: "Consistent creative support for brands building momentum.", features: ["Monthly planning call", "12 design requests", "Social creative support", "Monthly reporting"], cta: "Start monthly" },
    growth: { price: "&#8377;30K<span>/mo</span>", description: "An embedded growth partner for active, scaling brands.", features: ["Growth and creative strategy", "Unlimited design queue", "Ads creative and optimization", "Priority turnaround"], cta: "Scale monthly" },
    premium: { price: "&#8377;60K<span>/mo</span>", description: "A senior multidisciplinary team without agency overhead.", features: ["Dedicated creative lead", "All four capabilities", "Weekly performance reviews", "Fast-track production"], cta: "Build your team" }
  }
};

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const setTranslateVars = (element, x, y) => {
  element.style.setProperty("--magnetic-x", `${x}px`);
  element.style.setProperty("--magnetic-y", `${y}px`);
};

window.addEventListener("load", () => window.setTimeout(() => qs(".page-loader")?.classList.add("loaded"), 350));

const themeToggle = qs(".theme-toggle");
const themeColor = qs('meta[name="theme-color"]');
const savedTheme = localStorage.getItem("sainetic-theme");
const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

const setTheme = theme => {
  const light = theme === "light";
  document.documentElement.dataset.theme = theme;
  themeToggle.classList.toggle("active", light);
  themeToggle.setAttribute("aria-pressed", String(light));
  themeToggle.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
  themeColor.setAttribute("content", light ? "#edf1e9" : "#0b1110");
  localStorage.setItem("sainetic-theme", theme);
};

setTheme(initialTheme);
themeToggle.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light"));

const menuButton = qs(".menu-toggle");
const nav = qs(".nav-links");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", open);
});
qsa(".nav-links a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

const finePointer = window.matchMedia("(pointer: fine)").matches;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const motionEnabled = finePointer && !reducedMotion;
const lenis = !reducedMotion && window.Lenis ? new window.Lenis({
  autoRaf: true,
  anchors: true,
  stopInertiaOnNavigate: true,
  lerp: .09,
  wheelMultiplier: .95,
  prevent: node => node?.closest?.("[data-lenis-prevent]")
}) : null;
const getScrollY = () => lenis ? lenis.scroll : window.scrollY;
const subscribeScroll = callback => {
  if (lenis) {
    lenis.on("scroll", callback);
    return;
  }
  window.addEventListener("scroll", callback, { passive: true });
};
qsa(".section-tag, .eyebrow, .card-index, .service-icon, .text-link").forEach(element => element.classList.add("proximity-target"));
const proximityTargets = qsa(".proximity-word, .proximity-target");
const activeProximityTargets = new Set();
const proximityTargetCenters = new WeakMap();
let activeHeading = null;
let activeHeadingChars = [];
let activeHeadingCenters = [];
let pointerFrame = 0;
let pointerX = 0;
let pointerY = 0;
let smoothX = 0;
let smoothY = 0;
let pointerReady = false;
let proximityMeasurementsDirty = true;
const wrapHeadingLetters = heading => {
  const wrapNode = node => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        child.textContent.split("").forEach(char => {
          if (char === " ") return fragment.append(document.createTextNode(" "));
          const span = document.createElement("span");
          span.className = "vp-char";
          span.textContent = char;
          fragment.append(span);
        });
        child.replaceWith(fragment);
      } else if (!child.classList?.contains("vp-char")) {
        wrapNode(child);
      }
    });
  };
  heading.classList.add("vp-heading");
  wrapNode(heading);
};
qsa("h1, .section-heading h2, .statement, .contact h2, .testimonial p").forEach(wrapHeadingLetters);
const cacheHeadingCenters = heading => {
  activeHeading = heading;
  activeHeadingChars = qsa(".vp-char", heading);
  activeHeadingCenters = activeHeadingChars.map(char => {
    const rect = char.getBoundingClientRect();
    return [rect.left + rect.width / 2, rect.top + rect.height / 2];
  });
};
const cacheProximityTarget = target => {
  const rect = target.getBoundingClientRect();
  proximityTargetCenters.set(target, [rect.left + rect.width / 2, rect.top + rect.height / 2]);
};
const refreshProximityMeasurements = () => {
  if (activeHeading) cacheHeadingCenters(activeHeading);
  activeProximityTargets.forEach(cacheProximityTarget);
  proximityMeasurementsDirty = false;
};
const markProximityMeasurementsDirty = () => {
  proximityMeasurementsDirty = true;
};
qsa(".vp-heading").forEach(heading => {
  heading.addEventListener("pointerenter", () => cacheHeadingCenters(heading), { passive: true });
  heading.addEventListener("pointerleave", () => {
    activeHeadingChars.forEach(char => {
      char.style.setProperty("--vp-x", "1");
      char.classList.remove("is-near");
    });
    activeHeading = null;
    activeHeadingChars = [];
    activeHeadingCenters = [];
  }, { passive: true });
});
const resetProximity = () => proximityTargets.forEach(target => {
  target.style.setProperty("--proximity-scale", "1");
  target.style.setProperty("--proximity-glow", "0");
  target.classList.remove("is-near");
});
const updateProximity = (x, y) => {
  if (proximityMeasurementsDirty) refreshProximityMeasurements();
  activeHeadingChars.forEach((char, index) => {
    const center = activeHeadingCenters[index];
    const proximity = center ? Math.max(0, 1 - Math.hypot(x - center[0], y - center[1]) / 150) : 0;
    char.style.setProperty("--vp-x", String(1 + proximity * .16));
    char.classList.toggle("is-near", proximity > .12);
  });
  activeProximityTargets.forEach(target => {
    const center = proximityTargetCenters.get(target);
    if (!center) return;
    const targetX = center[0];
    const targetY = center[1];
    const distance = Math.hypot(x - targetX, y - targetY);
    const proximity = Math.max(0, 1 - distance / 260);
    target.style.setProperty("--proximity-scale", String(1 + proximity * .045));
    target.style.setProperty("--proximity-glow", proximity.toFixed(3));
    target.classList.toggle("is-near", proximity > .12);
  });
};
const runPointerFrame = () => {
  smoothX += (pointerX - smoothX) * .22;
  smoothY += (pointerY - smoothY) * .22;
  document.documentElement.style.setProperty("--mx", `${smoothX}px`);
  document.documentElement.style.setProperty("--my", `${smoothY}px`);
  updateProximity(smoothX, smoothY);
  if (Math.abs(pointerX - smoothX) > .15 || Math.abs(pointerY - smoothY) > .15) {
    pointerFrame = requestAnimationFrame(runPointerFrame);
  } else {
    pointerFrame = 0;
  }
};
const proximityObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      activeProximityTargets.add(entry.target);
      cacheProximityTarget(entry.target);
    } else {
      activeProximityTargets.delete(entry.target);
      proximityTargetCenters.delete(entry.target);
      entry.target.style.setProperty("--proximity-scale", "1");
      entry.target.style.setProperty("--proximity-glow", "0");
      entry.target.classList.remove("is-near");
    }
  });
}, { rootMargin: "80px 0px", threshold: .1 });
proximityTargets.forEach(target => proximityObserver.observe(target));

if (motionEnabled && proximityTargets.length) {
  window.addEventListener("resize", () => {
    markProximityMeasurementsDirty();
  }, { passive: true });
  subscribeScroll(markProximityMeasurementsDirty);
  document.addEventListener("pointermove", event => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!pointerReady) {
      smoothX = pointerX;
      smoothY = pointerY;
      pointerReady = true;
    }
    if (!pointerFrame) pointerFrame = requestAnimationFrame(runPointerFrame);
  }, { passive: true });
  document.addEventListener("pointerleave", () => {
    resetProximity();
    activeHeadingChars.forEach(char => {
      char.style.setProperty("--vp-x", "1");
      char.classList.remove("is-near");
    });
  });
}

if (motionEnabled) qsa(".magnetic").forEach(button => {
  let magneticFrame = 0;
  let magneticX = 0;
  let magneticY = 0;
  let magneticRect = null;
  let renderedX = 0;
  let renderedY = 0;
  const cacheMagneticRect = () => {
    magneticRect = button.getBoundingClientRect();
  };
  button.addEventListener("pointerenter", cacheMagneticRect, { passive: true });
  button.addEventListener("pointermove", event => {
    const rect = magneticRect || button.getBoundingClientRect();
    magneticX = (event.clientX - rect.left - rect.width / 2) * .1;
    magneticY = (event.clientY - rect.top - rect.height / 2) * .1;
    if (magneticFrame) return;
    magneticFrame = requestAnimationFrame(() => {
      if (Math.abs(magneticX - renderedX) > .1 || Math.abs(magneticY - renderedY) > .1) {
        renderedX = magneticX;
        renderedY = magneticY;
        setTranslateVars(button, renderedX, renderedY);
      }
      magneticFrame = 0;
    });
  }, { passive: true });
  button.addEventListener("pointerleave", () => {
    magneticRect = null;
    renderedX = 0;
    renderedY = 0;
    setTranslateVars(button, 0, 0);
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    observer.unobserve(entry.target);
  });
}, { threshold: .12 });
qsa(".reveal").forEach((element, index) => {
  element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
  observer.observe(element);
});

const scrambleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const scrambleElement = element => {
  if (reducedMotion || element.dataset.scrambled === "true") return;
  const original = element.textContent.trim();
  if (!original) return;
  element.dataset.scrambled = "true";
  element.classList.add("scramble-active");
  const start = performance.now();
  const duration = Math.min(760, 280 + original.length * 24);
  let lastFrame = 0;

  const animate = time => {
    if (time - lastFrame < 32) {
      requestAnimationFrame(animate);
      return;
    }
    lastFrame = time;
    const progress = Math.min((time - start) / duration, 1);
    element.textContent = original.split("").map((char, index) => {
      if (char === " " || char === "/" || char === "-") return char;
      const revealAt = index / original.length;
      if (progress > revealAt + .22) return char;
      return scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
    }).join("");
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.textContent = original;
      element.classList.remove("scramble-active");
    }
  };

  requestAnimationFrame(animate);
};

const scrambleTargets = qsa(".section-tag, .eyebrow, h2 em, .service-icon, .card-index, .process-step small, .popular").filter(element => !element.closest(".hero"));
scrambleTargets.forEach(element => element.classList.add("scramble-ready"));
const scrambleObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    scrambleElement(entry.target);
    scrambleObserver.unobserve(entry.target);
  });
}, { threshold: .55 });
scrambleTargets.forEach(element => scrambleObserver.observe(element));

const scrambleToText = (element, nextText) => {
  if (reducedMotion) {
    element.textContent = nextText;
    return;
  }
  const start = performance.now();
  const duration = 420;
  let lastFrame = 0;
  const animate = time => {
    if (time - lastFrame < 36) {
      requestAnimationFrame(animate);
      return;
    }
    lastFrame = time;
    const progress = Math.min((time - start) / duration, 1);
    element.textContent = nextText.split("").map((char, index) => {
      if (char === " " || char === ".") return char;
      return progress > index / nextText.length ? char : scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
    }).join("");
    if (progress < 1) requestAnimationFrame(animate);
    else element.textContent = nextText;
  };
  requestAnimationFrame(animate);
};

qsa(".rotating-word").forEach(word => {
  const words = (word.dataset.words || word.textContent).split(",").map(item => item.trim()).filter(Boolean);
  let index = Math.max(0, words.indexOf(word.textContent.trim()));
  let rotationFrame = 0;
  let lastRotation = 0;
  let rotationActive = false;
  const rotate = time => {
    if (!rotationActive) {
      rotationFrame = 0;
      return;
    }
    if (!lastRotation) lastRotation = time;
    if (time - lastRotation >= 4500) {
      index = (index + 1) % words.length;
      scrambleToText(word, words[index]);
      lastRotation = time;
    }
    rotationFrame = requestAnimationFrame(rotate);
  };
  const startRotation = () => {
    if (rotationFrame || words.length < 2 || reducedMotion) return;
    rotationActive = true;
    lastRotation = 0;
    rotationFrame = requestAnimationFrame(rotate);
  };
  const stopRotation = () => {
    rotationActive = false;
  };
  const rotationObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) startRotation();
    else stopRotation();
  }, { threshold: .45 });
  rotationObserver.observe(word);
});

if (motionEnabled) qsa(".service-card, .price-card").forEach(card => {
  let cardFrame = 0;
  let cardX = 0;
  let cardY = 0;
  let cardRect = null;
  card.addEventListener("pointerenter", () => {
    cardRect = card.getBoundingClientRect();
  }, { passive: true });
  card.addEventListener("pointermove", event => {
    const rect = cardRect || card.getBoundingClientRect();
    cardX = event.clientX - rect.left;
    cardY = event.clientY - rect.top;
    if (cardFrame) return;
    cardFrame = requestAnimationFrame(() => {
      card.style.setProperty("--card-x", `${cardX}px`);
      card.style.setProperty("--card-y", `${cardY}px`);
      cardFrame = 0;
    });
  }, { passive: true });
  card.addEventListener("pointerleave", () => {
    cardRect = null;
    card.style.setProperty("--card-x", "50%");
    card.style.setProperty("--card-y", card.classList.contains("price-card") ? "20%" : "50%");
  });
});

const heroVisual = qs(".hero-visual");
let scrollFrame = 0;
const updateHeroParallax = () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    if (!heroVisual || window.innerWidth < 760) return;
    heroVisual.style.transform = `translate3d(0, ${getScrollY() * .035}px, 0)`;
  });
};
if (motionEnabled && heroVisual) subscribeScroll(updateHeroParallax);

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const target = Number(entry.target.dataset.count);
    const start = performance.now();
    const animate = time => {
      const progress = Math.min((time - start) / 1300, 1);
      entry.target.textContent = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: .6 });
qsa("[data-count]").forEach(counter => counterObserver.observe(counter));

const timeline = qs(".timeline");
const timelineObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) qs(".timeline-progress").style.width = "100%";
}, { threshold: .25 });
timelineObserver.observe(timeline);

const serviceModal = qs(".service-modal");
const modalContent = qs(".modal-content");
const openService = key => {
  const service = serviceData[key];
  modalContent.innerHTML = `
    <div class="section-tag">${service.label}</div>
    <h2>${service.title}</h2>
    <p>${service.description}</p>
    <div class="modal-meta"><div><span>Typical timeline</span><strong>${service.timeline}</strong></div><div><span>Starting at</span><strong>${service.price}</strong></div></div>
    <ul>${service.deliverables.map(item => `<li>${item}</li>`).join("")}</ul>
    <a class="button button-primary" href="#contact"><span>Get a free consultation</span><b>&nearr;</b></a>`;
  qs('a[href="#contact"]', modalContent).addEventListener("click", () => serviceModal.close());
  lenis?.stop();
  serviceModal.showModal();
};
qsa(".service-card").forEach(card => {
  card.addEventListener("click", event => {
    if (event.target.closest(".service-more")) return;
    openService(card.dataset.service);
  });
  card.addEventListener("keydown", event => {
    if (event.target.closest(".service-more")) return;
    if (event.key === "Enter") openService(card.dataset.service);
  });
});
qs(".service-modal .modal-close").addEventListener("click", () => serviceModal.close());

const lightbox = qs(".lightbox");
const lightboxArt = qs(".lightbox-art");
const lightboxTitle = qs(".lightbox-copy h2");
const lightboxDescription = qs(".lightbox-copy p");
const lightboxAction = qs(".lightbox-action");
const lightboxActionLabel = qs(".lightbox-action span");
const downloadPanelTitle = qs(".project-download-panel strong");
const collageCards = qsa(".project-collage a");
const projectArtClasses = ["art-one", "art-two", "art-three", "art-four"];
qsa(".project").forEach(project => project.addEventListener("click", () => {
  lightboxTitle.textContent = project.dataset.project;
  lightboxDescription.textContent = project.dataset.description;
  const mode = project.dataset.mode || "website";
  const collageItems = (project.dataset.collage || "").split(",").map(item => item.trim()).filter(Boolean);
  const collageLinks = (project.dataset.collageLinks || "").split(",").map(item => item.trim()).filter(Boolean);
  collageCards.forEach((card, index) => {
    const target = collageLinks[index] ? qs(collageLinks[index]) : null;
    const media = qs(".project-collage-media", card);
    qs("strong", card).textContent = collageItems[index] || `Project ${String(index + 1).padStart(2, "0")}`;
    card.href = target?.dataset.link || "#";
    card.target = target?.dataset.link ? "_blank" : "_self";
    card.rel = target?.dataset.link ? "noreferrer noopener" : "";
    media.style.backgroundImage = target?.dataset.image ? `url("${target.dataset.image}")` : "";
  });
  lightboxArt.classList.toggle("has-collage", mode === "website");
  lightboxArt.classList.toggle("is-download", mode === "download");
  if (mode === "download") {
    const downloadPath = project.dataset.download || "";
    if (downloadPath) {
      lightboxAction.href = downloadPath;
      lightboxAction.setAttribute("download", "");
      lightboxAction.removeAttribute("aria-disabled");
    } else {
      lightboxAction.removeAttribute("href");
      lightboxAction.removeAttribute("download");
      lightboxAction.setAttribute("aria-disabled", "true");
    }
    lightboxActionLabel.textContent = project.dataset.downloadLabel || "Download Portfolio";
    downloadPanelTitle.textContent = project.dataset.project;
  } else {
    lightboxAction.href = "#contact";
    lightboxAction.removeAttribute("download");
    lightboxAction.removeAttribute("aria-disabled");
    lightboxActionLabel.textContent = "Build something like this";
    downloadPanelTitle.textContent = "";
  }
  lightboxArt.classList.remove(...projectArtClasses);
  lightboxArt.classList.add(project.dataset.art || "art-one");
  lenis?.stop();
  lightbox.showModal();
}));
qs(".lightbox .modal-close").addEventListener("click", () => lightbox.close());
lightboxAction.addEventListener("click", event => {
  if (lightboxAction.getAttribute("aria-disabled") === "true") {
    event.preventDefault();
    return;
  }
  lightbox.close();
});
qsa("dialog").forEach(dialog => {
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => lenis?.start());
});

const testimonials = qsa(".testimonial");
let activeTestimonial = 0;
let testimonialFrame = 0;
let lastTestimonial = 0;
let testimonialsActive = false;
const showTestimonial = direction => {
  testimonials[activeTestimonial].classList.remove("active");
  activeTestimonial = (activeTestimonial + direction + testimonials.length) % testimonials.length;
  testimonials[activeTestimonial].classList.add("active");
};
qs(".slider-button.next").addEventListener("click", () => showTestimonial(1));
qs(".slider-button.prev").addEventListener("click", () => showTestimonial(-1));
const runTestimonials = time => {
  if (!testimonialsActive || document.hidden) {
    testimonialFrame = 0;
    lastTestimonial = 0;
    return;
  }
  if (!lastTestimonial) lastTestimonial = time;
  if (time - lastTestimonial >= 6500) {
    showTestimonial(1);
    lastTestimonial = time;
  }
  testimonialFrame = requestAnimationFrame(runTestimonials);
};
const testimonialObserver = new IntersectionObserver(entries => {
  testimonialsActive = entries[0].isIntersecting;
  if (testimonialsActive && !testimonialFrame) testimonialFrame = requestAnimationFrame(runTestimonials);
}, { threshold: .25 });
if (testimonials.length) testimonialObserver.observe(testimonials[0].parentElement);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && testimonialsActive && !testimonialFrame) testimonialFrame = requestAnimationFrame(runTestimonials);
});

const pricingToggle = qs(".pricing-toggle button");
const pricingLabels = qsa(".toggle-label");
const priceCards = qsa(".price-card");
let monthlyPricing = false;
let pricingTimeouts = [];

const clearPricingTimeouts = () => {
  pricingTimeouts.forEach(timeoutId => window.clearTimeout(timeoutId));
  pricingTimeouts = [];
};

const renderPricing = (mode, animate = true) => {
  monthlyPricing = mode === "monthly";
  pricingToggle.classList.toggle("active", monthlyPricing);
  pricingToggle.setAttribute("aria-pressed", String(monthlyPricing));
  pricingLabels.forEach((label, index) => label.classList.toggle("active", index === Number(monthlyPricing)));
  clearPricingTimeouts();
  priceCards.forEach((card, index) => {
    const applyPlan = () => {
      const plan = pricingData[mode][card.dataset.plan];
      qs("h3", card).innerHTML = plan.price;
      qs("p", card).textContent = plan.description;
      qs("ul", card).innerHTML = plan.features.map(feature => `<li>${feature}</li>`).join("");
      qs(".button span", card).textContent = plan.cta;
      card.classList.remove("switching");
    };

    if (!animate) {
      applyPlan();
      return;
    }

    card.classList.add("switching");
    const timeoutId = window.setTimeout(applyPlan, 180 + index * 65);
    pricingTimeouts.push(timeoutId);
  });
};

const updatePricing = () => renderPricing(monthlyPricing ? "oneTime" : "monthly");
renderPricing("oneTime", false);
pricingToggle.addEventListener("click", updatePricing);

qsa(".faq-item").forEach(item => {
  const summary = qs("summary", item);
  const answer = qs(".faq-answer", item);

  summary.addEventListener("click", event => {
    event.preventDefault();
    const opening = !item.open;

    if (opening) {
      item.open = true;
      answer.style.height = "0px";
      requestAnimationFrame(() => {
        answer.style.height = `${answer.scrollHeight}px`;
      });
    } else {
      answer.style.height = `${answer.scrollHeight}px`;
      requestAnimationFrame(() => {
        answer.style.height = "0px";
      });
    }

    answer.addEventListener("transitionend", () => {
      if (!opening) item.open = false;
      answer.style.height = opening ? "auto" : "0px";
    }, { once: true });
  });
});
