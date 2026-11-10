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