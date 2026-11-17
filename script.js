// Обрано Vue 3: простіший шаблонний синтаксис, не потрібні JSX і Babel, сторінка завантажується швидше

console.log('script.js підключено');

// Компонент мітки статусу: отримує ключ статусу через props і показує іконку з текстом
const StatusBadge = {
    props: ['status'],
    computed: {
        info() {
            const labels = {
                completed: { icon: '✔', text: 'Завершено' },
                planned: { icon: '✈', text: 'Заплановано' },
                ongoing: { icon: '●', text: 'Триває' }
            };

            return labels[this.status];
        }
    },
    template: `
        <span class="status" :class="'status--' + status">
            <span aria-hidden="true">{{ info.icon }}</span> {{ info.text }}
        </span>`
};

// Компонент TripCard (props: destination, days, budget та дані для відображення): вартість дня обчислюється автоматично, натискання на картку повідомляє батьківському компоненту через $emit
const TripCard = {
    components: { StatusBadge },
    props: {
        id: Number,
        destination: String,
        days: Number,
        budget: Number,
        dates: String,
        status: String,
        image: String,
        imageAlt: String,
        selected: Boolean,
        budgetLimit: Number
    },
    emits: ['select'],
    computed: {
        costPerDay() {
            return this.budget / this.days;
        },
        category() {
            return this.budget > this.budgetLimit ? 'expensive' : 'budget';
        }
    },
    template: `
        <article class="trip-card" :class="[category, { selected: selected }]"
                 :data-trip-id="id" :data-cost-per-day="Math.round(costPerDay)" @click="$emit('select', id)">
            <img v-if="image" class="trip-card__image" :src="image" :alt="imageAlt">
            <div class="trip-card__body">
                <status-badge :status="status"></status-badge>
                <h3>{{ destination }}</h3>
                <p class="trip-card__dates">{{ dates }}</p>
                <p>{{ days }} днів, {{ budget }} грн</p>
                <p class="trip-card__cost">Вартість на день: {{ Math.round(costPerDay) }} грн</p>
                <a class="view-details-link" href="#details">Переглянути деталі</a>
            </div>
        </article>`
};

// Кореневий застосунок: ручне виведення списку функцією renderTrips із практичної №7 замінено компонентом TripCard (v-for), а масив подорожей тепер лежить у реактивному стані data()
Vue.createApp({
    components: { TripCard, StatusBadge },
    data() {
        return {
            trips: [
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
            ],
            budgetLimit: 1000,
            minCostPerDay: 50,
            selectedTripId: 1,
            form: {
                destination: '',
                days: '',
                budget: ''
            }
        };
    },
    computed: {
        selectedTrip() {
            return this.trips.find(trip => trip.id === this.selectedTripId) || null;
        },
        selectedCostPerDay() {
            return this.selectedTrip ? Math.round(this.selectedTrip.budget / this.selectedTrip.days) : 0;
        },
        costHint() {
            const days = Number(this.form.days);
            const budget = Number(this.form.budget);

            if (this.form.days === '' || this.form.budget === '' || days < 1 || budget < 0) {
                return null;
            }

            const perDay = Math.round(budget / days);

            if (perDay < this.minCostPerDay) {
                return {
                    text: `Бюджет на день: ${perDay} грн. Це менше за ${this.minCostPerDay} грн, сума може бути замалою`,
                    warning: true
                };
            }

            return { text: `Бюджет на день: ${perDay} грн`, warning: false };
        }
    },
    methods: {
        // Обробляє подію select від компонента TripCard: запам'ятовує обрану подорож, а деталі оновлюються автоматично
        selectTrip(id) {
            this.selectedTripId = id;
        },
        // Скидає власне повідомлення про помилку на полі напрямку під час введення
        clearDestinationError() {
            this.$refs.destinationInput.setCustomValidity('');
        },
        // Обробляє надсилання форми: перевіряє напрямок, додає подорож у реактивний масив (список оновиться сам) і очищає поля
        addTrip() {
            const destination = this.form.destination.trim();

            if (destination === '') {
                const input = this.$refs.destinationInput;
                input.setCustomValidity('Вкажіть назву напрямку');
                input.reportValidity();
                return;
            }

            const nextId = Math.max(...this.trips.map(trip => trip.id)) + 1;

            this.trips.push({
                id: nextId,
                destination,
                days: this.form.days,
                budget: this.form.budget,
                dates: 'Дати уточнюються',
                status: 'planned',
                image: '',
                imageAlt: '',
                description: 'Опис ще не додано'
            });

            this.form.destination = '';
            this.form.days = '';
            this.form.budget = '';
        }
    }
}).mount('#app');

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

const STOPS_LS_KEY = 'tripStops';
const STOPS_MIGRATED_KEY = 'tripStopsMigrated';
const DB_NAME = 'TripPlannerDB';
const DB_VERSION = 1;
const STORE_NAME = 'tripStops';

const stopForm = document.querySelector('#stop-form');
const stopCountryInput = document.querySelector('#stop-country-input');
const stopCityInput = document.querySelector('#stop-city-input');
const stopFromInput = document.querySelector('#stop-from-input');
const stopToInput = document.querySelector('#stop-to-input');
const stopNotesInput = document.querySelector('#stop-notes-input');
const stopsStatus = document.querySelector('#stops-status');
const stopsList = document.querySelector('#stops-list');

let stops = [];
let storageMode = 'indexeddb';
let dbPromise = null;

// Зберігає масив пунктів маршруту в localStorage у вигляді JSON-рядка
function saveToLocalStorage(items) {
    localStorage.setItem(STOPS_LS_KEY, JSON.stringify(items));
}

// Читає масив пунктів із localStorage; пошкоджені дані не ламають застосунок, а дають порожній список
function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(STOPS_LS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Пошкоджені дані в localStorage:', error);
        return [];
    }
}

// Відкриває базу IndexedDB (під час першого запуску створює object store tripStops з ключем id) і повертає Promise із підключенням
function openDB() {
    if (dbPromise === null) {
        dbPromise = new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                reject(new Error('IndexedDB недоступна'));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = event => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    return dbPromise;
}

// Записує об'єкт у сховище через put: створює новий запис або оновлює наявний із тим самим id
async function putItem(item) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Додає новий пункт маршруту в IndexedDB
function addItem(item) {
    return putItem(item);
}

// noinspection JSUnusedGlobalSymbols
// Оновлює наявний пункт маршруту в IndexedDB (put із тим самим id не створює дубліката)
function updateItem(item) {
    return putItem(item);
}

// Читає всі пункти маршруту з IndexedDB у транзакції readonly
async function getAllItems() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Видаляє пункт маршруту з IndexedDB за id у транзакції readwrite
async function deleteItem(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Одноразово переносить пункти з localStorage в IndexedDB, якщо сховище порожнє, і позначає перенесення прапорцем
async function migrateFromLocalStorage() {
    if (localStorage.getItem(STOPS_MIGRATED_KEY) === 'true') {
        return;
    }

    const existing = await getAllItems();
    const legacy = loadFromLocalStorage();

    if (existing.length === 0 && legacy.length > 0) {
        for (const stop of legacy) {
            await addItem(stop);
        }
    }

    localStorage.setItem(STOPS_MIGRATED_KEY, 'true');
}

// Показує повідомлення користувачу під формою маршруту; помилки підсвічуються кольором
function showStopsMessage(message, isError) {
    stopsStatus.textContent = message;
    stopsStatus.classList.toggle('error', isError);
}

// Перетворює дату з рядка формату ISO на звичний для користувача вигляд
function formatStopDate(isoDate) {
    return new Date(isoDate).toLocaleDateString('uk-UA', { timeZone: 'UTC' });
}

// Виводить пункти маршруту на сторінку, відсортовані за датою початку, або повідомлення про порожній список
function renderStops(list) {
    stopsList.innerHTML = '';

    if (list.length === 0) {
        const empty = document.createElement('p');
        empty.classList.add('stops-empty');
        empty.textContent = 'Пунктів маршруту ще немає. Додайте перший.';
        stopsList.append(empty);
        return;
    }

    const sorted = [...list].sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));

    sorted.forEach(stop => {
        const card = document.createElement('article');
        const info = document.createElement('div');
        const title = document.createElement('h3');
        const dates = document.createElement('p');
        const deleteButton = document.createElement('button');

        card.classList.add('stop-card');
        card.dataset.stopId = String(stop.id);

        info.classList.add('stop-card__info');

        title.textContent = `${stop.city}, ${stop.country}`;

        dates.classList.add('stop-card__dates');
        dates.textContent = `${formatStopDate(stop.dateFrom)} – ${formatStopDate(stop.dateTo)}`;

        info.append(title, dates);

        if (stop.notes) {
            const notes = document.createElement('p');
            notes.textContent = stop.notes;
            info.append(notes);
        }

        deleteButton.type = 'button';
        deleteButton.classList.add('stop-card__delete');
        deleteButton.dataset.id = String(stop.id);
        deleteButton.textContent = 'Видалити';

        card.append(info, deleteButton);
        stopsList.append(card);
    });
}

// Перевіряє, що дата завершення не раніша за дату початку, і виставляє власне повідомлення валідації
function validateStopDates() {
    if (stopFromInput.value !== '' && stopToInput.value !== '' && stopToInput.value < stopFromInput.value) {
        stopToInput.setCustomValidity('Дата завершення не може бути раніше за дату початку');
    } else {
        stopToInput.setCustomValidity('');
    }
}

// Початкове завантаження: відкриває IndexedDB, виконує міграцію й читає дані; якщо база недоступна, повідомляє про це й працює через localStorage
async function initStops() {
    try {
        await openDB();
        await migrateFromLocalStorage();
        stops = await getAllItems();
        storageMode = 'indexeddb';
    } catch (error) {
        console.error(error);
        storageMode = 'localstorage';
        stops = loadFromLocalStorage();
        showStopsMessage('IndexedDB недоступна (можливо, приватний режим). Пункти зберігаються тимчасово в localStorage.', true);
    }

    renderStops(stops);
}

// Обробники input на датах: перевіряють правильність періоду пункту маршруту
stopFromInput.addEventListener('input', validateStopDates);
stopToInput.addEventListener('input', validateStopDates);

// Обробник надсилання форми: збирає пункт маршруту, зберігає його (IndexedDB або localStorage) і перемальовує список
stopForm.addEventListener('submit', async event => {
    event.preventDefault();

    const stop = {
        id: Date.now(),
        country: stopCountryInput.value.trim(),
        city: stopCityInput.value.trim(),
        dateFrom: stopFromInput.value,
        dateTo: stopToInput.value,
        notes: stopNotesInput.value.trim()
    };

    if (stop.country === '' || stop.city === '') {
        showStopsMessage('Вкажіть країну та місто', true);
        return;
    }

    try {
        if (storageMode === 'indexeddb') {
            await addItem(stop);
            stops = await getAllItems();
        } else {
            stops.push(stop);
            saveToLocalStorage(stops);
        }

        renderStops(stops);
        stopForm.reset();
        showStopsMessage('', false);
    } catch (error) {
        console.error(error);
        showStopsMessage('Не вдалося зберегти пункт маршруту. Спробуйте ще раз.', true);
    }
});

// Обробник події click на кнопці «Видалити» (делегування на контейнер): видаляє пункт зі сховища й оновлює список
stopsList.addEventListener('click', async event => {
    const button = event.target.closest('.stop-card__delete');

    if (button === null) {
        return;
    }

    const id = Number(button.dataset.id);

    try {
        if (storageMode === 'indexeddb') {
            await deleteItem(id);
            stops = await getAllItems();
        } else {
            stops = stops.filter(stop => stop.id !== id);
            saveToLocalStorage(stops);
        }

        renderStops(stops);
        showStopsMessage('', false);
    } catch (error) {
        console.error(error);
        showStopsMessage('Не вдалося видалити пункт маршруту. Спробуйте ще раз.', true);
    }
});

void initStops();