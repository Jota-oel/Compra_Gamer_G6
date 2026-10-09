import { login, is_authenticated } from '../utils/auth.js';

/** pages/login.html: valid user -> catalog.html, otherwise an error message in the form. */
const $ = (selector) => document.querySelector(selector);

const CATALOG_URL = 'catalog.html'; // relative to pages/login.html

if (is_authenticated()) location.replace(CATALOG_URL); // already logged in

function show_error(message) {
  const error = $('#login-error');
  error.textContent = message;
  error.hidden = false;
}

// delegated on document, same convention as the other pages
document.addEventListener('submit', (event) => {
  if (!event.target.matches('#login-form')) return;
  event.preventDefault();

  const form_data = new FormData(event.target);
  if (login(form_data.get('email'), form_data.get('password'))) {
    location.replace(CATALOG_URL);
    return;
  }
  show_error('Usuario no encontrado');
  $('#password').value = '';
  $('#email').focus();
});

// the message disappears as soon as the person edits a field
document.addEventListener('input', (event) => {
  if (event.target.closest('#login-form')) $('#login-error').hidden = true;
});
