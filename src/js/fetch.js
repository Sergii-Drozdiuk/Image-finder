import axios from 'axios';

export async function fetchImages(searchQuery, page) {
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
  return resp.data;
}