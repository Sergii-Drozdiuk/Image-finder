import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.photo-card a');

let page = 1;
let searchQuery = '';

form.addEventListener('submit', handleSubmit);
loadMoreBtn.addEventListener('click', loadMoreImages);

function handleSubmit(evt) {
  evt.preventDefault();
  searchQuery = evt.target.elements.searchQuery.value.trim();
  page = 12;
  clearGallery();
  fetchImages().then(checkNumberOfPages).catch((err) => {
  Notify.failure('Sorry, something went wrong. Please try again.');
  console.log(err);
});
}

function loadMoreImages() {
  page += 1;
  fetchImages().then(checkNumberOfPages).catch((err) => {
  Notify.failure('Sorry, something went wrong. Please try again.');
  console.log(err);
});
  scrollPage();
}

async function fetchImages() {
  try {
    const resp = await axios.get(`https://pixabay.com/api/`, {
      params: {
        key: '39181304-34c4662094c53de77895ac9be',
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page: 40,
      },
    });
    return resp;
  } catch (err) {
    Notify.failure('Sorry, something went wrong. Please try again.');
    console.log(err);
  }
}

function checkNumberOfPages(arr){
  const images = arr.data.hits;
  const totalHits = arr.data.totalHits;
  if (totalHits === 0) {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    form.reset();
    return;
  }
  renderImages(images);
  lightbox.refresh();
  if (page === 1) {
    Notify.success(`Hooray! We found ${totalHits} images.`);
  }
  if (page >= (totalHits/images.length)) {
    loadMoreBtn.classList.add('is-hidden');
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
}

function renderImages(images) {
  const imageMarkup = images
    .map(
      image => `
      <div class="photo-card">
        <a href="${image.largeImageURL}" class="photo-card-a">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${image.likes}</p>
          <p class="info-item"><b>Views:</b> ${image.views}</p>
          <p class="info-item"><b>Comments:</b> ${image.comments}</p>
          <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
        </div>
      </div>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', imageMarkup);
  loadMoreBtn.classList.remove('is-hidden');
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

