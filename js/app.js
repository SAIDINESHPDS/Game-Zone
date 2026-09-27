/* =========================================================================
   GAME ZONE HUB - Portal Engine (js/app.js)
   Handles Category Filters, Link Fallbacks & Hub State
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Category Filtering Logic
  const filterButtons = document.querySelectorAll('.cat-btn');
  const gameCards = document.querySelectorAll('.game-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Toggle Active Tab
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const selectedCategory = button.getAttribute('data-category');

      gameCards.forEach(card => {
        const cardTags = card.getAttribute('data-tags') || '';
        if (selectedCategory === 'all' || cardTags.includes(selectedCategory)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.25s ease';
            card.style.opacity = '1';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});

// Fallback validator if secondary game file is not yet created
window.checkGameLink = function(event, gameName) {
  // If Snakes & Ladders file doesn't exist yet, show friendly notification
  fetch('games/SnakesAndLadders/index.html', { method: 'HEAD' })
    .then(response => {
      if (!response.ok) {
        event.preventDefault();
        alert('Snakes & Ladders is currently being upgraded! You can enjoy the full Ludo Master game right now.');
      }
    })
    .catch(() => {
      // If running on local protocol without server HEAD support, proceed normally
    });
};