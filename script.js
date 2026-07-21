/* ============================================================
   ZHER-KÖMEK — JavaScript Logic
   Handles: Navigation, Animations, FAQ, Counter, Form
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ---- Scroll-based Navigation Styling ----
    const nav = document.getElementById('nav');
    const handleNavScroll = () => {
        if (window.scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // ---- Mobile Menu Toggle ----
    const burger = document.getElementById('nav-burger');
    const navLinks = document.getElementById('nav-links');

    burger.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
        document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('mobile-open');
            document.body.style.overflow = '';
        });
    });

    // ---- Scroll Reveal Animations ----
    const scrollElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the reveal based on sibling index
                const siblings = entry.target.parentElement.querySelectorAll('.animate-on-scroll');
                const siblingIndex = Array.from(siblings).indexOf(entry.target);
                const delay = siblingIndex * 100;

                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    scrollElements.forEach(el => scrollObserver.observe(el));

    // ---- Counter Animation ----
    const counters = document.querySelectorAll('.hero__stat-number');
    let countersAnimated = false;

    const animateCounters = () => {
        if (countersAnimated) return;
        countersAnimated = true;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const start = performance.now();

            const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutQuart(progress);
                
                counter.textContent = Math.round(target * easedProgress);

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };

            requestAnimationFrame(updateCounter);
        });
    };

    // Trigger counters when hero stats are visible
    const heroStats = document.querySelector('.hero__stats');
    if (heroStats) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statsObserver.observe(heroStats);
    }

    // ---- FAQ Accordion ----
    const faqItems = document.querySelectorAll('.faq__item');
    
    faqItems.forEach(item => {
        const button = item.querySelector('.faq__question');
        
        button.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
            button.setAttribute('aria-expanded', !isActive);
        });
    });

    // ---- Form Handling ----
    const form = document.getElementById('consultation-form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('form-name').value.trim();
            const phone = document.getElementById('form-phone').value.trim();
            const region = document.getElementById('form-region').value;

            if (!name || !phone) {
                return;
            }

            // Visual feedback
            const submitBtn = document.getElementById('form-submit');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Заявка отправлена ✓</span>';
            submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)';
            submitBtn.disabled = true;

            // Reset after 3 seconds
            setTimeout(() => {
                submitBtn.innerHTML = originalHTML;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                form.reset();
            }, 3000);
        });
    }

    // ---- Phone Input Mask ----
    const phoneInput = document.getElementById('form-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.startsWith('8')) {
                value = '7' + value.slice(1);
            }
            
            if (!value.startsWith('7') && value.length > 0) {
                value = '7' + value;
            }

            let formatted = '';
            if (value.length > 0) formatted = '+' + value.substring(0, 1);
            if (value.length > 1) formatted += ' (' + value.substring(1, 4);
            if (value.length > 4) formatted += ') ' + value.substring(4, 7);
            if (value.length > 7) formatted += '-' + value.substring(7, 9);
            if (value.length > 9) formatted += '-' + value.substring(9, 11);

            e.target.value = formatted;
        });
    }

    // ---- Smooth Scroll for Internal Links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const offset = 80;
                const position = targetEl.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: position, behavior: 'smooth' });
            }
        });
    });

    // ---- Parallax Effect on Hero ----
    const heroBg = document.querySelector('.hero__bg-img');
    if (heroBg && window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroBg.style.transform = `translateY(${scrolled * 0.3}px) scale(1.1)`;
            }
        }, { passive: true });
    }
});
