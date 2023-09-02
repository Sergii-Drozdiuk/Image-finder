import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from "../src/js/fetch"

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.photo-card a');

form.addEventListener('submit', handleSubmit);
loadMoreBtn.addEventListener('click', loadMoreImages);

let page = 1;
let searchQuery = '';

function handleSubmit(evt) {
  evt.preventDefault();
  searchQuery = evt.target.elements.searchQuery.value;
  page = 1;
  clearGallery();
  fetchImages(searchQuery, page).then(checkNumberOfPages).catch(errorMessage);
}

function loadMoreImages() {
  page += 1;
  fetchImages(searchQuery, page).then(checkNumberOfPages).catch(errorMessage);
  scrollPage();
}

function checkNumberOfPages(resp) {
  const {totalHits, hits} = resp
  if (totalHits === 0) {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    return form.reset();
  }
  renderImages(hits);
  if (page === 1) {
    Notify.success(`Hooray! We found ${totalHits} images.`);
  }
  if (page >= (totalHits/hits.length)) {
    loadMoreBtn.classList.add('is-hidden');
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
}

function renderImages(hits) {
  const imageMarkup = hits
    .map( 
      hit => {
        const { largeImageURL, webformatURL, tags, likes, views, comments, downloads } = hit;
        return `<div class="photo-card">
        <a href="${largeImageURL}" class="photo-card-a">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${likes}</p>
          <p class="info-item"><b>Views:</b> ${views}</p>
          <p class="info-item"><b>Comments:</b> ${comments}</p>
          <p class="info-item"><b>Downloads:</b> ${downloads}</p>
        </div>
      </div>`
      })
    .join('');

  gallery.insertAdjacentHTML('beforeend', imageMarkup);
  loadMoreBtn.classList.remove('is-hidden');
  lightbox.refresh();
}

function clearGallery() {
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('is-hidden');
}

function scrollPage() {
  const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight,
    behavior: 'smooth',
  });
}

const errorMessage = () => Notify.failure('Sorry, something went wrong. Please try again.');

const checkbox = document.getElementById('pagination-checkbox');
checkbox.addEventListener('change', togglePagination);

function togglePagination() {
  if (checkbox.checked) {
    loadMoreBtn.classList.add('is-hidden');
    window.addEventListener('scroll', checkScrollPosition);
  } else if(searchQuery !== '') {
    loadMoreBtn.classList.remove('is-hidden');
    window.removeEventListener('scroll', checkScrollPosition);
  }
}

function checkScrollPosition() {
  const documentHeight = document.documentElement.scrollHeight;
  if (checkbox.checked && window.scrollY + window.innerHeight >= documentHeight - 100) {
    loadMoreImages();
  }
}

