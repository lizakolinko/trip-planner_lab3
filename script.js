console.log('script.js підключено');

const BUDGET_LIMIT = 1000;

const trips = [
    { destination: 'Лісабон, Португалія', days: 8, budget: 810 },
    { destination: 'Кіото, Японія', days: 12, budget: 2400 },
    { destination: 'Тбілісі, Грузія', days: 8, budget: 650 }
];

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

printTripsSummary(trips);

for (const trip of trips) {
    console.log(`${trip.destination}: ${costPerDay(trip)} € на день`);
}