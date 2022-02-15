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

        findElement('.search__img', filmCard).alt = elem.Title + '\'s poster';
        findElement('.search__title', filmCard).textContent = elem.Title;
        findElement('.search__overview', filmCard).textContent = 'Overview: ' + getFilmData(elem.imdbID)[2];
        findElement('.search__score', filmCard).textContent = 'Rating(imdb): ' + getFilmData(elem.imdbID)[1];
        findElement('.search__type', filmCard).textContent = 'Type: ' + elem.Type.toUpperCase();
        findElement('.search__genres', filmCard).textContent = 'Genres: ' + getFilmData(elem.imdbID)[0];

        filmsFragment.appendChild(filmCard);
    });

    filmsList.appendChild(filmsFragment);
}

async function getFilmData(id) {
    const response = await fetch(API+API_KEY+'&i='+id);

    const data = await response.json();

    if (data.Response == 'True') {
        const genres = data.Genre;
        const score = data.imdbRating;
        const overview = data.Plot;
        return [genres, score, overview];
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

async function getData(searchQuery = '&s=Spider-Man') {
    loadingAnimation();

    const response = await fetch(API+API_KEY+searchQuery);

    const data = await response.json();
    console.log(searchQuery);
    console.log(data.Response);
    console.log(data);

    if (data.Response == 'True') {
        renderFilms(data.Search);
    } else if (data.Error == "Too many results") {
        filmsList.innerHTML = null;
        filmsList.innerHTML = 'Too many results. Please add more info';
    } else {
        filmsList.innerHTML = null;
        alert('Looks like there\'s a server error :(');
    }
}

const handleSubmit = (evt) => {
    evt.preventDefault();
    const title = titleValue.value.trim();
    const year = yearValue.value.trim();
    const type = typeValue.value;

    if (title == null) {
        alert('Title must be written');
    } else {
        if (year != null && !isNaN(year) && type == 'all') {
            getData('&s='+title+'&y='+year);
        } else if (type != 'all' && year == null) {
            getData('&s='+title+'&type='+type);
        } else if (isNaN(year)) {
            alert('Not a number! :)');
            return;
        } else if (type != 'all' && year != null && !isNaN(year)) {
            getData('&s='+title+'&y='+year+'&type='+type);
        }
    }
}

renderAdCarousel(films);

form.addEventListener('submit', handleSubmit);