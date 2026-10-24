/**
 * EXPRESS PLUS - REFERRAL PROGRAM INTERACTIVE SCRIPT
 */

document.addEventListener('DOMContentLoaded', function() {
    initMobileNavigation();
    initFaqAccordion();
    initPhoneMask();
    initTelegramFormatter();
    initFormHandler();
    initScrollTop();
});

/* ==========================================================================
   1. MOBILE NAVIGATION & BURGER MENU
   ========================================================================== */
function initMobileNavigation() {
    const burgerBtn = document.getElementById('burgerBtn');
    const mainNav = document.getElementById('mainNav');
    const navBackdrop = document.getElementById('navBackdrop');
    const navLinks = document.querySelectorAll('.nav-link, .nav-mobile-cta');

    if (!burgerBtn || !mainNav) return;

    function toggleMenu(isOpen) {
        const state = typeof isOpen === 'boolean' ? isOpen : !mainNav.classList.contains('open');
        burgerBtn.classList.toggle('active', state);
        burgerBtn.setAttribute('aria-expanded', state);
        mainNav.classList.toggle('open', state);
        if (navBackdrop) {
            navBackdrop.classList.toggle('active', state);
        }
        document.body.style.overflow = state ? 'hidden' : '';
    }

    burgerBtn.addEventListener('click', function() {
        toggleMenu();
    });

    if (navBackdrop) {
        navBackdrop.addEventListener('click', function() {
            toggleMenu(false);
        });
    }

    // Close menu when clicking any nav link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            toggleMenu(false);
        });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mainNav.classList.contains('open')) {
            toggleMenu(false);
        }
    });
}

/* ==========================================================================
   2. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (!questionBtn) return;

        questionBtn.addEventListener('click', function() {
            const isActive = item.classList.contains('active');

            // Optional: close other open items for cleaner UI
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const otherBtn = otherItem.querySelector('.faq-question');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current
            item.classList.toggle('active', !isActive);
            questionBtn.setAttribute('aria-expanded', !isActive);
        });
    });
}

/* ==========================================================================
   3. QUICK SELECT VACANCY HELPER (HERO 2 CTA)
   ========================================================================== */
window.selectPickerVacancy = function() {
    const pickerRadio = document.querySelector('input[name="courier-type"][value="picker"]');
    if (pickerRadio) {
        pickerRadio.checked = true;
        pickerRadio.dispatchEvent(new Event('change', { bubbles: true }));
    }
};

/* ==========================================================================
   4. PHONE INPUT MASK (+7 (XXX) XXX-XX-XX)
   ========================================================================== */
function initPhoneMask() {
    const phoneInput = document.getElementById('friend-phone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', function(e) {
        let input = e.target;
        let value = input.value.replace(/\D/g, '');
        let formattedValue = '';

        if (!value) {
            input.value = '';
            return;
        }

        // Handle 7 or 8 as first digit
        if (['7', '8', '9'].indexOf(value[0]) > -1) {
            if (value[0] === '9') value = '7' + value;
            const firstDigit = '+7';
            formattedValue = firstDigit + ' ';

            if (value.length > 1) {
                formattedValue += '(' + value.substring(1, 4);
            }
            if (value.length >= 5) {
                formattedValue += ') ' + value.substring(4, 7);
            }
            if (value.length >= 8) {
                formattedValue += '-' + value.substring(7, 9);
            }
            if (value.length >= 10) {
                formattedValue += '-' + value.substring(9, 11);
            }
        } else {
            // Default for international or standard
            formattedValue = '+' + value.substring(0, 16);
        }

        input.value = formattedValue;
    });

    phoneInput.addEventListener('keydown', function(e) {
        // Backspace handling
        if (e.key === 'Backspace' && e.target.value.length <= 4) {
            e.target.value = '';
        }
    });
}

/* ==========================================================================
   5. TELEGRAM INPUT FORMATTER
   ========================================================================== */
function initTelegramFormatter() {
    const tgInput = document.getElementById('friend-tg');
    if (!tgInput) return;

    tgInput.addEventListener('input', function(e) {
        let value = e.target.value.trim();
        if (value && value !== '@' && !value.startsWith('@')) {
            e.target.value = '@' + value.replace(/@/g, '');
        }
    });

    tgInput.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && e.target.value === '@') {
            e.target.value = '';
        }
    });
}

/* ==========================================================================
   6. FORM VALIDATION & AJAX SUBMISSION (FORMSPREE)
   ========================================================================== */
function initFormHandler() {
    const form = document.getElementById('referralForm');
    const submitBtn = document.getElementById('submitBtn');

    if (!form || !submitBtn) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const rawTg = document.getElementById('friend-tg').value.trim();
        const formData = {
            referrerName: document.getElementById('referrer-name').value.trim(),
            friendName: document.getElementById('friend-name').value.trim(),
            friendTg: rawTg === '@' ? '' : rawTg,
            friendPhone: document.getElementById('friend-phone').value.trim(),
            courierType: document.querySelector('input[name="courier-type"]:checked')?.value || '',
            submissionTime: new Date().toISOString()
        };

        if (validateFormData(formData)) {
            sendFormData(formData);
        }
    });

    function validateFormData(data) {
        if (!data.referrerName || data.referrerName.length < 3) {
            showFormMessage('Пожалуйста, введите ваше полное ФИО', 'error');
            focusField('referrer-name');
            return false;
        }

        const digitsOnly = data.friendPhone.replace(/\D/g, '');
        if (!data.friendPhone || digitsOnly.length < 11) {
            showFormMessage('Пожалуйста, введите полный номер телефона для связи', 'error');
            focusField('friend-phone');
            return false;
        }

        if (data.friendTg) {
            if (!data.friendTg.startsWith('@')) {
                showFormMessage('Ник Telegram должен начинаться с символа @', 'error');
                focusField('friend-tg');
                return false;
            }
            if (data.friendTg.length < 2) {
                showFormMessage('Пожалуйста, укажите корректный ник Telegram', 'error');
                focusField('friend-tg');
                return false;
            }
        }

        if (!data.courierType) {
            showFormMessage('Пожалуйста, выберите интересующую программу (аренда, выкуп или U2 PRO)', 'error');
            return false;
        }

        return true;
    }

    function sendFormData(data) {
        const originalContent = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <svg class="spin-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
            <span>Отправка заявки...</span>
        `;
        submitBtn.disabled = true;

        let programName = 'Аренда по часам (0 ₽ при 72+ ч)';
        if (data.courierType === 'buyout') programName = 'Выкуп за 3 месяца в собственность';
        if (data.courierType === 'u2-pro') programName = 'Спецпредложение U2 PRO (LiFePO4)';

        fetch('https://formspree.io/f/mnnrypbl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: "Новая заявка на электробайк: " + programName,
                fullName: data.referrerName,
                location: data.friendName || 'Не указано',
                telegram: data.friendTg,
                phone: data.friendPhone,
                program: programName,
                submissionTime: data.submissionTime
            })
        })
        .then(response => {
            if (response.ok) {
                showFormMessage('🎉 Заявка успешно принята! Координатор свяжется с вами в течение 15 минут для подтверждения бронирования и адреса филиала.', 'success');
                form.reset();
            } else {
                throw new Error('Ошибка сервера');
            }
        })
        .catch(error => {
            showFormMessage('Произошла ошибка при отправке заявки. Пожалуйста, проверьте интернет-соединение или напишите нам напрямую в Telegram.', 'error');
        })
        .finally(() => {
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
        });
    }

    function focusField(id) {
        const el = document.getElementById(id);
        if (el) {
            el.focus();
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function showFormMessage(message, type) {
        removeFormMessages();

        const alertBox = document.createElement('div');
        alertBox.className = `form-alert form-alert-${type}`;
        alertBox.textContent = message;

        form.insertBefore(alertBox, form.firstChild);

        alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        if (type === 'error') {
            setTimeout(() => {
                if (alertBox.parentNode) alertBox.parentNode.removeChild(alertBox);
            }, 6000);
        }
    }

    function removeFormMessages() {
        const oldAlerts = form.querySelectorAll('.form-alert');
        oldAlerts.forEach(el => el.remove());
    }
}

/* ==========================================================================
   7. SCROLL TO TOP BUTTON
   ========================================================================== */
function initScrollTop() {
    const scrollBtn = document.getElementById('scrollTopBtn');
    if (!scrollBtn) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 350) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }, { passive: true });

    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
