// Eenvoudige zoekfunctie op producten.html
const searchInput = document.getElementById('product-search');
const productCards = document.querySelectorAll('.product-card');

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();

    productCards.forEach(card => {
      const merk = card.dataset.merk || '';
      const naam = card.dataset.naam || '';
      const tags = card.dataset.tags || '';
      const haystack = (merk + ' ' + naam + ' ' + tags).toLowerCase();

      if (haystack.includes(q)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
}
