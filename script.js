(() => {
  "use strict";

  /* =========================================================
     1. DYNAMIC FOOTER YEAR
     ========================================================= */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* =========================================================
     2. RETRO-COSMIC WEB AUDIO SYNTHESIZER (Zero dependencies)
     ========================================================= */
  class CosmicAudio {
    constructor() {
      this.ctx = null;
      // SFX ON by default everywhere, unless user explicitly clicked OFF
      this.enabled = localStorage.getItem("space_sfx") !== "false";
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }

    toggle() {
      this.init();
      this.enabled = !this.enabled;
      localStorage.setItem("space_sfx", this.enabled ? "true" : "false");
      if (this.enabled) {
        this.chime();
      }
      return this.enabled;
    }

    bark() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.13);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);

      // Cute secondary harmonic
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(460, now + 0.02);
      osc2.frequency.exponentialRampToValueAtTime(200, now + 0.1);

      gain2.gain.setValueAtTime(0.12, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(now + 0.02);
      osc2.stop(now + 0.12);
    }

    chime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      // Happy cosmic victory arpeggio: C5 -> E5 -> G5 -> C6
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const noteTime = this.ctx.currentTime + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.18, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.34);
      });
    }

    starTwinkle() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  const sfx = new CosmicAudio();

  // Wire up audio toggle button
  const soundToggle = document.getElementById("soundToggle");
  const updateSoundUI = () => {
    if (!soundToggle) return;
    const label = soundToggle.querySelector(".sound-label");
    const icon = soundToggle.querySelector(".sound-icon");
    if (sfx.enabled) {
      soundToggle.classList.add("is-active");
      if (label) label.textContent = "SFX: ON";
      if (icon) icon.textContent = "🔊";
    } else {
      soundToggle.classList.remove("is-active");
      if (label) label.textContent = "SFX: OFF";
      if (icon) icon.textContent = "🔈";
    }
  };

  if (soundToggle) {
    updateSoundUI();
    soundToggle.addEventListener("click", () => {
      sfx.toggle();
      updateSoundUI();
    });
  }

  // Unlock Web Audio API context on first user interaction (touch/click/key)
  const unlockAudioContext = () => {
    sfx.init();
    window.removeEventListener("pointerdown", unlockAudioContext);
    window.removeEventListener("keydown", unlockAudioContext);
  };
  window.addEventListener("pointerdown", unlockAudioContext, { passive: true });
  window.addEventListener("keydown", unlockAudioContext, { passive: true });

  /* =========================================================
     3. SMOOTH RAF-THROTTLED CURSOR GLOW & PARALLAX
     ========================================================= */
  const background = document.querySelector(".background");
  const cursorGlow = document.querySelector(".cursor-glow");
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;

  if (isFinePointer && background && cursorGlow) {
    let mouseX = 0;
    let mouseY = 0;
    let rafScheduled = false;

    const renderParallax = () => {
      const normX = (mouseX / window.innerWidth - 0.5) * 2;
      const normY = (mouseY / window.innerHeight - 0.5) * 2;

      background.style.transform = `translate3d(${normX * 3}px, ${normY * 3}px, 0)`;
      cursorGlow.style.left = `${mouseX}px`;
      cursorGlow.style.top = `${mouseY}px`;
      cursorGlow.style.opacity = "1";
      rafScheduled = false;
    };

    window.addEventListener("pointermove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(renderParallax);
      }
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      cursorGlow.style.opacity = "0";
    });
  }

  /* =========================================================
     4. HARDWARE-ACCELERATED SHOOTING STARS ENGINE (Canvas)
     ========================================================= */
  const canvas = document.getElementById("shootingStarsCanvas");
  let spawnShootingStar = () => {};

  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    const stars = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resize, { passive: true });
    resize();

    class ShootingStar {
      constructor(customX, customY) {
        // Angle between 30 and 36 degrees (downward-right diagonal)
        this.angle = (31 + Math.random() * 5) * (Math.PI / 180);
        const isMobile = width < 700;
        const speed = isMobile ? (7 + Math.random() * 4) : (9 + Math.random() * 5);
        this.vx = Math.cos(this.angle) * speed;
        this.vy = Math.sin(this.angle) * speed;

        if (customX !== undefined && customY !== undefined) {
          this.x = customX;
          this.y = customY;
        } else {
          // Spawn away from center content: upper-left or upper-right
          if (Math.random() > 0.5) {
            this.x = Math.random() * (width * 0.35);
            this.y = -10 + Math.random() * (height * 0.2);
          } else {
            this.x = width * 0.6 + Math.random() * (width * 0.35);
            this.y = -10 + Math.random() * (height * 0.25);
          }
        }

        this.length = isMobile ? (110 + Math.random() * 50) : (160 + Math.random() * 80);
        this.width = isMobile ? 1.4 : 1.8;
        this.life = 0;
        this.maxLife = 55 + Math.random() * 25; // frames (~1.0s - 1.4s)
        this.alpha = 0;
        this.maxAlpha = 0.72;
        this.isDead = false;
      }

      update() {
        this.life++;
        this.x += this.vx;
        this.y += this.vy;

        const progress = this.life / this.maxLife;
        if (progress < 0.1) {
          this.alpha = (progress / 0.1) * this.maxAlpha;
        } else if (progress > 0.65) {
          this.alpha = ((1 - progress) / 0.35) * this.maxAlpha;
        } else {
          this.alpha = this.maxAlpha;
        }

        if (this.life >= this.maxLife || this.x > width + 100 || this.y > height + 100) {
          this.isDead = true;
        }
      }

      draw() {
        if (this.alpha <= 0.01) return;

        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));

        // Radiant cyan-violet-white gradient tail (refined & slender)
        const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        grad.addColorStop(0, 'rgba(101, 220, 255, 0)');
        grad.addColorStop(0.3, 'rgba(155, 140, 255, 0.3)');
        grad.addColorStop(0.75, 'rgba(101, 220, 255, 0.85)');
        grad.addColorStop(1, '#ffffff');

        ctx.strokeStyle = grad;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';

        ctx.shadowColor = '#65dcff';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        // Delicate glowing star head
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width * 1.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    spawnShootingStar = (x, y) => {
      stars.push(new ShootingStar(x, y));
      // NOTE: Removed automatic starTwinkle() here so no repeating interval noise plays
    };

    // Immediate first star on load (200ms), then continuous natural intervals
    let lastSpawn = 0;
    let nextInterval = 200;

    const animateLoop = (timestamp) => {
      ctx.clearRect(0, 0, width, height);

      if (timestamp - lastSpawn > nextInterval) {
        lastSpawn = timestamp;
        nextInterval = 2200 + Math.random() * 2500; // Continuous meteors every 2.2s - 4.7s
        if (!document.hidden) {
          spawnShootingStar();
        }
      }

      for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        star.update();
        star.draw();
        if (star.isDead) {
          stars.splice(i, 1);
        }
      }

      requestAnimationFrame(animateLoop);
    };

    requestAnimationFrame(animateLoop);
  }

  // Stardust click particles
  const createStardust = (x, y) => {
    const particleCount = 6;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement("span");
      p.className = "stardust-particle";

      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5);
      const distance = 25 + Math.random() * 35;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const size = 3 + Math.random() * 3;

      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.setProperty("--dx", `${dx}px`);
      p.style.setProperty("--dy", `${dy}px`);

      document.body.appendChild(p);

      p.addEventListener("animationend", () => {
        p.remove();
      });
    }
  };

  // Cosmic click & key shortcuts to summon shooting stars
  window.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button, #puppy, input")) return;
    createStardust(e.clientX, e.clientY);
    spawnShootingStar(Math.max(10, e.clientX - 100), Math.max(10, e.clientY - 75));
    if (sfx.enabled) sfx.starTwinkle();
  });

  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key.toLowerCase() === "s") {
      spawnShootingStar(window.innerWidth * 0.25, window.innerHeight * 0.15);
      if (sfx.enabled) sfx.starTwinkle();
    }
  });

  /* =========================================================
     5. INTERACTIVE PUPPY COMPANION
     ========================================================= */
  const puppy = document.getElementById("puppy");
  const bubble = document.getElementById("puppyBubble");

  if (puppy) {
    let running = false;
    let quoteIndex = 0;

    const restingQuotes = [
      "Will you play with me? I'm Bored🥺...",
      "Scanning deep space for treats... 🦴",
      "Houston, I am a very good boy. 🚀",
      "Zero-gravity zoomies ready! 🐾",
      "Is that a comet or a tennis ball? 🎾",
      "Ready for another space sprint! ✨"
    ];

    const setBubble = (text) => {
      if (bubble) bubble.textContent = text;
    };

    const easeInOut = (t) =>
      t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const face = (direction) => {
      puppy.classList.remove("run-facing-left", "run-facing-right");
      puppy.classList.add(
        direction === "left" ? "run-facing-left" : "run-facing-right"
      );
    };

    const animateRun = (fromX, toX, duration, direction, done) => {
      const start = performance.now();
      face(direction);

      const frame = (now) => {
        const raw = Math.min((now - start) / duration, 1);
        const progress = easeInOut(raw);
        const x = fromX + (toX - fromX) * progress;

        puppy.style.transform = `translate3d(${x}px, 0, 0)`;

        if (raw < 1) {
          requestAnimationFrame(frame);
        } else {
          done();
        }
      };

      requestAnimationFrame(frame);
    };

    const runPuppy = () => {
      if (running) return;
      running = true;

      sfx.bark();

      const rect = puppy.getBoundingClientRect();
      const startLeft = rect.left;
      const startTop = rect.top;
      const puppyWidth = rect.width;

      puppy.style.setProperty("--puppy-start-left", `${startLeft}px`);
      puppy.style.setProperty("--puppy-start-top", `${startTop}px`);
      puppy.classList.add("is-running");
      puppy.style.transform = "translate3d(0, 0, 0)";

      setBubble("Catch me! 🐾");

      const farLeft = -(startLeft - 10);
      const farRight = window.innerWidth - puppyWidth - 10 - startLeft;
      const duration = window.innerWidth > 720 ? 5800 : 4200;

      // Leg 1: Home -> Far Left
      animateRun(0, farLeft, duration, "left", () => {
        setBubble("Zoomies engaged! 🚀");
        sfx.bark();

        setTimeout(() => {
          // Leg 2: Far Left -> Far Right
          animateRun(farLeft, farRight, duration, "right", () => {
            setBubble("Can't catch me! 💨");
            sfx.bark();

            setTimeout(() => {
              // Leg 3: Far Right -> Home
              animateRun(farRight, 0, duration, "left", () => {
                puppy.style.transform = "";
                puppy.classList.remove(
                  "is-running",
                  "run-facing-left",
                  "run-facing-right"
                );
                puppy.style.removeProperty("--puppy-start-left");
                puppy.style.removeProperty("--puppy-start-top");

                setBubble("I won! Good boy status: 100% 😄");
                sfx.chime();
                running = false;

                setTimeout(() => {
                  quoteIndex = (quoteIndex + 1) % restingQuotes.length;
                  setBubble(restingQuotes[quoteIndex]);
                }, 2800);
              });
            }, 250);
          });
        }, 250);
      });
    };

    puppy.addEventListener("click", () => {
      if (!running) {
        runPuppy();
      }
    });

    puppy.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        runPuppy();
      }
    });

    // Keyboard Easter Egg: press 'b' or 'p' to woof or cycle thoughts
    window.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key.toLowerCase() === "b" || e.key.toLowerCase() === "p") {
        if (!running) {
          sfx.bark();
          quoteIndex = (quoteIndex + 1) % restingQuotes.length;
          setBubble(restingQuotes[quoteIndex]);
        }
      }
    });
  }
})();
