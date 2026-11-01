"use strict";

/* =========================================
MALÁTOVI – NAŠE DOMÁCNOST
HLAVNÍ APLIKACE
========================================= */

/* =========================================
ZÁKLADNÍ DATA
========================================= */

const quotes = [
"Domov není místo. Domov jsou lidé, které máme rádi.",
"Rodina je místo, kde začíná život a nikdy nekončí láska.",
"Nejkrásnější chvíle jsou ty, které prožijeme společně.",
"Štěstí domova se skládá z malých společných okamžiků.",
"Tam, kde jsme spolu, je náš domov.",
"Rodina proměňuje obyčejné dny v důležité vzpomínky."
];

let events = [];
let tasks = [];

let currentCalendarDate = new Date();
let selectedDate = new Date();

/* =========================================
POMOCNÉ FUNKCE
========================================= */

function createId() {
return "${Date.now()}-${Math.random() .toString(36) .substring(2, 10)}";
}

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

function dateFromKey(dateKey) {

if (!dateKey) {
    return new Date();
}

return new Date(
    `${dateKey}T12:00:00`
);

}

function escapeHTML(value) {

return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

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

function formatShortDate(dateKey) {

return new Intl.DateTimeFormat(
    "cs-CZ",
    {
        day: "numeric",
        month: "long"
    }
).format(
    dateFromKey(dateKey)
);

}

function isToday(date) {

return getDateKey(date) ===
    getDateKey(new Date());

}

function sortEvents(eventList) {

return [...eventList].sort(
    (a, b) => {

        const dateCompare =
            a.date.localeCompare(
                b.date
            );

        if (dateCompare !== 0) {
            return dateCompare;
        }

        return (
            a.time || "99:99"
        ).localeCompare(
            b.time || "99:99"
        );

    }
);

}

/* =========================================
ULOŽENÍ DAT
========================================= */

function loadData() {

try {

    const savedEvents =
        localStorage.getItem(
            "malatovi_events"
        );

    const savedTasks =
        localStorage.getItem(
            "malatovi_tasks"
        );


    events = savedEvents
        ? JSON.parse(savedEvents)
        : [];

    tasks = savedTasks
        ? JSON.parse(savedTasks)
        : [];


    if (!Array.isArray(events)) {
        events = [];
    }

    if (!Array.isArray(tasks)) {
        tasks = [];
    }

} catch (error) {

    console.error(
        "Nepodařilo se načíst data:",
        error
    );

    events = [];
    tasks = [];

}

}

function saveData() {

try {

    localStorage.setItem(
        "malatovi_events",
        JSON.stringify(events)
    );

    localStorage.setItem(
        "malatovi_tasks",
        JSON.stringify(tasks)
    );

} catch (error) {

    console.error(
        "Nepodařilo se uložit data:",
        error
    );

}

}

/* =========================================
ÚVODNÍ OBRAZOVKA
========================================= */

function hideLoadingScreen() {

const loadingScreen =
    document.getElementById(
        "loadingScreen"
    );

if (!loadingScreen) {
    return;
}


setTimeout(() => {

    loadingScreen.classList.add(
        "hide"
    );

    setTimeout(() => {

        if (loadingScreen.parentNode) {

            loadingScreen.style.display =
                "none";

        }

    }, 800);

}, 1800);

}

/* =========================================
HLAVIČKA
========================================= */

function renderHeader() {

const dateElement =
    document.getElementById(
        "currentDate"
    );

const quoteElement =
    document.getElementById(
        "familyQuote"
    );

const messageElement =
    document.getElementById(
        "todayMessage"
    );


if (dateElement) {

    dateElement.textContent =
        formatDate(new Date());

}


if (quoteElement) {

    const quote =
        quotes[
            Math.floor(
                Math.random() *
                quotes.length
            )
        ];

    quoteElement.textContent =
        `„${quote}“`;

}


if (messageElement) {

    const todayKey =
        getDateKey(new Date());

    const count =
        events.filter(
            event =>
                event.date === todayKey
        ).length;


    if (count === 0) {

        messageElement.textContent =
            "Dnes máme prostor pro společné chvíle.";

    } else if (count === 1) {

        messageElement.textContent =
            "Dnes nás čeká jedna důležitá událost.";

    } else {

        messageElement.textContent =
            `Dnes nás čekají ${count} události.`;

    }

}

}

/* =========================================
UDÁLOSTI
========================================= */

function emptyState(title, text) {

return `
    <div class="empty-state">

        <div class="empty-icon">
            ◌
        </div>

        <div>
            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(text)}
            </p>
        </div>

    </div>
`;

}

function eventCard(event, showDate = false) {

const time =
    event.time || "Celý den";

const descriptionParts = [];

if (showDate) {
    descriptionParts.push(
        formatShortDate(event.date)
    );
}

if (event.description) {
    descriptionParts.push(
        event.description
    );
}

const description =
    descriptionParts.length > 0
        ? descriptionParts.join(" · ")
        : "Rodinná událost";


return `
    <article class="event-card">

        <div class="event-time">
            ${escapeHTML(time)}
        </div>

        <div class="event-info">

            <h3>
                ${escapeHTML(event.title)}
            </h3>

            <p>
                ${escapeHTML(description)}
            </p>

        </div>

        <div class="event-actions">

            <button
                class="event-action"
                type="button"
                data-action="edit-event"
                data-id="${escapeHTML(event.id)}"
                title="Upravit"
            >
                ✎
            </button>

            <button
                class="event-action"
                type="button"
                data-action="delete-event"
                data-id="${escapeHTML(event.id)}"
                title="Smazat"
            >
                ×
            </button>

        </div>

    </article>
`;

}

function renderTodayEvents() {

const container =
    document.getElementById(
        "todayEvents"
    );

if (!container) {
    return;
}


const todayKey =
    getDateKey(new Date());

const todayEvents =
    sortEvents(
        events.filter(
            event =>
                event.date === todayKey
        )
    );


if (todayEvents.length === 0) {

    container.innerHTML =
        emptyState(
            "Dnes zatím nic nemáme",
            "Užijte si společný den."
        );

    return;
}


container.innerHTML =
    todayEvents
        .map(
            event =>
                eventCard(event)
        )
        .join("");

}

function renderUpcomingEvents() {

const container =
    document.getElementById(
        "upcomingEvents"
    );

if (!container) {
    return;
}


const todayKey =
    getDateKey(new Date());

const upcoming =
    sortEvents(
        events.filter(
            event =>
                event.date > todayKey
        )
    ).slice(0, 6);


if (upcoming.length === 0) {

    container.innerHTML =
        emptyState(
            "Nic dalšího zatím není naplánováno",
            "Novou událost můžete přidat tlačítkem plus."
        );

    return;
}


container.innerHTML =
    upcoming
        .map(
            event =>
                eventCard(
                    event,
                    true
                )
        )
        .join("");

}

/* =========================================
KALENDÁŘ
========================================= */

function renderCalendar() {

const monthElement =
    document.getElementById(
        "calendarMonth"
    );

const daysContainer =
    document.getElementById(
        "calendarDays"
    );


if (
    !monthElement ||
    !daysContainer
) {
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
    ).format(
        currentCalendarDate
    );


const firstDay =
    new Date(
        year,
        month,
        1
    );

const lastDay =
    new Date(
        year,
        month + 1,
        0
    );


const startingDay =
    (
        firstDay.getDay() + 6
    ) % 7;


let html = "";


for (
    let i = 0;
    i < startingDay;
    i++
) {

    html +=
        `<div class="calendar-empty-day"></div>`;

}


for (
    let day = 1;
    day <= lastDay.getDate();
    day++
) {

    const date =
        new Date(
            year,
            month,
            day
        );

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


    html += `
        <button
            class="${classes.join(" ")}"
            type="button"
            data-action="select-date"
            data-date="${dateKey}"
        >
            ${day}
        </button>
    `;

}


daysContainer.innerHTML =
    html;


renderSelectedDayEvents();

}

function renderSelectedDayEvents() {

const titleElement =
    document.getElementById(
        "selectedDayTitle"
    );

const container =
    document.getElementById(
        "selectedDayEvents"
    );


if (
    !titleElement ||
    !container
) {
    return;
}


titleElement.textContent =
    formatDate(selectedDate);


const dateKey =
    getDateKey(selectedDate);


const dayEvents =
    sortEvents(
        events.filter(
            event =>
                event.date === dateKey
        )
    );


if (dayEvents.length === 0) {

    container.innerHTML =
        emptyState(
            "Pro tento den nic nemáme",
            "Můžete přidat novou událost."
        );

    return;
}


container.innerHTML =
    dayEvents
        .map(
            event =>
                eventCard(event)
        )
        .join("");

}

/* =========================================
ÚKOLY
========================================= */

function taskNote(task) {

const completed =
    task.completed
        ? "completed"
        : "";


const description =
    task.description
        ? `
            <div class="task-note-description">
                ${escapeHTML(
                    task.description
                )}
            </div>
        `
        : "";


return `
    <article
        class="task-note ${completed}"
    >

        <button
            class="task-check"
            type="button"
            data-action="toggle-task"
            data-id="${escapeHTML(task.id)}"
            aria-label="Odškrtnout úkol"
        >
            ✓
        </button>

        <div>

            <div class="task-note-title">
                ${escapeHTML(task.title)}
            </div>

            ${description}

        </div>

    </article>
`;

}

function getSortedTasks() {

return [...tasks].sort(
    (a, b) =>
        Number(a.completed) -
        Number(b.completed)
);

}

function renderTasks() {

const allTasks =
    document.getElementById(
        "allTasks"
    );

const preview =
    document.getElementById(
        "taskPreview"
    );


const sortedTasks =
    getSortedTasks();


if (allTasks) {

    if (sortedTasks.length === 0) {

        allTasks.innerHTML =
            emptyState(
                "Zápisník je zatím prázdný",
                "Přidejte první věc, kterou je potřeba udělat."
            );

    } else {

        allTasks.innerHTML =
            sortedTasks
                .map(taskNote)
                .join("");

    }

}


if (preview) {

    const unfinished =
        sortedTasks
            .filter(
                task =>
                    !task.completed
            )
            .slice(0, 4);


    if (unfinished.length === 0) {

        preview.innerHTML =
            emptyState(
                "Vše je hotovo",
                "Skvělá práce!"
            );

    } else {

        preview.innerHTML =
            unfinished
                .map(taskNote)
                .join("");

    }

}

}

/* =========================================
MODÁLNÍ OKNO
========================================= */

function getModalElements() {

return {
    modal:
        document.getElementById("modal"),

    content:
        document.querySelector(
            ".modal-content"
        )
};

}

function openModal() {

const { modal } =
    getModalElements();

if (!modal) {
    return;
}


modal.classList.remove(
    "hidden"
);

modal.setAttribute(
    "aria-hidden",
    "false"
);

}

function closeModal() {

const { modal } =
    getModalElements();

if (!modal) {
    return;
}


modal.classList.add(
    "hidden"
);

modal.setAttribute(
    "aria-hidden",
    "true"
);

}

function showAddMenu() {

const { content } =
    getModalElements();

if (!content) {
    return;
}


content.innerHTML = `

    <button
        class="close-modal"
        type="button"
        data-action="close-modal"
        aria-label="Zavřít"
    >
        ×
    </button>


    <div class="modal-heading">

        <span class="section-eyebrow">
            NOVÝ ZÁZNAM
        </span>

        <h2>
            Co přidáme?
        </h2>

        <p>
            Vyberte, co chcete přidat do rodinného prostoru.
        </p>

    </div>


    <div class="add-options">

        <button
            class="add-option"
            type="button"
            data-action="show-event-form"
        >

            <div class="add-option-icon">
                ◫
            </div>

            <div class="add-option-text">

                <h3>
                    Nová událost
                </h3>

                <p>
                    Naplánovat důležitý okamžik.
                </p>

            </div>

            <strong>›</strong>

        </button>


        <button
            class="add-option"
            type="button"
            data-action="show-task-form"
        >

            <div class="add-option-icon">
                ✎
            </div>

            <div class="add-option-text">

                <h3>
                    Nový zápis
                </h3>

                <p>
                    Přidat něco do rodinného zápisníku.
                </p>

            </div>

            <strong>›</strong>

        </button>

    </div>
`;

}

function openAddMenu() {

openModal();
showAddMenu();

}

/* =========================================
FORMULÁŘ UDÁLOSTI
========================================= */

function showEventForm(eventToEdit = null) {

const { content } =
    getModalElements();

if (!content) {
    return;
}


const editing =
    eventToEdit !== null;


const date =
    editing
        ? eventToEdit.date
        : getDateKey(selectedDate);


content.innerHTML = `

    <button
        class="close-modal"
        type="button"
        data-action="close-modal"
        aria-label="Zavřít"
    >
        ×
    </button>


    <div class="modal-heading">

        <span class="section-eyebrow">
            ${editing
                ? "ÚPRAVA UDÁLOSTI"
                : "NOVÁ UDÁLOST"}
        </span>

        <h2>
            ${editing
                ? "Upravit událost"
                : "Naplánovat společný čas"}
        </h2>

    </div>


    <form id="eventForm" class="app-form">

        <label>

            Název události

            <input
                id="eventTitle"
                type="text"
                required
                maxlength="100"
                value="${editing
                    ? escapeHTML(eventToEdit.title)
                    : ""}"
                placeholder="Například návštěva lékaře"
            >

        </label>


        <label>

            Datum

            <input
                id="eventDate"
                type="date"
                required
                value="${escapeHTML(date)}"
            >

        </label>


        <label>

            Čas

            <input
                id="eventTime"
                type="time"
                value="${editing
                    ? escapeHTML(
                        eventToEdit.time || ""
                    )
                    : ""}"
            >

        </label>


        <label>

            Poznámka

            <textarea
                id="eventDescription"
                maxlength="400"
                placeholder="Volitelná poznámka..."
            >${editing
                ? escapeHTML(
                    eventToEdit.description || ""
                )
                : ""}</textarea>

        </label>


        <button
            class="form-submit"
            type="submit"
        >
            ${editing
                ? "Uložit změny"
                : "Přidat událost"}
        </button>

    </form>
`;


const form =
    document.getElementById(
        "eventForm"
    );


if (!form) {
    return;
}


form.addEventListener(
    "submit",
    formEvent => {

        formEvent.preventDefault();


        const title =
            document
                .getElementById("eventTitle")
                .value
                .trim();

        const eventDate =
            document
                .getElementById("eventDate")
                .value;

        const time =
            document
                .getElementById("eventTime")
                .value;

        const description =
            document
                .getElementById(
                    "eventDescription"
                )
                .value
                .trim();


        if (
            !title ||
            !eventDate
        ) {
            return;
        }


        if (editing) {

            const index =
                events.findIndex(
                    event =>
                        event.id ===
                        eventToEdit.id
                );


            if (index !== -1) {

                events[index] = {
                    ...events[index],
                    title,
                    date: eventDate,
                    time,
                    description
                };

            }

        } else {

            events.push({
                id: createId(),
                title,
                date: eventDate,
                time,
                description,
                createdAt:
                    new Date().toISOString()
            });

        }


        selectedDate =
            dateFromKey(eventDate);

        currentCalendarDate =
            new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                1
            );


        saveData();
        renderAll();
        closeModal();

    }
);

}

/* =========================================
FORMULÁŘ ÚKOLU
========================================= */

function showTaskForm() {

const { content } =
    getModalElements();

if (!content) {
    return;
}


content.innerHTML = `

    <button
        class="close-modal"
        type="button"
        data-action="close-modal"
        aria-label="Zavřít"
    >
        ×
    </button>


    <div class="modal-heading">

        <span class="section-eyebrow">
            NOVÝ ZÁPIS
        </span>

        <h2>
            Co je potřeba udělat?
        </h2>

        <p>
            Jednoduše napište poznámku do rodinného zápisníku.
        </p>

    </div>


    <form id="taskForm" class="app-form">

        <label>

            Úkol

            <input
                id="taskTitle"
                type="text"
                required
                maxlength="120"
                placeholder="Například koupit pečivo"
            >

        </label>


        <label>

            Poznámka

            <textarea
                id="taskDescription"
                maxlength="300"
                placeholder="Volitelná poznámka..."
            ></textarea>

        </label>


        <button
            class="form-submit"
            type="submit"
        >
            Přidat do zápisníku
        </button>

    </form>
`;


const form =
    document.getElementById(
        "taskForm"
    );


if (!form) {
    return;
}


form.addEventListener(
    "submit",
    formEvent => {

        formEvent.preventDefault();


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
                .trim();


        if (!title) {
            return;
        }


        tasks.push({
            id: createId(),
            title,
            description,
            completed: false,
            createdAt:
                new Date().toISOString()
        });


        saveData();
        renderTasks();
        closeModal();

    }
);

}

/* =========================================
EDITACE A MAZÁNÍ
========================================= */

function editEvent(eventId) {

const event =
    events.find(
        item =>
            item.id === eventId
    );


if (!event) {
    return;
}


openModal();
showEventForm(event);

}

function deleteEvent(eventId) {

const event =
    events.find(
        item =>
            item.id === eventId
    );


if (!event) {
    return;
}


const confirmed =
    window.confirm(
        `Opravdu chcete smazat událost „${event.title}“?`
    );


if (!confirmed) {
    return;
}


events =
    events.filter(
        item =>
            item.id !== eventId
    );


saveData();
renderAll();

}

function toggleTask(taskId) {

const task =
    tasks.find(
        item =>
            item.id === taskId
    );


if (!task) {
    return;
}


task.completed =
    !task.completed;


saveData();
renderTasks();

}

/* =========================================
NAVIGACE
========================================= */

function showSection(sectionId) {

const sections =
    document.querySelectorAll(
        ".content-section"
    );

const buttons =
    document.querySelectorAll(
        ".nav-button[data-section]"
    );


sections.forEach(
    section => {

        section.classList.toggle(
            "active",
            section.id === sectionId
        );

    }
);


buttons.forEach(
    button => {

        button.classList.toggle(
            "active",
            button.dataset.section ===
                sectionId
        );

    }
);


window.scrollTo({
    top: 0,
    behavior: "smooth"
});

}

/* =========================================
NOTIFIKACE – PŘÍPRAVA
========================================= */

function requestNotificationPermission() {

if (
    !("Notification" in window)
) {

    window.alert(
        "Tento prohlížeč nepodporuje systémové notifikace."
    );

    return;
}


if (
    Notification.permission ===
    "granted"
) {

    window.alert(
        "Notifikace jsou v tomto prohlížeči povolené."
    );

    return;
}


if (
    Notification.permission ===
    "denied"
) {

    window.alert(
        "Notifikace jsou v prohlížeči zakázané. Můžete je povolit v nastavení prohlížeče."
    );

    return;
}


Notification.requestPermission();

}

/* =========================================
CENTRÁLNÍ OVLÁDÁNÍ KLIKNUTÍ
========================================= */

function setupClickEvents() {

document.addEventListener(
    "click",
    event => {

        const actionElement =
            event.target.closest(
                "[data-action]"
            );


        if (actionElement) {

            const action =
                actionElement.dataset.action;

            const id =
                actionElement.dataset.id;


            if (
                action ===
                "close-modal"
            ) {
                closeModal();
                return;
            }


            if (
                action ===
                "show-event-form"
            ) {
                showEventForm();
                return;
            }


            if (
                action ===
                "show-task-form"
            ) {
                showTaskForm();
                return;
            }


            if (
                action ===
                "edit-event"
            ) {
                editEvent(id);
                return;
            }


            if (
                action ===
                "delete-event"
            ) {
                deleteEvent(id);
                return;
            }


            if (
                action ===
                "toggle-task"
            ) {
                toggleTask(id);
                return;
            }


            if (
                action ===
                "select-date"
            ) {

                selectedDate =
                    dateFromKey(
                        actionElement.dataset.date
                    );

                renderCalendar();

                return;

            }

        }


        const navButton =
            event.target.closest(
                ".nav-button[data-section]"
            );


        if (navButton) {

            showSection(
                navButton.dataset.section
            );

        }

    }
);

}

/* =========================================
PŘÍMÁ TLAČÍTKA
========================================= */

function setupButtons() {

const addButtons = [
    "addEventHomeButton",
    "addEventCalendarButton"
];


addButtons.forEach(
    id => {

        const button =
            document.getElementById(id);

        if (button) {

            button.addEventListener(
                "click",
                () => {

                    openModal();
                    showEventForm();

                }
            );

        }

    }
);


const taskButtons = [
    "addTaskHomeButton",
    "addTaskButton"
];


taskButtons.forEach(
    id => {

        const button =
            document.getElementById(id);

        if (button) {

            button.addEventListener(
                "click",
                () => {

                    openModal();
                    showTaskForm();

                }
            );

        }

    }
);


const floatingButton =
    document.getElementById(
        "floatingAddButton"
    );


if (floatingButton) {

    floatingButton.addEventListener(
        "click",
        openAddMenu
    );

}


const previousButton =
    document.getElementById(
        "previousMonth"
    );


if (previousButton) {

    previousButton.addEventListener(
        "click",
        () => {

            currentCalendarDate =
                new Date(
                    currentCalendarDate.getFullYear(),
                    currentCalendarDate.getMonth() - 1,
                    1
                );

            renderCalendar();

        }
    );

}


const nextButton =
    document.getElementById(
        "nextMonth"
    );


if (nextButton) {

    nextButton.addEventListener(
        "click",
        () => {

            currentCalendarDate =
                new Date(
                    currentCalendarDate.getFullYear(),
                    currentCalendarDate.getMonth() + 1,
                    1
                );

            renderCalendar();

        }
    );

}


const notificationButtons = [
    "notificationButton",
    "notificationNavButton"
];


notificationButtons.forEach(
    id => {

        const button =
            document.getElementById(id);

        if (button) {

            button.addEventListener(
                "click",
                requestNotificationPermission
            );

        }

    }
);


const backdrop =
    document.getElementById(
        "modalBackdrop"
    );


if (backdrop) {

    backdrop.addEventListener(
        "click",
        closeModal
    );

}

}

/* =========================================
VYKRESLENÍ CELÉ APLIKACE
========================================= */

function renderAll() {

renderHeader();
renderTodayEvents();
renderUpcomingEvents();
renderCalendar();
renderTasks();

}

/* =========================================
SPUŠTĚNÍ
========================================= */

function startApplication() {

try {

    loadData();

    renderAll();

    setupClickEvents();

    setupButtons();

} catch (error) {

    console.error(
        "Došlo k chybě při spuštění aplikace:",
        error
    );

} finally {

    /*
     * Úvodní obrazovka se skryje vždy,
     * i pokud by došlo k neočekávané chybě.
     */

    hideLoadingScreen();

}

}

/* Spuštění po načtení HTML */

if (
document.readyState ===
"loading"
) {

document.addEventListener(
    "DOMContentLoaded",
    startApplication
);

} else {

startApplication();

}

/*

* Poslední nezávislá pojistka.
* Logo zmizí i v případě neočekávaného problému.
  */

window.setTimeout(() => {

const loadingScreen =
    document.getElementById(
        "loadingScreen"
    );

if (loadingScreen) {

    loadingScreen.classList.add(
        "hide"
    );

    loadingScreen.style.pointerEvents =
        "none";

}

}, 5000);
