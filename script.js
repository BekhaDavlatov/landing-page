'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initStickyHeader();
    initPrimaryButtons();
    initStatsCounters();
});
function initStickyHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    const SCROLL_THRESHOLD = 24;
    let ticking = false;

    const updateHeaderState = () => {
        header.classList.toggle('header--scrolled', window.scrollY > SCROLL_THRESHOLD);
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeaderState);
            ticking = true;
        }
    }, { passive: true });

    updateHeaderState();
}

function initPrimaryButtons() {
    const target = document.querySelector('cta');
    if (!target) return;

    document.querySelectorAll('.button--primary').forEach((button) => {
        button.addEventListener('click', () => {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
}


function initStatsCounters() {
    const values = document.querySelectorAll('.stats__value--counter');
    if (!values.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const DURATION_MS = 1200;

    const parseValue = (text) => {
        const match = text.trim().match(/^(-?\d+(?:\.\d+)?)(.*)$/);
        if (!match) return null;
        const [, numberPart, suffix] = match;
        const decimals = numberPart.includes('.') ? numberPart.split('.')[1].length : 0;
        return { target: parseFloat(numberPart), decimals, suffix };
    };

    const animateValue = (el, { target, decimals, suffix }) => {
        const start = performance.now();

        const step = (now) => {
            const progress = Math.min((now - start) / DURATION_MS, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out
            const current = (target * eased).toFixed(decimals);
            el.textContent = `${current}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = `${target.toFixed(decimals)}${suffix}`;
            }
        };

        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            const parsed = parseValue(el.dataset.originalValue);
            if (parsed) animateValue(el, parsed);

            obs.unobserve(el);
        });
    }, { threshold: 0.6 });

    values.forEach((el) => {
        el.dataset.originalValue = el.textContent;
        observer.observe(el);
    });
}