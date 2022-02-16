const adCarousel = findElement('#adCarousel');
const carouselInner = findElement('.carousel-inner', adCarousel);
const adItemTemplate = findElement('.ad-carousel-item-template').content;
const placeholderTemplate = findElement('.loading-item-template').content;
const foundTemplate = findElement('.found-item-card-template').content;
const form = findElement('.search__form');
const titleValue = findElement('#search_title');
const yearValue = findElement('#search_year');
const typeValue = findElement('#search_type');
const filmsList = findElement('.results__inner');
const buttons = findElement('.search__buttons');
let lastSearchQuery;
let page = 1;

const renderAdCarousel = (db) => {
    const randomNumber = (Math.random(10)*100).toFixed();
    
    if (randomNumber > (db.length - 5)) {
        renderAdCarousel(db);
    } else {
        carouselInner.innerHTML = null;
        const adCarouselInnerFragmet = document.createDocumentFragment();

        const arrEnd = Number(randomNumber) + 6;
        const filmsArray = db.slice(randomNumber, arrEnd);

        for (let i = 0; i < filmsArray.length; i++) {
            const adCaoruselItem = adItemTemplate.cloneNode(true);

            findElement('.ad__img', adCaoruselItem).src = filmsArray[i].poster;
            findElement('.ad__img', adCaoruselItem).alt = filmsArray[i].title + '\'s poster';
            findElement('.ad__title', adCaoruselItem).textContent = filmsArray[i].title;
            findElement('.ad__overview', adCaoruselItem).textContent = filmsArray[i].overview;

            adCarouselInnerFragmet.appendChild(adCaoruselItem);
        }
        findElement('.carousel-item', adCarouselInnerFragmet).classList.add('active');

        carouselInner.appendChild(adCarouselInnerFragmet);
    }
}

const renderFilms = (db) => {
    filmsList.innerHTML = null;

    const filmsFragment = document.createDocumentFragment();

    db.forEach((elem) => {
        const filmCard = foundTemplate.cloneNode(true);

        if (elem.Poster == 'N/A') {
            findElement('.search__img', filmCard).src = './images/no-images.jpeg';
        } else {
            findElement('.search__img', filmCard).src = elem.Poster;
        }

        findElement('.card', filmCard).parentNode.dataset.imdbId = elem.imdbId;
        findElement('.search__img', filmCard).alt = elem.Title + '\'s poster';
        findElement('.search__title', filmCard).textContent = elem.Title;
        findElement('.search__type', filmCard).textContent = 'Type: ' + elem.Type.toUpperCase();
        findElement('.info__button', filmCard).dataset.imdbId = elem.imdbID;
        findElement('.card-info', filmCard).dataset.imdbId = elem.imdbID;

        filmsFragment.appendChild(filmCard);
    });

    filmsList.appendChild(filmsFragment);
    renderButtons(db);
}

async function getFilmData(id, node) {
    node.innerHTML = null;
    loadingInfo(node);
    node.dataset.used = 'true';
    const response = await fetch(API+API_KEY+'&i='+id);

    const data = await response.json();

    if (data.Response == 'True') {
        const genres = data.Genre;
        const score = data.imdbRating;
        const overview = data.Plot;
        let date;

        if (data.Released == 'N/A') {
            if (data.Year == 'N/A') {
                date = 'N/A';
            } else {
                date = data.Year;
            }
        } else {
            date = data.Released;
        }

        const info = [genres, score, overview, date];

        renderInfo(info, node);
    } else {
        alert('Some errors occured! :(')
        return;
    }
}

const loadingAnimation = () => {
    filmsList.innerHTML = null;

    const loadingFragment = document.createDocumentFragment();
    
    for (let i = 0; i < 10; i++) {
        const loadingItem = placeholderTemplate.cloneNode(true);
        loadingFragment.appendChild(loadingItem);
    }

    filmsList.appendChild(loadingFragment);
}

const loadingInfo = (node) => {
    const loading = findElement('.info-loading-template').content.cloneNode(true);
    node.appendChild(loading);
}

async function getData(searchQuery = '&s=Spider-Man', page) {
    loadingAnimation();

    lastSearchQuery = searchQuery;
    let response;
    let data;

    if (page <= 1) {
        response = await fetch(API+API_KEY+searchQuery);
        data = await response.json();
    } else {
        response = await fetch(API+API_KEY+searchQuery+'&page='+page);
        data = await response.json();
    }

    if (data.Response == 'True') {
        renderFilms(data.Search);
        renderButtons(data.totalResults, page);
        if (page <= 1) {
            if (!findElement('#prev_btn')) {
                return;
            } else {
                findElement('#prev_btn').disabled = true;
            }
        } else {
            if (!findElement('#prev_btn')) {
                return;
            } else {
                findElement('#prev_btn').disabled = true;
            }
        }

        if (page >= Math.ceil(data.totalResults / 10)) {
            if (!findElement('#next_btn')) {
                return;
            } else {
                findElement('#next_btn').disabled = true;
            }
        } else {
            if (!findElement('#next_btn')) {
                return;
            } else {
                findElement('#next_btn').disabled = false;
            }
        }

    } else if (data.Error == "Too many results.") {
        filmsList.innerHTML = null;
        buttons.innerHTML = null;
        filmsList.innerHTML = 'Too many results. Please add more info';
    } else if (data.Error == "Series not found!" || data.Error == "Movie not found!") {
        filmsList.innerHTML = null;
        buttons.innerHTML = null;
        filmsList.innerHTML = '<h2>No such films. Try to find another one! ;)</h2>'
    } else {
        filmsList.innerHTML = null;
        buttons.innerHTML = null;
        alert('Looks like there\'s a server error :(');
    }
}

const renderButtons = (totalResults, currentPage) => {
    buttons.innerHTML = null;
    const totalPage = Math.ceil(totalResults / 10); 
    
    if (totalPage > 1) {
        const buttonsFragment = document.createDocumentFragment();
        const newPrevBtn = document.createElement('button');
        newPrevBtn.className = 'btn btn-outline-primary';
        newPrevBtn.id = 'prev_btn';
        newPrevBtn.textContent = 'Prev';
        buttonsFragment.appendChild(newPrevBtn);
    
        for (let i = 0; i < totalPage; i++) {
            const newBtn = document.createElement('button');
            newBtn.className = 'btn btn-outline-primary pageBtn';
            newBtn.id = 'pg'+(i+1);
            newBtn.textContent = i+1;
            buttonsFragment.appendChild(newBtn);
        }

        findElement('#pg'+currentPage, buttonsFragment).classList.add('active');
    
        const newNextBtn = document.createElement('button');
        newNextBtn.className = 'btn btn-outline-primary';
        newNextBtn.id = 'next_btn';
        newNextBtn.textContent = 'Next';
        buttonsFragment.appendChild(newNextBtn);

        buttons.appendChild(buttonsFragment);
    }
}

const handleSubmit = (evt) => {
    evt.preventDefault();
    const title = titleValue.value.trim();
    const year = yearValue.value.trim();
    const type = typeValue.value;

    if (title == '') {
        alert('Title must be written');
    } else {
        let yearQuery = '&y='+year;
        let typeQuery = '&type='+type;
        let titleQuery = '&s='+title;
        let query = titleQuery;
        page = 1;

        if (year != '' && !isNaN(year)) {
            query += yearQuery;
        }

        if (type != 'all') {
            query += typeQuery;
        }

        getData(query, page);
    }
}

const handleClick = (evt) => {
    const clicked = evt.target;
    if (clicked.matches('#prev_btn')) {
        page--;
        getData(lastSearchQuery, page);
    } else if (clicked.matches('#next_btn')) {
        page++;
        getData(lastSearchQuery, page);
    } else if (clicked.matches('.pageBtn')) {
        const clickedId = clicked.id;
        const clickedPageArray = clickedId.split('');
        const clickedPage = clickedPageArray.slice(2, clickedPageArray.length).join('');
        page = clickedPage;
        getData(lastSearchQuery, page);
    }
}

const renderInfo = (info, node) => {
    node.innerHTML = null;

    const overview = document.createElement('p');
    overview.className = 'card-text';
    
    if (info[2] == 'N/A') {
        overview.textContent = 'Overview: not available yet.' 
    } else {
        overview.textContent = 'Overview: ' + info[2]; 
    }

    const rating = document.createElement('p');
    rating.className = 'card-text h5';

    if (info[1] == 'N/A') {
        rating.textContent = 'Rating: not available yet.';
    } else {
        rating.textContent = 'Rating: ' + info[1];
    }

    const release = document.createElement('time');
    release.className = 'card-text h5';

    if (info[3] == 'N/A') {
        release.textContent = 'Release: not available yet';
    } else {
        release.textContent = 'Release: ' + info[3];
    }

    const genres = document.createElement('p');
    genres.className = 'card-text h4';

    if (info[0] == 'N/A') {
        genres.textContent = 'Genres: not available yet.';
    } else {
        genres.textContent = 'Genres: ' + info[0];
    }

    const fragment = document.createDocumentFragment();
    fragment.appendChild(overview);
    fragment.appendChild(rating);
    fragment.appendChild(release);
    fragment.appendChild(genres);

    node.appendChild(fragment);
}

const handleInfo = evt => {
    const clicked = evt.target;
    if (clicked.matches('.info__button')) {
        const filmId = clicked.dataset.imdbId;
        const filmInfo = clicked.nextElementSibling;
        // getFilmData(filmId, filmInfo);

        if (filmInfo.dataset.used != 'true') {
            getFilmData(filmId, filmInfo);
        } else if (filmInfo.dataset.used == 'true') {
            filmInfo.innerHTML = null;
            filmInfo.removeAttribute('data-used');
        }
    }
}

renderAdCarousel(films);

form.addEventListener('submit', handleSubmit);
buttons.addEventListener('click', handleClick);
filmsList.addEventListener('click', handleInfo);