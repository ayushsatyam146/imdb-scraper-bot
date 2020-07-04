const fetch = require('node-fetch');
const cheerio = require('cheerio');

const searchUrl = 'https://www.imdb.com/find?s=tt&ttype=ft&ref_=fn_ft&q=';
const movieUrl = 'https://www.imdb.com/title/';

const movieCache = {};

async function searchMovies(searchTerm) {
  return fetch(`${searchUrl}${searchTerm}`)
    .then(response => response.text())
    .then(body => {
      const movies = [];
      const $ = cheerio.load(body);
      $('.findResult').each(function (i, element) {
         const $element = $(element);
         const $title = $element.find("td.result_text a");
         const imdbID = $title.attr("href").match(/title\/(.*)\//)[1];
        const movie = {
          title: $title.text(),
          imdbID,
        };
        movies.push(movie);
      });
      return movies[0].imdbID;
    });
}

async function getMovie(name) {
  var imdbID = await searchMovies(name);
  if(movieCache[imdbID]) {
    console.log('Serving from cache:', imdbID);
    return Promise.resolve(movieCache[imdbID]);
  }
  return fetch(`${movieUrl}${imdbID}`)
    .then(response => response.text())
    .then(body => {
      const $ = cheerio.load(body);
      const $title = $('.title_wrapper h1');
      const title = $title.first().contents().filter(function() {
        return this.type === 'text';
      }).text().trim();
      const rating = $('meta[itemProp="contentRating"]').attr('content');
      const runTime = $('time[itemProp="duration"]').first().contents().filter(function() {
        return this.type === 'text';
      }).text().trim();
      const imdbRating = $('span[itemProp="ratingValue"]').text();
      const summary = $('div.summary_text').text().trim();
      function getItems(itemArray) {
        return function(i, element) {
          const item = $(element).text().trim();
          itemArray.push(item);
        };
      }
      const trailer = $('a[itemProp="trailer"]').attr('href');
      const movie = {
        imdbID,
        title,
        imdbRating,
        summary,
        trailer: `https://www.imdb.com${trailer}`
      };
      movieCache[imdbID] = movie;
      return movie;
    });
}
module.exports = {
  searchMovies,
  getMovie
};