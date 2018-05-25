import _ from 'lodash';
import { isURL } from 'validator';
import loadFeed from './rss';
import { renderModal } from './renderers';

const isURLValid = (feeds, address) => {
  if (!isURL(address)) {
    return false;
  }
  const compareURLs = ({ link }) =>
    link.includes(address) || address.includes(link);

  return _.filter(feeds, compareURLs).length === 0;
};

export default (_state) => {
  const state = _state;
  const input = document.getElementById('feedInput');
  const addButton = document.getElementById('addRSS');
  const rootPane = document.getElementById('v-pills-tabContent');

  const handleValidateInput = ({ target }) => {
    const address = target.value;
    if (address === '') {
      state.isValidURL = false;
      target.classList.remove('is-invalid');
    } else if (isURLValid(state.feeds, address)) {
      state.isValidURL = true;
      target.classList.remove('is-invalid');
    } else {
      state.isValidURL = false;
      target.classList.add('is-invalid');
    }
  };

  const handleAddRSS = (event) => {
    event.preventDefault();
    if (state.isValidURL) {
      const feedURL = input.value;
      addButton.setAttribute('disabled', 'disabled');
      loadFeed(state.feeds, feedURL);
      input.value = '';
      input.focus();
      state.isValidURL = false;
    }
  };

  const handleShowModal = ({ target }) => {
    if (target.tagName !== 'A') {
      return;
    }
    const feedGuid = document.querySelector('.nav-link.active').id.replace('-tab', '');
    const itemGuid = target.dataset.item;
    const feed = _.find(state.feeds, { guid: parseInt(feedGuid, 10) });
    const item = _.find(feed.items, { guid: parseInt(itemGuid, 10) });
    renderModal(feedGuid, item);
  };

  input.addEventListener('input', handleValidateInput);
  addButton.addEventListener('click', handleAddRSS);
  rootPane.addEventListener('click', handleShowModal);
};
