console.log('script.js підключено');

document.querySelectorAll('.trip-card').forEach(card => card.remove());

const BUDGET_LIMIT = 1000;
const MIN_COST_PER_DAY = 50;

const trips = [
    {
        id: 1,
        destination: 'Лісабон, Португалія',
        days: 8,
        budget: 810,
        dates: '12–19 червня 2026',
        status: 'completed',
        image: 'assets/img/lisbon.svg',
        imageAlt: 'Краєвид на місто Лісабон з червоними дахами будинків',
        description: 'Тиждень у Лісабоні: прогулянки історичними районами Алфама та Байша, поїздка історичним трамваєм №28, день на узбережжі в Кашкайші, дегустація паштел-де-ната.'
    },
    {
        id: 2,
        destination: 'Кіото, Японія',
        days: 12,
        budget: 2400,
        dates: '3–14 листопада 2026',
        status: 'planned',
        image: 'assets/img/kyoto.svg',
        imageAlt: 'Традиційна брама-торії в Кіото на тлі гір',
        description: 'Осіннє листя, храми Фушімі-Інарі та Кінкаку-джі.'
    },
    {
        id: 3,
        destination: 'Тбілісі, Грузія',
        days: 8,
        budget: 650,
        dates: '2–9 вересня 2026',
        status: 'ongoing',
        image: 'assets/img/tbilisi.svg',
        imageAlt: 'Панорама старого Тбілісі з фунікулером',
        description: 'Сірчані бані, вулиця Шардені, поїздка до Казбегі.'
    }
];

const STATUS_LABELS = {
    completed: { icon: '✔', text: 'Завершено' },
    planned: { icon: '✈', text: 'Заплановано' },
    ongoing: { icon: '●', text: 'Триває' }
};

const listContainer = document.querySelector('#trips-list');
const detailsContent = document.querySelector('#details-content');
const form = document.querySelector('#trip-form');
const destinationInput = document.querySelector('#destination-input');
const daysInput = document.querySelector('#days-input');
const budgetInput = document.querySelector('#budget-input');
const costHint = document.querySelector('#cost-hint');

let selectedTripId = trips[0].id;

// Визначає категорію подорожі за бюджетом: «дорога», якщо бюджет перевищує ліміт, інакше «бюджетна»
function getBudgetCategory(budget) {
    if (budget > BUDGET_LIMIT) {
        return 'дорога';
    } else {
        return 'бюджетна';
    }
}

// Обходить масив подорожей циклом, виводить кожну з категорією та підсумки: кількість, загальний і середній бюджет
function printTripsSummary(list) {
    let totalBudget = 0;

    for (const trip of list) {
        const category = getBudgetCategory(trip.budget);
        console.log(`${trip.destination}: ${trip.days} дн., ${trip.budget} (${category})`);
        totalBudget += trip.budget;
    }

    console.log(`Кількість подорожей: ${list.length}`);
    console.log(`Загальний бюджет: ${totalBudget}`);
    console.log(`Середній бюджет: ${Math.round(totalBudget / list.length)}`);
}

// Стрілкова функція: повертає вартість одного дня подорожі, округлену до цілого
const costPerDay = trip => Math.round(trip.budget / trip.days);

// Повертає наступний вільний id для нової подорожі
function getNextId(list) {
    return Math.max(...list.map(trip => trip.id)) + 1;
}

// Створює мітку статусу подорожі з іконкою та текстом
function createStatusBadge(statusKey) {
    const label = STATUS_LABELS[statusKey];
    const badge = document.createElement('span');
    const icon = document.createElement('span');

    badge.classList.add('status', `status--${statusKey}`);
    icon.textContent = label.icon;
    icon.setAttribute('aria-hidden', 'true');
    badge.append(icon, ` ${label.text}`);

    return badge;
}

// Виводить список на сторінку: очищає контейнер і для кожної подорожі створює картку з назвою, умовами, статусом, атрибутами та класами
function renderTrips(list) {
    listContainer.innerHTML = '';

    list.forEach(trip => {
        const card = document.createElement('article');
        const body = document.createElement('div');
        const title = document.createElement('h3');
        const dates = document.createElement('p');
        const details = document.createElement('p');
        const link = document.createElement('a');

        card.classList.add('trip-card');
        card.classList.toggle('selected', trip.id === selectedTripId);
        card.dataset.tripId = String(trip.id);
        card.dataset.costPerDay = String(costPerDay(trip));

        if (getBudgetCategory(trip.budget) === 'дорога') {
            card.classList.add('expensive');
        } else {
            card.classList.add('budget');
        }

        if (trip.image) {
            const image = document.createElement('img');
            image.classList.add('trip-card__image');
            image.src = trip.image;
            image.alt = trip.imageAlt;
            card.append(image);
        }

        body.classList.add('trip-card__body');

        title.textContent = trip.destination;

        dates.classList.add('trip-card__dates');
        dates.textContent = trip.dates;

        details.textContent = `${trip.days} днів, ${trip.budget} грн`;

        link.classList.add('view-details-link');
        link.href = '#details';
        link.textContent = 'Переглянути деталі';

        body.append(createStatusBadge(trip.status), title, dates, details, link);
        card.append(body);
        listContainer.append(card);
    });
}

// Оновлює підсумковий елемент: виводить кількість подорожей у списку
function updateTripsCount(list) {
    const counter = document.querySelector('#trips-count');
    counter.textContent = `Кількість подорожей: ${list.length}`;
}

// Створює рядок деталей виду «Назва: значення» з виділеною назвою
function createDetailRow(label, value) {
    const row = document.createElement('p');
    const name = document.createElement('strong');

    name.textContent = label;
    row.append(name, ` ${value}`);

    return row;
}

// Показує деталі обраної подорожі в окремому блоці, повністю перебудовуючи його вміст
function showTripDetails(trip) {
    const statusRow = document.createElement('p');

    detailsContent.innerHTML = '';

    if (trip.image) {
        const image = document.createElement('img');
        image.src = trip.image;
        image.alt = trip.imageAlt;
        detailsContent.append(image);
    }

    statusRow.append(createStatusBadge(trip.status));

    detailsContent.append(
        statusRow,
        createDetailRow('Напрямок:', trip.destination),
        createDetailRow('Дати:', trip.dates),
        createDetailRow('Тривалість:', `${trip.days} днів`),
        createDetailRow('Бюджет:', `${trip.budget} грн`),
        createDetailRow('Вартість на день:', `${costPerDay(trip)} грн`),
        createDetailRow('Опис:', trip.description)
    );
}

// Перераховує вартість дня «на льоту» і показує попередження, якщо бюджет на день менший за поріг
function updateCostHint() {
    const days = Number(daysInput.value);
    const budget = Number(budgetInput.value);

    if (daysInput.value === '' || budgetInput.value === '' || days < 1 || budget < 0) {
        costHint.textContent = '';
        costHint.classList.remove('warning');
        return;
    }

    const perDay = costPerDay({ days, budget });
    const tooLow = perDay < MIN_COST_PER_DAY;

    if (tooLow) {
        costHint.textContent = `Бюджет на день: ${perDay} грн. Це менше за ${MIN_COST_PER_DAY} грн, сума може бути замалою`;
    } else {
        costHint.textContent = `Бюджет на день: ${perDay} грн`;
    }

    costHint.classList.toggle('warning', tooLow);
}

// Обробник події click на картці подорожі (делегування на контейнер): виділяє картку й показує її деталі
listContainer.addEventListener('click', event => {
    const card = event.target.closest('.trip-card');

    if (card === null) {
        return;
    }

    const trip = trips.find(item => item.id === Number(card.dataset.tripId));

    if (trip === undefined) {
        return;
    }

    selectedTripId = trip.id;

    listContainer.querySelectorAll('.trip-card').forEach(item => {
        item.classList.toggle('selected', item === card);
    });

    showTripDetails(trip);
});

// Обробники input на полях днів і бюджету: оновлюють підказку з вартістю дня
daysInput.addEventListener('input', updateCostHint);
budgetInput.addEventListener('input', updateCostHint);

// Обробник input на полі напрямку: скидає власне повідомлення про помилку
destinationInput.addEventListener('input', () => {
    destinationInput.setCustomValidity('');
});

// Обробник надсилання форми: скасовує перезавантаження, перевіряє поля, додає подорож у масив і перемальовує список
form.addEventListener('submit', event => {
    event.preventDefault();

    const destination = destinationInput.value.trim();
    const days = Number(daysInput.value);
    const budget = Number(budgetInput.value);

    if (destination === '') {
        destinationInput.setCustomValidity('Вкажіть назву напрямку');
        destinationInput.reportValidity();
        return;
    }

    const newTrip = {
        id: getNextId(trips),
        destination,
        days,
        budget,
        dates: 'Дати уточнюються',
        status: 'planned',
        image: '',
        imageAlt: '',
        description: 'Опис ще не додано'
    };

    trips.push(newTrip);

    renderTrips(trips);
    updateTripsCount(trips);

    form.reset();
    updateCostHint();
});

printTripsSummary(trips);

for (const trip of trips) {
    console.log(`${trip.destination}: ${costPerDay(trip)} на день`);
}

renderTrips(trips);
updateTripsCount(trips);
showTripDetails(trips[0]);

const COUNTRY_API_URL = 'https://restcountries.com/v3.1/name/';

const countryForm = document.querySelector('#country-form');
const countryInput = document.querySelector('#country-input');
const countrySearchButton = document.querySelector('#country-search-button');
const countryRefreshButton = document.querySelector('#country-refresh-button');
const countryStatus = document.querySelector('#country-status');
const countryList = document.querySelector('#country-list');

let lastCountryQuery = countryInput.value.trim();

// Вмикає або вимикає стан завантаження: показує текст і блокує кнопки на час запиту
function setCountryLoading(isLoading) {
    countrySearchButton.disabled = isLoading;
    countryRefreshButton.disabled = isLoading;

    if (isLoading) {
        countryStatus.classList.remove('error');
        countryStatus.textContent = 'Завантаження…';
    }
}

// Виводить користувачу зрозуміле повідомлення про помилку в окремий елемент
function showCountryError(message) {
    countryStatus.textContent = message;
    countryStatus.classList.add('error');
}

/**
 * @typedef {Object} Country
 * @property {{common: string}} name
 * @property {string[]} [capital]
 * @property {number} [population]
 * @property {{png: string}} flags
 */

/**
 * Виводить знайдені країни на сторінку: очищає контейнер і створює картку з прапором, назвою, столицею та населенням
 * @param {Country[]} list
 */
function renderCountries(list) {
    countryList.innerHTML = '';

    list.forEach(country => {
        const card = document.createElement('article');
        const flag = document.createElement('img');
        const body = document.createElement('div');
        const title = document.createElement('h3');
        const capital = document.createElement('p');
        const population = document.createElement('p');

        const capitalText = Array.isArray(country.capital) && country.capital.length > 0
            ? country.capital.join(', ')
            : 'немає даних';

        const populationText = typeof country.population === 'number'
            ? `${country.population.toLocaleString('uk-UA')} осіб`
            : 'немає даних';

        card.classList.add('country-card');

        flag.classList.add('country-card__flag');
        flag.src = country.flags.png;
        flag.alt = `Прапор країни ${country.name.common}`;

        body.classList.add('country-card__body');

        title.textContent = country.name.common;
        capital.textContent = `Столиця: ${capitalText}`;
        population.textContent = `Населення: ${populationText}`;

        body.append(title, capital, population);
        card.append(flag, body);
        countryList.append(card);
    });
}

// Виконує запит до REST Countries API (https://restcountries.com/v3.1/name/), перевіряє статус відповіді та повертає масив країн
async function fetchCountries(query) {
    const response = await fetch(`${COUNTRY_API_URL}${encodeURIComponent(query)}`);

    if (!response.ok) {
        const error = new Error(`Сервер відповів кодом ${response.status}`);
        error.status = response.status;
        throw error;
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
        const error = new Error('Порожня відповідь сервера');
        error.status = 404;
        throw error;
    }

    return data;
}

// Асинхронно завантажує дані про країну з REST Countries API (https://restcountries.com) і виводить їх на сторінку з обробкою помилок
async function loadCountry(query) {
    setCountryLoading(true);

    try {
        const countries = await fetchCountries(query);

        renderCountries(countries);
        countryStatus.textContent = `Знайдено країн: ${countries.length}`;
    } catch (error) {
        renderCountries([]);

        if (error.status === 404) {
            showCountryError('Країну не знайдено, перевірте написання');
        } else {
            showCountryError('Не вдалося завантажити дані. Спробуйте пізніше.');
        }

        console.error(error);
    } finally {
        setCountryLoading(false);
    }
}

// Обробник надсилання форми пошуку: скасовує перезавантаження й запускає запит за введеною назвою
countryForm.addEventListener('submit', event => {
    event.preventDefault();

    const query = countryInput.value.trim();

    if (query === '') {
        showCountryError('Введіть назву країни');
        return;
    }

    lastCountryQuery = query;
    void loadCountry(query);
});

// Обробник кнопки «Оновити»: повторює останній запит без перезавантаження сторінки
countryRefreshButton.addEventListener('click', () => {
    void loadCountry(lastCountryQuery);
});

void loadCountry(lastCountryQuery);