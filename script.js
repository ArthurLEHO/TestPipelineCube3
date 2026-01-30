// Affichage des informations de build
document.addEventListener('DOMContentLoaded', () => {
    const buildInfo = document.getElementById('build-info');
    
    // Simulation d'informations de build (en production, ces infos viendraient du pipeline)
    const info = {
        version: '1.0.0',
        buildTime: new Date().toLocaleString('fr-FR'),
        environment: window.location.hostname.includes('staging') ? 'Staging' : 'Production',
        commit: 'abc1234'
    };

    buildInfo.innerHTML = `
        <strong>Build Info:</strong><br>
        Version: ${info.version}<br>
        Build Time: ${info.buildTime}<br>
        Environment: ${info.environment}<br>
        Commit: ${info.commit}
    `;

    // Animation au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Smooth scroll pour les liens de navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Fonction de validation simple (sera utilisée dans les tests)
function validateForm(data) {
    if (!data.name || data.name.length < 2) {
        return { valid: false, error: 'Name too short' };
    }
    if (!data.email || !data.email.includes('@')) {
        return { valid: false, error: 'Invalid email' };
    }
    return { valid: true };
}

// Export pour les tests (si module)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateForm };
}
