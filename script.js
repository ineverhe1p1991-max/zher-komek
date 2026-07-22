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

    // ---- Telegram Integration ----
    const TELEGRAM_TOKEN = '834358405:AAEVru6ve_UKvdP2YoyXizZH1vVRoAmq9o4';
    const TELEGRAM_CHAT_ID = '6354119702';

    const sendToTelegram = async (message) => {
        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        try {
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            return true;
        } catch (error) {
            console.error('Error sending message to Telegram:', error);
            return false;
        }
    };

    // ---- Form Handling ----
    const form = document.getElementById('consultation-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('form-name').value.trim();
            const phone = document.getElementById('form-phone').value.trim();
            const region = document.getElementById('form-region').value;

            if (!name || !phone) {
                return;
            }

            const submitBtn = document.getElementById('form-submit');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Отправка...</span>';
            submitBtn.disabled = true;

            const text = `🔥 <b>Новая заявка (Подвал)</b>\n\n👤 <b>Имя:</b> ${name}\n📞 <b>Телефон:</b> ${phone}\n📍 <b>Регион:</b> ${region}`;
            
            const success = await sendToTelegram(text);

            if (success) {
                submitBtn.innerHTML = '<span>Заявка отправлена ✓</span>';
                submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)';
                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                    form.reset();
                }, 3000);
            } else {
                submitBtn.innerHTML = '<span>Ошибка отправки</span>';
                submitBtn.style.background = '#f44336';
                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }

    // Hero contact form handler
    const heroForm = document.getElementById('hero-lead-form');
    if (heroForm) {
        heroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const contactInfo = document.getElementById('hero-contact-input').value.trim();
            if (!contactInfo) return;
            
            const submitBtn = heroForm.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Отправка...</span>';
            submitBtn.disabled = true;

            const text = `🚀 <b>Новая заявка (Главный экран)</b>\n\n📞 <b>Контакт:</b> ${contactInfo}`;
            
            const success = await sendToTelegram(text);

            if (success) {
                submitBtn.innerHTML = '<span>Отправлено ✓</span>';
                submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)';
                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                    heroForm.reset();
                }, 3000);
            } else {
                submitBtn.innerHTML = '<span>Ошибка</span>';
                submitBtn.style.background = '#f44336';
                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            }
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
    
    // ---- Lightbox (Image Gallery) ----
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const casesImages = document.querySelectorAll('.cases-card img');

    if (lightbox && lightboxImg && casesImages.length > 0) {
        // Open lightbox
        casesImages.forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            });
        });

        // Close functions
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                lightboxImg.src = '';
            }, 300); // Wait for transition
        };

        if(lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
});
