console.log('script.js підключено');

document.querySelectorAll('.trip-card').forEach(card => card.remove());

const BUDGET_LIMIT = 1000;

const trips = [
    {
        destination: 'Лісабон, Португалія',
        days: 8,
        budget: 810,
        dates: '12–19 червня 2026',
        status: 'completed',
        image: 'assets/img/lisbon.svg',
        imageAlt: 'Краєвид на місто Лісабон з червоними дахами будинків'
    },
    {
        destination: 'Кіото, Японія',
        days: 12,
        budget: 2400,
        dates: '3–14 листопада 2026',
        status: 'planned',
        image: 'assets/img/kyoto.svg',
        imageAlt: 'Традиційна брама-торії в Кіото на тлі гір'
    },
    {
        destination: 'Тбілісі, Грузія',
        days: 8,
        budget: 650,
        dates: '2–9 вересня 2026',
        status: 'ongoing',
        image: 'assets/img/tbilisi.svg',
        imageAlt: 'Панорама старого Тбілісі з фунікулером'
    }
];

const STATUS_LABELS = {
    completed: { icon: '✔', text: 'Завершено' },
    planned: { icon: '✈', text: 'Заплановано' },
    ongoing: { icon: '●', text: 'Триває' }
};

const listContainer = document.querySelector('#trips-list');

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
        console.log(`${trip.destination}: ${trip.days} дн., ${trip.budget} € (${category})`);
        totalBudget += trip.budget;
    }

    console.log(`Кількість подорожей: ${list.length}`);
    console.log(`Загальний бюджет: ${totalBudget} €`);
    console.log(`Середній бюджет: ${Math.round(totalBudget / list.length)} €`);
}

// Стрілкова функція: повертає вартість одного дня подорожі, округлену до цілого
const costPerDay = trip => Math.round(trip.budget / trip.days);

// Виводить список на сторінку: очищає контейнер і для кожної подорожі створює картку з назвою, умовами, статусом, атрибутом і класом за бюджетом
function renderTrips(list) {
    listContainer.innerHTML = '';

    list.forEach(trip => {
        const card = document.createElement('article');
        const image = document.createElement('img');
        const body = document.createElement('div');
        const status = document.createElement('span');
        const statusIcon = document.createElement('span');
        const title = document.createElement('h3');
        const dates = document.createElement('p');
        const details = document.createElement('p');
        const link = document.createElement('a');

        const statusLabel = STATUS_LABELS[trip.status];

        card.classList.add('trip-card');
        card.dataset.costPerDay = String(costPerDay(trip));

        if (getBudgetCategory(trip.budget) === 'дорога') {
            card.classList.add('expensive');
        } else {
            card.classList.add('budget');
        }

        image.classList.add('trip-card__image');
        image.src = trip.image;
        image.alt = trip.imageAlt;

        body.classList.add('trip-card__body');

        status.classList.add('status', `status--${trip.status}`);
        statusIcon.textContent = statusLabel.icon;
        statusIcon.setAttribute('aria-hidden', 'true');
        status.append(statusIcon, ` ${statusLabel.text}`);

        title.textContent = trip.destination;

        dates.classList.add('trip-card__dates');
        dates.textContent = trip.dates;

        details.textContent = `${trip.days} днів, ${trip.budget} €`;

        link.classList.add('view-details-link');
        link.href = '#details';
        link.textContent = 'Переглянути деталі';

        body.append(status, title, dates, details, link);
        card.append(image, body);
        listContainer.append(card);
    });
}

// Оновлює підсумковий елемент: виводить кількість подорожей у списку
function updateTripsCount(list) {
    const counter = document.querySelector('#trips-count');
    counter.textContent = `Кількість подорожей: ${list.length}`;
}

printTripsSummary(trips);

for (const trip of trips) {
    console.log(`${trip.destination}: ${costPerDay(trip)} € на день`);
}

renderTrips(trips);
updateTripsCount(trips);