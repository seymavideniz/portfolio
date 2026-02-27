// ===============================
// NAVBAR (SAFE) + MOBILE MENU
// ===============================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');

    const expanded = hamburger.classList.contains('active');
    hamburger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });

  // Close menu when clicking on a link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// Cinematic smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1500; // 1.5 saniye - daha yavaş ve sinematik
      let start = null;

      function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      }

      // Easing fonksiyonu - daha smooth geçiş
      function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
      }

      requestAnimationFrame(animation);
    }
  });
});

// Smooth scroll momentum - ağır çekim efekti
let isScrolling = false;
let scrollTimeout;

window.addEventListener('wheel', (e) => {
  e.preventDefault();
  
  if (!isScrolling) {
    isScrolling = true;
  }
  
  clearTimeout(scrollTimeout);
  
  // Scroll hızını yavaşlatıyoruz (0.65 faktörü ile - biraz daha hızlı)
  const delta = e.deltaY * 0.65;
  
  window.scrollBy({
    top: delta,
    behavior: 'auto'
  });
  
  scrollTimeout = setTimeout(() => {
    isScrolling = false;
  }, 100);
}, { passive: false });

// Navbar background on scroll (glass effect)
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(0, 0, 0, 0.45)';
  } else {
    navbar.style.background = 'rgba(0, 0, 0, 0.22)';
  }
});

// ===============================
// ANIMATIONS (STATS + SKILLS)
// ===============================
const animateCounter = (element, target, duration = 2000) => {
  let start = 0;
  const increment = target / (duration / 16);

  const updateCounter = () => {
    start += increment;
    if (start < target) {
      element.textContent = Math.floor(start);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  };

  updateCounter();
};

const observerOptions = {
  threshold: 0.3,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';

      // Animate stat numbers
      if (entry.target.classList.contains('stat-number')) {
        const target = parseInt(entry.target.getAttribute('data-target') || '0', 10);
        animateCounter(entry.target, target);
      }

      // Animate skill bars
      if (entry.target.classList.contains('skill-progress')) {
        const progress = entry.target.getAttribute('data-progress') || '0';
        entry.target.style.width = progress + '%';
      }

      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll(
    '.stat-item, .skill-card, .project-card, .contact-item'
  );

  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  document.querySelectorAll('.stat-number').forEach(stat => observer.observe(stat));
  document.querySelectorAll('.skill-progress').forEach(progress => observer.observe(progress));
});

// ===============================
// TOAST NOTIFICATION
// ===============================
function showToast(title, message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  const icon = type === 'success' ? '✓' : '✕';
  const iconClass = type === 'success' ? '' : 'error';
  
  toast.innerHTML = `
    <div class="toast-icon ${iconClass}">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <p class="toast-message">${message}</p>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ===============================
// FORM SUBMISSION
// ===============================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const endpoint = contactForm.getAttribute('action');
    if (!endpoint) return;

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const prevBtnText = submitBtn?.textContent || '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    const data = new FormData(contactForm);

    fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    })
      .then(async (res) => {
        if (res.ok) {
          showToast(
            'Message Sent!',
            'Your message has been sent successfully. I\'ll get back to you soon!',
            'success'
          );
          contactForm.reset();
          return;
        }

        let message = 'Failed to send message. Please try again.';
        try {
          const json = await res.json();
          if (json?.errors?.length) {
            message = json.errors.map((x) => x.message).join(', ');
          }
        } catch {
          // ignore json parse errors
        }
        showToast('Error', message, 'error');
      })
      .catch(() => {
        showToast(
          'Error',
          'Failed to send message. Please check your internet connection.',
          'error'
        );
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = prevBtnText;
        }
      });
  });
}

// ===============================
// PARALLAX (HERO)
// ===============================
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
  }
});

// ===============================
// ACTIVE NAV LINK (ON SCROLL)
// ===============================
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (window.pageYOffset >= sectionTop - 200) {
      current = section.getAttribute('id') || '';
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#') && href.slice(1) === current) {
      link.classList.add('active');
    }
  });
});

// ===============================
// CURSOR TRAIL (OPTIONAL)
// ===============================
document.addEventListener('mousemove', (e) => {
  const trail = document.createElement('div');
  trail.className = 'cursor-trail';
  trail.style.left = e.pageX + 'px';
  trail.style.top = e.pageY + 'px';

  document.body.appendChild(trail);

  setTimeout(() => {
    trail.remove();
  }, 500);
});

// Add CSS for cursor trail + active nav underline
const style = document.createElement('style');
style.textContent = `
  .cursor-trail {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
    pointer-events: none;
    opacity: 0.6;
    animation: fadeOut 0.5s ease-out forwards;
    z-index: 9999;
  }

  @keyframes fadeOut {
    to {
      opacity: 0;
      transform: scale(0);
    }
  }
`;
document.head.appendChild(style);