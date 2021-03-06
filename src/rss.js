import axios from 'axios';
import _ from 'lodash';
import normalize from 'normalize-url';
import { renderFeed, renderItems, renderError, renderLoading, isModalActive } from './view';
import parseRSS from './parsers';
import init from './app';

const state = {
  feeds: [],
  isValidURL: false,
  isLoading: false,
};

const addItems = (_feed, newItems) => {
  const feed = _feed;
  const addingItems = _.filter(newItems, ({ guid }) => !_.find(feed.items, { guid }));
  feed.items = [...feed.items, ...addingItems];
  if (!_.isEmpty(addingItems) && !isModalActive(feed)) {
    renderItems(feed);
  }
};

const addFeed = (feeds, newFeed) => {
  feeds.push(newFeed);
  renderFeed(newFeed);
};

export const setValidState = (isValidURL) => {
  state.isValidURL = isValidURL;
};

export const toggleLoadingState = () => {
  state.isLoading = !state.isLoading;
  renderLoading(state.isLoading);
};

const handleLoadingError = (err) => {
  toggleLoadingState();
  renderError(err);
};

const corsURL = 'https://cors-anywhere.herokuapp.com/';

const fetchFeed = (feedURL) => {
  const requestURL = `${corsURL}${normalize(feedURL)}`;
  return axios.get(requestURL)
    .then(response => response.data);
};

const updateFeed = (feedUrl) => {
  fetchFeed(feedUrl)
    .then((xml) => {
      const { guid, items } = parseRSS(xml, feedUrl);
      const feed = _.find(state.feeds, { guid });
      addItems(feed, items);
      window.setTimeout(() => updateFeed(feedUrl), 15000);
    })
    .catch((err) => {
      handleLoadingError(err);
    });
};

export const loadFeed = (feedUrl) => {
  fetchFeed(feedUrl)
    .then((xml) => {
      const newFeed = parseRSS(xml, feedUrl);
      const { feeds } = state;
      addFeed(feeds, newFeed);
      toggleLoadingState();
      window.setTimeout(() => updateFeed(feedUrl), 15000);
    })
    .catch((err) => {
      handleLoadingError(err);
    });
};

export default () => init(state);
