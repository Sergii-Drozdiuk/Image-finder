import axios from 'axios';

let imgPerPage = 0;

async function fetchImages(searchQuery, page) {
  const resp = await axios(`https://pixabay.com/api/`, {
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
  imgPerPage = resp.config.params.per_page;
  return resp.data;
}

export {fetchImages, imgPerPage}