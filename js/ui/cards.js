/**
 * Single computer card, reused by the carousel and by the index grid.
 * No listeners: the button carries data-action / data-id for delegation later.
 */
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const CATEGORY = { gaming: 'Gaming PC', office: 'Office PC' };

function el(tag, class_name, text) {
  const node = document.createElement(tag);
  if (class_name) node.className = class_name;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function create_computer_card(pc) {
  const card = el('article', 'pc-card');
  card.dataset.id = pc.id;
  card.dataset.type = pc.type;
  if (pc.stock === 0) card.classList.add('is-out-of-stock');

  const image = el('div', 'pc-card__image');
  if (pc.url) {
    const img = el('img');
    img.src = pc.url;
    img.alt = pc.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    image.append(img);
  }

  const body = el('div', 'pc-card__body');
  body.append(
    el('span', 'pc-card__category', CATEGORY[pc.type] ?? pc.type),
    el('h3', 'pc-card__name', pc.name),
    el('p', 'pc-card__specs', pc.description),
  );

  const footer = el('div', 'pc-card__footer');
  const button = el('button', 'pc-card__button', pc.stock > 0 ? 'buy' : 'Out of stock');
  button.type = 'button';
  button.dataset.action = 'buy';
  button.dataset.id = pc.id;
  button.disabled = pc.stock === 0;
  footer.append(el('span', 'pc-card__price', usd.format(pc.price)), button);

  body.append(footer);
  card.append(image, body);
  return card;
}

/** Grid of cards (index.html). collection: ComputerCollection (or a filtered one). */
export function render_computer_cards(container, collection) {
  const items = collection.items;
  container.classList.add('pc-cards');
  if (items.length === 0) {
    container.replaceChildren(el('p', 'pc-cards__empty', 'No computers available.'));
    return;
  }
  container.replaceChildren(...items.map(create_computer_card));
}