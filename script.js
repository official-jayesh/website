const year = document.getElementById("year");
year.textContent = new Date().getFullYear();

const background = document.querySelector(".background");
const cursorGlow = document.querySelector(".cursor-glow");

window.addEventListener("pointermove", (event) => {
  const x = (event.clientX / window.innerWidth - 0.5) * 2;
  const y = (event.clientY / window.innerHeight - 0.5) * 2;

  background.style.transform = `translate3d(${x * 3}px, ${y * 3}px, 0)`;
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
  cursorGlow.style.opacity = "1";
}, { passive: true });

window.addEventListener("pointerleave", () => {
  cursorGlow.style.opacity = "0";
});


/* ---------------------------------------------------------
   Puppy Easter egg
   Play: original position -> far left -> far right -> home.
--------------------------------------------------------- */

(() => {
  const puppy = document.getElementById("puppy");
  const bubble = document.getElementById("puppyBubble");

  if (!puppy) return;

  let running = false;

  const setBubble = text => {
    if (bubble) bubble.textContent = text;
  };

  const easeInOut = t =>
    t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function face(direction) {
    puppy.classList.remove("run-facing-left", "run-facing-right");
    puppy.classList.add(
      direction === "left" ? "run-facing-left" : "run-facing-right"
    );
  }

  function animateRun(fromX, toX, duration, direction, done) {
    const start = performance.now();
    face(direction);

    function frame(now) {
      const raw = Math.min((now - start) / duration, 1);
      const progress = easeInOut(raw);
      const x = fromX + (toX - fromX) * progress;

      // Translation only. Direction is handled by the CSS class so it
      // cannot be overridden by the body's running animation.
      puppy.style.transform = `translate3d(${x}px, 0, 0)`;

      if (raw < 1) {
        requestAnimationFrame(frame);
      } else {
        done();
      }
    }

    requestAnimationFrame(frame);
  }

  function runPuppy() {
    if (running) return;
    running = true;

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
    const duration = window.innerWidth > 720 ? 6200 : 4400;

    // Original -> left: face left.
    animateRun(0, farLeft, duration, "left", () => {
      setBubble("Catch me! 🐾");

      setTimeout(() => {
        // Left -> right: FLIP and face right before moving.
        animateRun(farLeft, farRight, duration, "right", () => {
          setBubble("Catch me! 🐾");

          setTimeout(() => {
            // Right -> original: FLIP again and face left.
            animateRun(farRight, 0, duration, "left", () => {
              puppy.style.transform = "";
              puppy.classList.remove(
                "is-running",
                "run-facing-left",
                "run-facing-right"
              );
              puppy.style.removeProperty("--puppy-start-left");
              puppy.style.removeProperty("--puppy-start-top");

              setBubble("I won! 😄");
              running = false;

              setTimeout(() => {
                setBubble("Will you play with me?");
              }, 1600);
            });
          }, 250);
        });
      }, 250);
    });
  }

  puppy.addEventListener("click", runPuppy);

  puppy.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      runPuppy();
    }
  });
})();
