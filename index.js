// Reusable autocomplete for 2 columns
const autoCompleteConfig = {
   renderOption(movie) {
      const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
      return `
        <img src="${imgSrc}" />
        ${movie.Title} (${movie.Year})
        `;
   },

   inputValue(movie) {
      return movie.Title;
   },
   async fetchData(searchTerm) {
      const response = await axios.get('http://www.omdbapi.com/', {
         params: {
            apikey: '58178005',
            s: searchTerm,
         },
      });

      //Handling Errored Responses
      if (response.data.Error) {
         //Returning empty array
         return [];
      }

      return response.data.Search;
   },
};

// Same autocomplete in different root elements
createAutoComplete({
   ...autoCompleteConfig,
   root: document.querySelector('#left-autocomplete'),
   onOptionSelect(movie) {
      document.querySelector('.tutorial').classList.add('is-hidden');
      onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
   },
});
createAutoComplete({
   ...autoCompleteConfig,
   root: document.querySelector('#right-autocomplete'),
   onOptionSelect(movie) {
      document.querySelector('.tutorial').classList.add('is-hidden');
      onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
   },
});

// Storing a reference to compare movies
let leftMovie;
let rightMovie;
// Selecting the movie and fetching info about it with imdbID
const onMovieSelect = async (movie, summaryElement, side) => {
   const response = await axios.get('http://www.omdbapi.com/', {
      params: {
         apikey: '58178005',
         i: movie.imdbID,
      },
   });
   console.log(response.data);

   summaryElement.innerHTML = movieTemplate(response.data);

   // Saving data to references
   if (side === 'left') {
      leftMovie = response.data;
   } else {
      rightMovie = response.data;
   }

   // Initializing comparison
   if (leftMovie && rightMovie) {
      runComparison();
   }
};

const runComparison = () => {
   const leftSideStats = document.querySelectorAll('#left-summary .notification');
   const rightSideStats = document.querySelectorAll('#right-summary .notification');

   leftSideStats.forEach((leftStat, index) => {
      const rightStat = rightSideStats[index];

      const leftSideValue = parseInt(leftStat.dataset.value);
      const rightSideValue = parseInt(rightStat.dataset.value);

      if (rightSideValue > leftSideValue) {
         leftStat.classList.remove('is-primary');
         leftStat.classList.add('is-warning');
      } else {
         rightStat.classList.remove('is-primary');
         rightStat.classList.add('is-warning');
      }
   });
};

// Making an HTML Snippet with movie info
const movieTemplate = movieDetail => {
   const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));
   const metascore = parseInt(movieDetail.Metascore);
   const imdbRating = parseFloat(movieDetail.imdbRating);
   const rottenTomatoes = parseInt(movieDetail.Ratings[1].Value.replace(/\%/g, ''));

   // Counting awards and nominations
   // Parsing and Adding number of awards
   const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
      const value = parseInt(word);

      if (isNaN(value)) {
         return prev;
      } else {
         return prev + value;
      }
   }, 0);

   return `
    <article class="media">
        <figure class="media-left">
            <p class="image">
                <img src="${movieDetail.Poster}" />
            </p>
        </figure>
        <div class="media-content">
            <div class="content">
            <h1>${movieDetail.Title}</h1>
            <h4>${movieDetail.Year}</h4>
            <h4>${movieDetail.Genre}</h4>
            <p>${movieDetail.Plot}</p>
            </div>
        </div>
    </article>
    <article data-value=${awards} class="notification is-primary">
        <p class="title">${movieDetail.Awards}</p>
        <p class="subtitle">Awards</p>
    </article>
    <article data-value=${rottenTomatoes} class="notification is-primary">
        <p class="title">${movieDetail.Ratings[1].Value}</p>
        <p class="subtitle">Rotten Tomatoes Rating</p>
    </article>
    <article data-value=${metascore} class="notification is-primary">
        <p class="title">${movieDetail.Metascore}</p>
        <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification is-primary">
        <p class="title">${movieDetail.imdbRating}</p>
        <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} class="notification is-primary">
        <p class="title">${movieDetail.imdbVotes}</p>
        <p class="subtitle">IMDB Votes</p>
    </article>
    `;
};
