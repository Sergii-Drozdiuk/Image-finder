import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages, imgPerPage } from "../src/js/fetch"

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
    });

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

const errorMessage = () => Notify.failure('Sorry, something went wrong. Please try again.');

function checkNumberOfPages(resp) {
  const { totalHits, hits } = resp
  let numberOfPages = Math.ceil(totalHits / imgPerPage);
  
  if (totalHits === 0) {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    return form.reset();
  }
  
  if (page === 1) {
    Notify.success(`Hooray! We found ${totalHits} images.`);
  }
  
  if (page === numberOfPages) {
    hideBtn();
    Notify.info("We're sorry, but you've reached the end of search results.");
  } else { showBtn() };

  renderImages(hits);
}

function renderImages(hits) {
  const imageMarkup = hits
    .map( 
      hit => {
        const { largeImageURL, webformatURL, tags, likes, views, comments, downloads } = hit;
        return `
        <a href="${largeImageURL}" class="photo-card-a">
          <div class="photo-card">
          <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${likes}</p>
          <p class="info-item"><b>Views:</b> ${views}</p>
          <p class="info-item"><b>Comments:</b> ${comments}</p>
          <p class="info-item"><b>Downloads:</b> ${downloads}</p>
        </div>
        </div>
        </a>`
      })
    .join('');
  gallery.insertAdjacentHTML('beforeend', imageMarkup);
  lightbox.refresh();
}

function clearGallery() {
  gallery.innerHTML = '';
  hideBtn();
}

function scrollPage() {
  const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight,
    behavior: 'smooth',
  });
}

function hideBtn() {
  loadMoreBtn.classList.remove('is-visible');
  loadMoreBtn.classList.add('is-hidden');
}

function showBtn() {
  loadMoreBtn.classList.remove('is-hidden');
  loadMoreBtn.classList.add('is-visible');
}
