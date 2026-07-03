/**
 * Modern Micro-Interaction Interface Presentation Module
 */
class UIController {
    constructor() {
        this.menuOverlay = $('#screen-overlay');
        this.mainMenu = $('#menu-main');
        this.pauseMenu = $('#menu-pause');
        this.gameOverMenu = $('#menu-gameover');
    }

    showScreen(activePanel) {
        this.menuOverlay.removeClass('opacity-0 pointer-events-none');
        this.mainMenu.addClass('hidden');
        this.pauseMenu.addClass('hidden');
        this.gameOverMenu.addClass('hidden');

        activePanel.removeClass('hidden');
        gsap.killTweensOf(activePanel);
        gsap.to(activePanel, {
            display: 'flex',
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: 'back.out(1.4)',
            clearProps: 'transform'
        });
    }

    hideAllScreens() {
        this.menuOverlay.addClass('opacity-0 pointer-events-none');
        gsap.to([this.mainMenu, this.pauseMenu, this.gameOverMenu], {
            opacity: 0,
            scale: 0.92,
            duration: 0.25,
            ease: 'power3.in'
        });
    }

    updateScore(val, combo) {
        let padScore = String(val).padStart(4, '0');
        $('#score-val').text(padScore);
        $('#combo-val').text(`x${combo.toFixed(1)}`);
        
        // Micro-interaction score bounce effect
        gsap.fromTo('#score-val', { scale: 1.2, color: '#00f3ff' }, { scale: 1, color: '#ffffff', duration: 0.3 });
    }
}