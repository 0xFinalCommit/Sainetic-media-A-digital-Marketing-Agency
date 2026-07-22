const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const setTranslateVars = (element, x, y) => {
  element.style.setProperty("--magnetic-x", `${x}px`);
  element.style.setProperty("--magnetic-y", `${y}px`);
};

window.addEventListener("load", () => window.setTimeout(() => qs(".page-loader")?.classList.add("loaded"), 350));

const themeToggle = qs(".theme-toggle");
const themeColor = qs('meta[name="theme-color"]');
const initialTheme = localStorage.getItem("sainetic-theme") || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
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
qsa(".nav-links a").forEach(link => link.addEventListener("click", () => nav.classList.remove("open")));

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
const subscribeScroll = callback => {
  if (lenis) {
    lenis.on("scroll", callback);
    return;
  }
  window.addEventListener("scroll", callback, { passive: true });
};
qsa(".section-tag, .eyebrow, .detail-number").forEach(element => element.classList.add("proximity-target"));
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
qsa("h1, .detail-main h2, .contact h2").forEach(wrapHeadingLetters);
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

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add("visible");
  observer.unobserve(entry.target);
}), { threshold: .12 });
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

const scrambleTargets = qsa(".section-tag, .eyebrow, h2 em, .detail-number, .proof-grid span").filter(element => !element.closest(".services-hero"));
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
