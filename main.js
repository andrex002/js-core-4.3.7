const app = document.querySelector('.app');
const searchInput = app.querySelector('.search__input');
const searchList = app.querySelector('.search__list');
const repositoriesList = app.querySelector('.repositories__list');

const NUMBER_OF_REPOSITORIES = 5;

const debounce = (fn, debounceTime) => {
    let timer;

    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, arguments);
        }, debounceTime);
    }
};

function showsAutocomplete(repositories) {
    removeAutocomplete();
    for (let repository of repositories) {
        let searchItem = document.createElement('li');
        searchItem.classList.add('search__item');
        searchItem.textContent = repository.name;
        searchItem.dataset.owner = repository.owner.login;
        searchItem.dataset.stars = repository.stargazers_count;
        searchList.append(searchItem);
    }
}

function showsRepository(element) {
    let name = element.textContent;
    let owner = element.dataset.owner;
    let stars = element.dataset.stars;

    let repositoriesItem = `
        <li class="repositories__item">
            <div class="repositories__info">
                <div class="repositories__name">Name: ${name}</div>
                <div class="repositories__owner">Owner: ${owner}</div>
                <div class="repositories__stars">Stars: ${stars}</div>
            </div>
            <button class="repositories__btn-remove" type="button">Удалить репозиторий</button>
        </li>
    `;
    repositoriesList.innerHTML += repositoriesItem;
}

function removeAutocomplete() {
    searchList.innerHTML = '';
}

async function requestsRepositoryData() {
    const url = new URL('https://api.github.com/search/repositories');
    let requestParameters = searchInput.value;
    if (requestParameters === '') {
        removeAutocomplete();
        return;
    }
    url.searchParams.set('q', requestParameters);
    url.searchParams.set('per_page', NUMBER_OF_REPOSITORIES);
    try {
        let response = await fetch(url);
        if (response.ok) {
            let repositoriesData = await response.json();
            showsAutocomplete(repositoriesData.items);
        } else {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
    } catch (err) {
        alert(err.message);
    }
}

searchList.addEventListener('click', function (evt) {
    let target = evt.target;
    if (!target.classList.contains('search__item')) {
        return;
    }
    showsRepository(target);
    searchInput.value = '';
    removeAutocomplete();
});

repositoriesList.addEventListener('click', function (evt) {
    let target = evt.target;
    if (!target.classList.contains('repositories__btn-remove')) {
        return;
    }
    target.parentElement.remove();
});

const requestsRepositoryDataDebounce = debounce(requestsRepositoryData, 500);
searchInput.addEventListener('input', requestsRepositoryDataDebounce);
