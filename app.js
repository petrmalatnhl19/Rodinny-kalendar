/* =========================================================
MALÁTOVI – NAŠE DOMÁCNOST
Hlavní funkce aplikace
========================================================= */

/* =========================================================

1. ZÁKLADNÍ DATA
   ========================================================= */

const quotes = [
"Domov není místo. Domov jsou lidé, které máme rádi.",
"Rodina je místo, kde začíná život a nikdy nekončí láska.",
"Nejkrásnější chvíle nejsou ty, které prožijeme sami, ale společně.",
"Štěstí domova se skládá z malých společných okamžiků.",
"Rodina znamená mít někoho, kdo s tebou sdílí včerejšek, dnešek i zítřek.",
"Tam, kde jsme spolu, je náš domov."
];

let events = [];
let tasks = [];

let currentCalendarDate = new Date();
let selectedDate = new Date();

/* =========================================================
2. NAČTENÍ A ULOŽENÍ DAT
========================================================= */

function loadData() {

const savedEvents = localStorage.getItem("malatoviEvents");
const savedTasks = localStorage.getItem("malatoviTasks");

if (savedEvents) {
    try {
        events = JSON.parse(savedEvents);
    } catch (error) {
        events = [];
    }
}

if (savedTasks) {
    try {
        tasks = JSON.parse(savedTasks);
    } catch (error) {
        tasks = [];
    }
}

}

function saveData() {

localStorage.setItem(
    "malatoviEvents",
    JSON.stringify(events)
);

localStorage.setItem(
    "malatoviTasks",
    JSON.stringify(tasks)
);

}

/* =========================================================
3. POMOCNÉ FUNKCE PRO DATUM
========================================================= */

function getDateKey(date) {

const year = date.getFullYear();
const month = String(
    date.getMonth() + 1
).padStart(2, "0");

const day = String(
    date.getDate()
).padStart(2, "0");

return `${year}-${month}-${day}`;

}

function formatDate(date) {

return new Intl.DateTimeFormat(
    "cs-CZ",
    {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }
).format(date);

}

function formatShortDate(dateString) {

const date = new Date(
    `${dateString}T00:00:00`
);

return new Intl.DateTimeFormat(
    "cs-CZ",
    {
        day: "numeric",
        month: "long"
    }
).format(date);

}

function isToday(date) {

return getDateKey(date) ===
    getDateKey(new Date());

}

function createId() {

return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;

}

function escapeHTML(value = "") {

return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

/* =========================================================
4. HLAVIČKA A CITÁTY
========================================================= */

function renderHeader() {

const currentDateElement =
    document.getElementById("currentDate");

const quoteElement =
    document.getElementById("familyQuote");

const todayMessage =
    document.getElementById("todayMessage");

if (currentDateElement) {
    currentDateElement.textContent =
        formatDate(new Date());
}

if (quoteElement) {

    const randomQuote =
        quotes[
            Math.floor(
                Math.random() *
                quotes.length
            )
        ];

    quoteElement.textContent =
        `„${randomQuote}“`;
}

if (todayMessage) {

    const todayKey =
        getDateKey(new Date());

    const todayEvents =
        events.filter(
            event =>
                event.date === todayKey
        );

    if (todayEvents.length === 0) {
        todayMessage.textContent =
            "Dnes máme prostor pro společné chvíle.";
    } else if (todayEvents.length === 1) {
        todayMessage.textContent =
            "Dnes nás čeká jedna důležitá věc.";
    } else {
        todayMessage.textContent =
            `Dnes nás čekají ${todayEvents.length} události.`;
    }

}

}

/* =========================================================
5. VYKRESLENÍ UDÁLOSTÍ
========================================================= */

function createEmptyEventsMessage(
title,
description
) {

return `
    <div class="empty-state">
        <div class="empty-icon">
            <i class="fa-regular fa-calendar"></i>
        </div>

        <div>
            <h3>${title}</h3>
            <p>${description}</p>
        </div>
    </div>
`;

}

function createEventCard(event) {

const time =
    event.time
        ? event.time
        : "Celý den";

const description =
    event.description
        ? escapeHTML(event.description)
        : "Rodinná událost";

return `
    <article
        class="event-card"
        data-event-id="${event.id}"
    >

        <div class="event-time">
            ${escapeHTML(time)}
        </div>

        <div class="event-info">

            <h3>
                ${escapeHTML(event.title)}
            </h3>

            <p>
                ${description}
            </p>

        </div>

        <div class="event-actions">

            <button
                class="event-action edit-event"
                data-event-id="${event.id}"
                aria-label="Upravit událost"
                title="Upravit"
            >
                <i class="fa-solid fa-pen"></i>
            </button>

            <button
                class="event-action delete-event"
                data-event-id="${event.id}"
                aria-label="Smazat událost"
                title="Smazat"
            >
                <i class="fa-solid fa-trash"></i>
            </button>

        </div>

    </article>
`;

}

function renderTodayEvents() {

const container =
    document.getElementById("todayEvents");

if (!container) return;

const todayKey =
    getDateKey(new Date());

const todayEvents =
    events
        .filter(
            event =>
                event.date === todayKey
        )
        .sort(
            (a, b) =>
                (a.time || "99:99")
                .localeCompare(
                    b.time || "99:99"
                )
        );

if (todayEvents.length === 0) {

    container.innerHTML =
        createEmptyEventsMessage(
            "Dnes zatím nic nemáme",
            "Užijte si společný den."
        );

    return;
}

container.innerHTML =
    todayEvents
        .map(createEventCard)
        .join("");

}

function renderUpcomingEvents() {

const container =
    document.getElementById("upcomingEvents");

if (!container) return;

const todayKey =
    getDateKey(new Date());

const upcomingEvents =
    events
        .filter(
            event =>
                event.date > todayKey
        )
        .sort(
            (a, b) =>
                a.date.localeCompare(b.date) ||
                (a.time || "99:99")
                .localeCompare(
                    b.time || "99:99"
                )
        )
        .slice(0, 5);

if (upcomingEvents.length === 0) {

    container.innerHTML = `
        <div class="upcoming-empty">
            <i class="fa-regular fa-calendar"></i>
            Žádné další události zatím nejsou naplánované.
        </div>
    `;

    return;
}

container.innerHTML =
    upcomingEvents
        .map(event => {

            return createEventCard({
                ...event,
                description:
                    `${formatShortDate(event.date)} · ` +
                    (event.description || "")
            });

        })
        .join("");

}

/* =========================================================
6. KALENDÁŘ
========================================================= */

function renderCalendar() {

const monthElement =
    document.getElementById("calendarMonth");

const daysContainer =
    document.getElementById("calendarDays");

if (!monthElement || !daysContainer) {
    return;
}

const year =
    currentCalendarDate.getFullYear();

const month =
    currentCalendarDate.getMonth();

monthElement.textContent =
    new Intl.DateTimeFormat(
        "cs-CZ",
        {
            month: "long",
            year: "numeric"
        }
    ).format(currentCalendarDate);


const firstDay =
    new Date(year, month, 1);

const lastDay =
    new Date(year, month + 1, 0);

/*
   JavaScript má neděli jako 0.
   Převádíme na pondělí jako první den.
*/

const startingDay =
    (firstDay.getDay() + 6) % 7;

const totalDays =
    lastDay.getDate();


let calendarHTML = "";


/* Prázdná místa před prvním dnem */

for (
    let i = 0;
    i < startingDay;
    i++
) {

    calendarHTML +=
        `<div class="calendar-empty-day"></div>`;

}


/* Jednotlivé dny */

for (
    let day = 1;
    day <= totalDays;
    day++
) {

    const date =
        new Date(year, month, day);

    const dateKey =
        getDateKey(date);

    const hasEvent =
        events.some(
            event =>
                event.date === dateKey
        );

    const isSelected =
        getDateKey(selectedDate) ===
        dateKey;

    const classes = [
        "calendar-day"
    ];

    if (isToday(date)) {
        classes.push("today");
    }

    if (isSelected) {
        classes.push("selected");
    }

    if (hasEvent) {
        classes.push("has-event");
    }


    calendarHTML += `
        <button
            class="${classes.join(" ")}"
            data-date="${dateKey}"
            aria-label="${day}"
        >
            ${day}
        </button>
    `;

}


daysContainer.innerHTML =
    calendarHTML;


renderSelectedDayEvents();

}

function renderSelectedDayEvents() {

const titleElement =
    document.getElementById("selectedDayTitle");

const container =
    document.getElementById(
        "selectedDayEvents"
    );

if (!titleElement || !container) {
    return;
}

titleElement.textContent =
    formatDate(selectedDate);


const selectedKey =
    getDateKey(selectedDate);

const dayEvents =
    events
        .filter(
            event =>
                event.date === selectedKey
        )
        .sort(
            (a, b) =>
                (a.time || "99:99")
                .localeCompare(
                    b.time || "99:99"
                )
        );


if (dayEvents.length === 0) {

    container.innerHTML =
        createEmptyEventsMessage(
            "Pro tento den nic nemáme",
            "Můžete přidat novou událost."
        );

    return;
}


container.innerHTML =
    dayEvents
        .map(createEventCard)
        .join("");

}

/* =========================================================
7. ÚKOLY – RODINNÝ ZÁPISNÍK
========================================================= */

function createTaskNote(task) {

const completedClass =
    task.completed
        ? "completed"
        : "";

const description =
    task.description
        ? `
            <div class="task-note-description">
                ${escapeHTML(task.description)}
            </div>
        `
        : "";


return `
    <article
        class="task-note ${completedClass}"
        data-task-id="${task.id}"
    >

        <button
            class="task-check"
            data-task-id="${task.id}"
            aria-label="Označit úkol jako hotový"
        >
            <i class="fa-solid fa-check"></i>
        </button>


        <div class="task-note-content">

            <div class="task-note-title">
                ${escapeHTML(task.title)}
            </div>

            ${description}

        </div>

    </article>
`;

}

function renderTasks() {

const allTasksContainer =
    document.getElementById("allTasks");

const previewContainer =
    document.getElementById("taskPreview");


const sortedTasks =
    [...tasks].sort(
        (a, b) =>
            Number(a.completed) -
            Number(b.completed)
    );


if (allTasksContainer) {

    if (sortedTasks.length === 0) {

        allTasksContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fa-solid fa-pen"></i>
                </div>

                <div>
                    <h3>Zápisník je zatím prázdný</h3>
                    <p>
                        Přidejte první věc,
                        kterou je potřeba udělat.
                    </p>
                </div>
            </div>
        `;

    } else {

        allTasksContainer.innerHTML =
            sortedTasks
                .map(createTaskNote)
                .join("");

    }

}


if (previewContainer) {

    const previewTasks =
        sortedTasks
            .filter(
                task => !task.completed
            )
            .slice(0, 3);


    if (previewTasks.length === 0) {

        previewContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fa-solid fa-check"></i>
                </div>

                <div>
                    <h3>Vše je hotovo</h3>
                    <p>
                        Skvělá práce!
                    </p>
                </div>
            </div>
        `;

    } else {

        previewContainer.innerHTML =
            previewTasks
                .map(createTaskNote)
                .join("");

    }

}

}

/* =========================================================
8. MODÁLNÍ OKNA
========================================================= */

const modal =
document.getElementById("addModal");

function openModal() {

if (!modal) return;

modal.classList.remove("hidden");

modal.setAttribute(
    "aria-hidden",
    "false"
);

}

function closeModal() {

if (!modal) return;

modal.classList.add("hidden");

modal.setAttribute(
    "aria-hidden",
    "true"
);

}

/* =========================================================
9. FORMULÁŘ PRO UDÁLOST
========================================================= */

function showEventForm(eventToEdit = null) {

const isEditing =
    eventToEdit !== null;


const selectedDateKey =
    eventToEdit
        ? eventToEdit.date
        : getDateKey(selectedDate);


const eventTime =
    eventToEdit?.time || "";

const eventDescription =
    eventToEdit?.description || "";


const modalContent =
    document.querySelector(
        ".modal-content"
    );

if (!modalContent) return;


modalContent.innerHTML = `

    <button
        id="closeModal"
        class="close-modal"
        aria-label="Zavřít"
    >
        <i class="fa-solid fa-xmark"></i>
    </button>


    <div class="modal-heading">

        <span class="section-label">
            ${isEditing
                ? "ÚPRAVA UDÁLOSTI"
                : "NOVÁ UDÁLOST"}
        </span>

        <h2>
            ${isEditing
                ? "Upravit událost"
                : "Naplánovat společný čas"}
        </h2>

    </div>


    <form
        id="eventForm"
        class="app-form"
    >

        <label>

            Název události

            <input
                type="text"
                id="eventTitle"
                value="${isEditing
                    ? escapeHTML(eventToEdit.title)
                    : ""}"
                placeholder="Například návštěva lékaře"
                required
                maxlength="80"
            >

        </label>


        <label>

            Datum

            <input
                type="date"
                id="eventDate"
                value="${selectedDateKey}"
                required
            >

        </label>


        <label>

            Čas
            <input
                type="time"
                id="eventTime"
                value="${eventTime}"
            >

        </label>


        <label>

            Poznámka

            <textarea
                id="eventDescription"
                placeholder="Volitelná poznámka..."
                maxlength="300"
            >${escapeHTML(eventDescription)}</textarea>

        </label>


        <button
            type="submit"
            class="form-submit"
        >

            <i class="fa-solid fa-check"></i>

            ${isEditing
                ? "Uložit změny"
                : "Přidat událost"}

        </button>

    </form>

`;


attachModalCloseListener();


const form =
    document.getElementById("eventForm");

form?.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const title =
            document
                .getElementById("eventTitle")
                .value
                .trim();

        const date =
            document
                .getElementById("eventDate")
                .value;

        const time =
            document
                .getElementById("eventTime")
                .value;

        const description =
            document
                .getElementById("eventDescription")
                .value
                .trim();


        if (!title || !date) {
            return;
        }


        if (isEditing) {

            const index =
                events.findIndex(
                    item =>
                        item.id ===
                        eventToEdit.id
                );

            if (index !== -1) {

                events[index] = {
                    ...events[index],
                    title,
                    date,
                    time,
                    description
                };

            }

        } else {

            events.push({
                id: createId(),
                title,
                date,
                time,
                description,
                createdAt:
                    new Date()
                        .toISOString()
            });

        }


        selectedDate =
            new Date(
                `${date}T00:00:00`
            );

        currentCalendarDate =
            new Date(
                selectedDate
                    .getFullYear(),
                selectedDate
                    .getMonth(),
                1
            );


        saveData();
        renderEverything();
        closeModal();

    }
);

}

/* =========================================================
10. FORMULÁŘ PRO ÚKOL
========================================================= */

function showTaskForm() {

const modalContent =
    document.querySelector(
        ".modal-content"
    );

if (!modalContent) return;


modalContent.innerHTML = `

    <button
        id="closeModal"
        class="close-modal"
        aria-label="Zavřít"
    >
        <i class="fa-solid fa-xmark"></i>
    </button>


    <div class="modal-heading">

        <span class="section-label">
            NOVÝ ZÁPIS
        </span>

        <h2>
            Co je potřeba udělat?
        </h2>

        <p>
            Přidejte jednoduchý zápis
            do rodinného zápisníku.
        </p>

    </div>


    <form
        id="taskForm"
        class="app-form"
    >

        <label>

            Úkol

            <input
                type="text"
                id="taskTitle"
                placeholder="Například koupit pečivo"
                required
                maxlength="100"
                autofocus
            >

        </label>


        <label>

            Poznámka

            <textarea
                id="taskDescription"
                placeholder="Volitelná poznámka..."
                maxlength="250"
            ></textarea>

        </label>


        <button
            type="submit"
            class="form-submit"
        >

            <i class="fa-solid fa-plus"></i>

            Přidat do zápisníku

        </button>

    </form>

`;


attachModalCloseListener();


const form =
    document.getElementById("taskForm");

form?.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const title =
            document
                .getElementById("taskTitle")
                .value
                .trim();

        const description =
            document
                .getElementById(
                    "taskDescription"
                )
                .value
                .trim(
/* Pojistka – úvodní logo se vždy po načtení skryje */
window.addEventListener("load", () => {
    setTimeout(() => {
        const loadingScreen = document.getElementById("loadingScreen");

        if (loadingScreen) {
            loadingScreen.style.opacity = "0";
            loadingScreen.style.visibility = "hidden";
            loadingScreen.style.pointerEvents = "none";

            setTimeout(() => {
                loadingScreen.style.display = "none";
            }, 800);
        }
    }, 2000);
});
