document.addEventListener("DOMContentLoaded", () => {

/* =====================================================
   NAŠE DOMÁCNOST – MALÁTOVI
   Hlavní logika aplikace
====================================================== */


/* =====================================================
   1. DATA A STAV APLIKACE
====================================================== */

const STORAGE_EVENTS = "malatovi_events";
const STORAGE_TASKS = "malatovi_tasks";

let events = JSON.parse(localStorage.getItem(STORAGE_EVENTS)) || [];
let tasks = JSON.parse(localStorage.getItem(STORAGE_TASKS)) || [];

let currentCalendarDate = new Date();
let selectedDate = new Date();

let currentTaskFilter = "all";


/* =====================================================
   2. RODINNÉ CITÁTY
====================================================== */

const familyQuotes = [
    "Domov není místo. Domov jsou lidé, které máme rádi.",
    "Rodina je místo, kde začíná život a nikdy nekončí láska.",
    "Největší štěstí není v tom, co máme, ale s kým to sdílíme.",
    "Společné chvíle jsou ty, které se jednou stanou nejcennějšími vzpomínkami.",
    "Domov je tam, kde se vždycky najde někdo, kdo se na vás těší.",
    "Rodina proměňuje obyčejné dny v něco výjimečného.",
    "Společně tvoříme náš malý vesmír."
];

let currentQuoteIndex = 0;

function updateFamilyQuote() {

    const quoteElement = document.getElementById("familyQuote");

    if (!quoteElement) return;

    quoteElement.style.opacity = "0";

    setTimeout(() => {

        currentQuoteIndex =
            (currentQuoteIndex + 1) %
            familyQuotes.length;

        quoteElement.textContent =
            "„" +
            familyQuotes[currentQuoteIndex] +
            "“";

        quoteElement.style.opacity = "1";

    }, 350);
}

const quoteElement = document.getElementById("familyQuote");

if (quoteElement) {
    quoteElement.style.transition = "opacity 0.35s ease";
}

setInterval(updateFamilyQuote, 9000);


/* =====================================================
   3. NAČÍTACÍ ANIMACE
====================================================== */

const loadingScreen =
    document.getElementById("loadingScreen");

window.addEventListener("load", () => {

    setTimeout(() => {

        if (loadingScreen) {

            loadingScreen.classList.add("hide");

            setTimeout(() => {
                loadingScreen.remove();
            }, 900);

        }

    }, 2600);

});


/* =====================================================
   4. DATUM A UVÍTÁNÍ
====================================================== */

function updateCurrentDate() {

    const dateElement =
        document.getElementById("currentDate");

    const messageElement =
        document.getElementById("todayMessage");

    const today = new Date();

    const formattedDate =
        new Intl.DateTimeFormat(
            "cs-CZ",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        ).format(today);

    if (dateElement) {

        dateElement.textContent =
            formattedDate.charAt(0).toUpperCase() +
            formattedDate.slice(1);

    }

    if (messageElement) {

        const hour = today.getHours();

        if (hour < 12) {

            messageElement.textContent =
                "Dobré ráno. Podívejme se, co nás dnes čeká.";

        } else if (hour < 18) {

            messageElement.textContent =
                "Přejeme vám krásné odpoledne.";

        } else {

            messageElement.textContent =
                "Podívejme se společně na zítřejší den.";

        }

    }

}


/* =====================================================
   5. POMOCNÉ FUNKCE
====================================================== */

function saveEvents() {

    localStorage.setItem(
        STORAGE_EVENTS,
        JSON.stringify(events)
    );

}

function saveTasks() {

    localStorage.setItem(
        STORAGE_TASKS,
        JSON.stringify(tasks)
    );

}

function createId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}

function getLocalDateString(date) {

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;

}

function formatDate(dateString) {

    const date =
        new Date(`${dateString}T12:00:00`);

    return new Intl.DateTimeFormat(
        "cs-CZ",
        {
            weekday: "long",
            day: "numeric",
            month: "long"
        }
    ).format(date);

}

function escapeHtml(text) {

    const element = document.createElement("div");

    element.textContent = text;

    return element.innerHTML;

}


/* =====================================================
   6. NAVIGACE MEZI SEKcEMI
====================================================== */

const navigationButtons =
    document.querySelectorAll(".bottom-nav-item");

const sections =
    document.querySelectorAll(".content-section");

function openSection(sectionId) {

    sections.forEach(section => {

        section.classList.remove("active");

    });

    navigationButtons.forEach(button => {

        button.classList.remove("active");

    });

    const targetSection =
        document.getElementById(sectionId);

    const targetButton =
        document.querySelector(
            `.bottom-nav-item[data-section="${sectionId}"]`
        );

    if (targetSection) {

        targetSection.classList.add("active");

    }

    if (targetButton) {

        targetButton.classList.add("active");

    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

navigationButtons.forEach(button => {

    button.addEventListener("click", () => {

        const sectionId =
            button.dataset.section;

        openSection(sectionId);

    });

});


/* Tlačítka se šipkou na domovské stránce */

document
    .querySelectorAll("[data-section-target]")
    .forEach(button => {

        button.addEventListener("click", () => {

            openSection(
                button.dataset.sectionTarget
            );

        });

    });


/* =====================================================
   7. KALENDÁŘ
====================================================== */

function renderCalendar() {

    const calendarDays =
        document.getElementById("calendarDays");

    const calendarMonth =
        document.getElementById("calendarMonth");

    if (!calendarDays || !calendarMonth) return;

    const year =
        currentCalendarDate.getFullYear();

    const month =
        currentCalendarDate.getMonth();

    const monthName =
        new Intl.DateTimeFormat(
            "cs-CZ",
            {
                month: "long",
                year: "numeric"
            }
        ).format(
            new Date(year, month, 1)
        );

    calendarMonth.textContent =
        monthName.charAt(0).toUpperCase() +
        monthName.slice(1);

    calendarDays.innerHTML = "";

    const firstDay =
        new Date(year, month, 1);

    const lastDay =
        new Date(year, month + 1, 0);

    /* Pondělí = první den týdne */

    let firstWeekday =
        firstDay.getDay();

    firstWeekday =
        firstWeekday === 0
            ? 6
            : firstWeekday - 1;

    for (
        let i = 0;
        i < firstWeekday;
        i++
    ) {

        const emptyDay =
            document.createElement("div");

        emptyDay.className =
            "calendar-empty-day";

        calendarDays.appendChild(emptyDay);

    }

    const todayString =
        getLocalDateString(new Date());

    const selectedDateString =
        getLocalDateString(selectedDate);

    for (
        let day = 1;
        day <= lastDay.getDate();
        day++
    ) {

        const date =
            new Date(year, month, day);

        const dateString =
            getLocalDateString(date);

        const dayButton =
            document.createElement("button");

        dayButton.type = "button";

        dayButton.className =
            "calendar-day";

        dayButton.textContent = day;

        if (
            dateString === todayString
        ) {

            dayButton.classList.add("today");

        }

        if (
            dateString === selectedDateString
        ) {

            dayButton.classList.add("selected");

        }

        const hasEvent =
            events.some(event =>
                event.date === dateString
            );

        if (hasEvent) {

            dayButton.classList.add(
                "has-event"
            );

        }

        dayButton.addEventListener(
            "click",
            () => {

                selectedDate = date;

                renderCalendar();

                renderSelectedDayEvents();

            }
        );

        calendarDays.appendChild(
            dayButton
        );

    }

}


/* Změna měsíce */

document
    .getElementById("previousMonth")
    ?.addEventListener(
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

document
    .getElementById("nextMonth")
    ?.addEventListener(
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


/* =====================================================
   8. UDÁLOSTI VYBRANÉHO DNE
====================================================== */

function renderSelectedDayEvents() {

const title =
    document.getElementById(
        "selectedDayTitle"
    );

const container =
    document.getElementById(
        "selectedDayEvents"
    );

if (!title || !container) return;

const selectedDateString =
    getLocalDateString(selectedDate);

title.textContent =
    formatDate(selectedDateString);

const dayEvents =
    events
        .filter(event =>
            event.date ===
            selectedDateString
        )
        .sort((a, b) =>
            (a.time || "23:59")
                .localeCompare(
                    b.time || "23:59"
                )
        );

if (dayEvents.length === 0) {

    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">
                <i class="fa-regular fa-calendar"></i>
            </div>

            <div>
                <h3>Volný den</h3>

                <p>
                    Pro tento den zatím
                    nemáte žádné události.
                </p>
            </div>
        </div>
    `;

    return;

}

container.innerHTML =
    dayEvents
        .map(event => {

            const time =
                event.time ||
                "Celý den";

            return `
                <div class="event-card">

                    <div class="event-time">
                        ${escapeHtml(time)}
                    </div>

                    <div class="event-info">

                        <h3>
                            ${escapeHtml(event.title)}
                        </h3>

                        ${
                            event.description
                                ? `
                                    <p>
                                        ${escapeHtml(
                                            event.description
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                    <div class="event-actions">

                        <button
                            class="event-action edit-event"
                            data-event-id="${event.id}"
                            aria-label="Upravit událost"
                        >
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button
                            class="event-action delete-event"
                            data-event-id="${event.id}"
                            aria-label="Odstranit událost"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>

                </div>
            `;

        })
        .join("");

}
   /* =====================================================
ÚPRAVA A ODSTRANĚNÍ UDÁLOSTÍ
===================================================== */

document.addEventListener(
"click",
event => {

    const editButton =
        event.target.closest(
            ".edit-event"
        );

    const deleteButton =
        event.target.closest(
            ".delete-event"
        );


    /* ODSTRANĚNÍ UDÁLOSTI */

    if (deleteButton) {

        const eventId =
            deleteButton.dataset.eventId;

        const selectedEvent =
            events.find(
                item =>
                    item.id === eventId
            );

        if (!selectedEvent) return;

        const confirmed =
            confirm(
                `Opravdu chcete odstranit událost „${selectedEvent.title}“?`
            );

        if (!confirmed) return;

        events =
            events.filter(
                item =>
                    item.id !== eventId
            );

        saveEvents();

        renderCalendar();
        renderSelectedDayEvents();
        renderHomeEvents();

        return;

    }


    /* ÚPRAVA UDÁLOSTI */

    if (editButton) {

        const eventId =
            editButton.dataset.eventId;

        const selectedEvent =
            events.find(
                item =>
                    item.id === eventId
            );

        if (!selectedEvent) return;

        showEditEventForm(
            selectedEvent
        );

    }

}

);

function showEditEventForm(
selectedEvent
) {

if (!addModal) return;

addModal.classList.remove(
    "hidden"
);

const modalContent =
    addModal.querySelector(
        ".modal-content"
    );

if (!modalContent) return;

modalContent.innerHTML = `
    <button
        class="close-modal"
        id="dynamicCloseModal"
        aria-label="Zavřít"
    >
        <i class="fa-solid fa-xmark"></i>
    </button>

    <div class="modal-heading">

        <span class="section-label">
            ÚPRAVA UDÁLOSTI
        </span>

        <h2>Upravit plán</h2>

        <p>
            Změny se okamžitě uloží
            do rodinného kalendáře.
        </p>

    </div>

    <form
        id="editEventForm"
        class="app-form"
    >

        <label>
            Název události

            <input
                type="text"
                name="title"
                value="${escapeHtml(selectedEvent.title)}"
                required
            >
        </label>

        <label>
            Datum

            <input
                type="date"
                name="date"
                value="${selectedEvent.date}"
                required
            >
        </label>

        <label>
            Čas

            <input
                type="time"
                name="time"
                value="${selectedEvent.time || ""}"
            >
        </label>

        <label>
            Poznámka

            <textarea
                name="description"
                rows="3"
            >${escapeHtml(
                selectedEvent.description || ""
            )}</textarea>
        </label>

        <button
            type="submit"
            class="form-submit"
        >
            <i class="fa-solid fa-check"></i>

            Uložit změny
        </button>

    </form>
`;


document
    .getElementById(
        "dynamicCloseModal"
    )
    ?.addEventListener(
        "click",
        closeAddModal
    );


document
    .getElementById(
        "editEventForm"
    )
    ?.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const formData =
                new FormData(
                    event.target
                );

            selectedEvent.title =
                formData
                    .get("title")
                    .trim();

            selectedEvent.date =
                formData.get("date");

            selectedEvent.time =
                formData.get("time");

            selectedEvent.description =
                formData
                    .get("description")
                    .trim();

            saveEvents();

            /* Pokud se změnilo datum,
               přesuneme výběr na nový den */

            selectedDate =
                new Date(
                    `${selectedEvent.date}T12:00:00`
                );

            currentCalendarDate =
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    1
                );

            closeAddModal();

            renderCalendar();
            renderSelectedDayEvents();
            renderHomeEvents();

            resetModalContent();

        }
    );

}
    container.innerHTML =
        dayEvents
            .map(event => {

                const time =
                    event.time
                        ? event.time
                        : "Celý den";

                return `
                    <div class="event-card">
                        <div class="event-time">
                            ${escapeHtml(time)}
                        </div>

                        <div class="event-info">
                            <h3>
                                ${escapeHtml(event.title)}
                            </h3>

                            ${
                                event.description
                                    ? `
                                        <p>
                                            ${escapeHtml(
                                                event.description
                                            )}
                                        </p>
                                    `
                                    : ""
                            }
                        </div>
                    </div>
                `;

            })
            .join("");

}


/* =====================================================
   9. PŘEHLED UDÁLOSTÍ NA DOMOVSKÉ STRÁNCE
====================================================== */

function renderHomeEvents() {

    const todayContainer =
        document.getElementById(
            "todayEvents"
        );

    const upcomingContainer =
        document.getElementById(
            "upcomingEvents"
        );

    if (
        !todayContainer ||
        !upcomingContainer
    ) return;

    const todayString =
        getLocalDateString(new Date());

    const todayEvents =
        events
            .filter(event =>
                event.date === todayString
            )
            .sort((a, b) =>
                (a.time || "23:59")
                    .localeCompare(
                        b.time || "23:59"
                    )
            );

    if (todayEvents.length === 0) {

        todayContainer.innerHTML = `
            <div class="timeline-empty">
                <div class="empty-icon">
                    <i class="fa-regular fa-calendar"></i>
                </div>

                <div>
                    <h3>Zatím nic naplánováno</h3>
                    <p>
                        Užijte si společný čas.
                    </p>
                </div>
            </div>
        `;

    } else {

        todayContainer.innerHTML =
            todayEvents
                .map(event =>
                    createEventCard(event)
                )
                .join("");

    }


    /* Budoucí události */

    const upcomingEvents =
        events
            .filter(event =>
                event.date > todayString
            )
            .sort((a, b) => {

                const dateCompare =
                    a.date.localeCompare(b.date);

                if (dateCompare !== 0) {

                    return dateCompare;

                }

                return (
                    a.time || "23:59"
                ).localeCompare(
                    b.time || "23:59"
                );

            })
            .slice(0, 5);

    if (upcomingEvents.length === 0) {

        upcomingContainer.innerHTML = `
            <div class="upcoming-empty">
                <i class="fa-solid fa-sparkles"></i>
                <span>
                    Budoucnost je zatím volná.
                </span>
            </div>
        `;

    } else {

        upcomingContainer.innerHTML =
            upcomingEvents
                .map(event =>
                    createEventCard(
                        event,
                        true
                    )
                )
                .join("");

    }

}

function createEventCard(
    event,
    showDate = false
) {

    const dateLabel =
        showDate
            ? new Intl.DateTimeFormat(
                "cs-CZ",
                {
                    day: "numeric",
                    month: "short"
                }
            ).format(
                new Date(
                    `${event.date}T12:00:00`
                )
            )
            : event.time || "Celý den";

    return `
        <div class="event-card">
            <div class="event-time">
                ${escapeHtml(dateLabel)}
            </div>

            <div class="event-info">
                <h3>
                    ${escapeHtml(event.title)}
                </h3>

                ${
                    event.description
                        ? `
                            <p>
                                ${escapeHtml(
                                    event.description
                                )}
                            </p>
                        `
                        : ""
                }
            </div>
        </div>
    `;

}


/* =====================================================
   10. ÚKOLY
====================================================== */

function renderTasks() {

    const allTasksContainer =
        document.getElementById(
            "allTasks"
        );

    const previewContainer =
        document.getElementById(
            "taskPreview"
        );

    if (
        !allTasksContainer ||
        !previewContainer
    ) return;

    let filteredTasks =
        [...tasks];

    if (
        currentTaskFilter !== "all"
    ) {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.status ===
                    currentTaskFilter
            );

    }

    if (filteredTasks.length === 0) {

        allTasksContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fa-solid fa-check-double"></i>
                </div>

                <div>
                    <h3>
                        Zatím žádné úkoly
                    </h3>

                    <p>
                        Vypadá to, že máte vše hotovo.
                    </p>
                </div>
            </div>
        `;

    } else {

        allTasksContainer.innerHTML =
            filteredTasks
                .map(task =>
                    createTaskCard(task)
                )
                .join("");

    }


    /* Náhled na hlavní stránce */

    const pendingTasks =
        tasks
            .filter(task =>
                task.status !==
                "completed"
            )
            .slice(0, 4);

    if (pendingTasks.length === 0) {

        previewContainer.innerHTML = `
            <div class="tasks-empty">
                <i class="fa-solid fa-check-double"></i>

                <p>
                    Žádné úkoly. Můžete si užít klid. ❤️
                </p>
            </div>
        `;

    } else {

        previewContainer.innerHTML =
            pendingTasks
                .map(task =>
                    createTaskCard(task)
                )
                .join("");

    }

}

function createTaskCard(task) {

const isCompleted =
    task.status === "completed";

return `
    <div class="task-note ${
        isCompleted ? "completed" : ""
    }">

        <button
            class="task-check"
            data-task-id="${task.id}"
            aria-label="Označit úkol jako hotový"
        >
            <i class="fa-solid fa-check"></i>
        </button>

        <div class="task-note-content">

            <div class="task-note-title">
                ${escapeHtml(task.title)}
            </div>

            ${
                task.description
                    ? `
                        <div class="task-note-description">
                            ${escapeHtml(task.description)}
                        </div>
                    `
                    : ""
            }

        </div>

    </div>
`;

}


/* Filtry úkolů */

document
    .querySelectorAll(".task-filter")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                currentTaskFilter =
                    button.dataset.filter;

                document
                    .querySelectorAll(
                        ".task-filter"
                    )
                    .forEach(filterButton => {

                        filterButton
                            .classList
                            .remove("active");

                    });

                button
                    .classList
                    .add("active");

                renderTasks();

            }
        );

    });


/* Změna stavu úkolu */

document.addEventListener(
    "click",
    event => {

        const checkButton =
            event.target.closest(
                ".task-check"
            );

        if (!checkButton) return;

        const taskId =
            checkButton.dataset.taskId;

        const task =
            tasks.find(
                item =>
                    item.id === taskId
            );

        if (!task) return;

        if (
            task.status ===
            "completed"
        ) {

            task.status = "pending";

        } else {

            task.status =
                "completed";

        }

        saveTasks();

        renderTasks();

    }
);


/* =====================================================
   11. MODÁLNÍ OKNO
====================================================== */

const addModal =
    document.getElementById("addModal");

const floatingAddButton =
    document.getElementById(
        "floatingAddButton"
    );

const closeModalButton =
    document.getElementById(
        "closeModal"
    );

function openAddModal() {

    if (addModal) {

        addModal.classList.remove(
            "hidden"
        );

    }

}

function closeAddModal() {

    if (addModal) {

        addModal.classList.add(
            "hidden"
        );

    }

}

floatingAddButton?.addEventListener(
    "click",
    openAddModal
);

document
    .querySelectorAll(
        '[data-action="add-event"], [data-action="add-task"]'
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const action =
                    button.dataset.action;

                openAddModal();

                if (
                    action === "add-event"
                ) {

                    setTimeout(() => {

                        showEventForm();

                    }, 150);

                }

                if (
                    action === "add-task"
                ) {

                    setTimeout(() => {

                        showTaskForm();

                    }, 150);

                }

            }
        );

    });

closeModalButton?.addEventListener(
    "click",
    closeAddModal
);

addModal
    ?.querySelector(".modal-backdrop")
    ?.addEventListener(
        "click",
        closeAddModal
    );


/* =====================================================
   12. FORMULÁŘ – NOVÁ UDÁLOST
====================================================== */

function showEventForm() {

    const modalContent =
        addModal.querySelector(
            ".modal-content"
        );

    if (!modalContent) return;

    const selectedDateValue =
        getLocalDateString(selectedDate);

    modalContent.innerHTML = `
        <button
            class="close-modal"
            id="dynamicCloseModal"
            aria-label="Zavřít"
        >
            <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="modal-heading">
            <span class="section-label">
                NOVÁ UDÁLOST
            </span>

            <h2>Co nás čeká?</h2>

            <p>
                Přidejte důležitý okamžik
                do rodinného kalendáře.
            </p>
        </div>

        <form
            id="eventForm"
            class="app-form"
        >

            <label>
                Název události

                <input
                    type="text"
                    name="title"
                    placeholder="Např. Návštěva lékaře"
                    required
                >
            </label>

            <label>
                Datum

                <input
                    type="date"
                    name="date"
                    value="${selectedDateValue}"
                    required
                >
            </label>

            <label>
                Čas
                <input
                    type="time"
                    name="time"
                >
            </label>

            <label>
                Poznámka

                <textarea
                    name="description"
                    placeholder="Doplňující informace..."
                    rows="3"
                ></textarea>
            </label>

            <button
                type="submit"
                class="form-submit"
            >
                <i class="fa-solid fa-calendar-plus"></i>
                Přidat do kalendáře
            </button>

        </form>
    `;

    document
        .getElementById(
            "dynamicCloseModal"
        )
        ?.addEventListener(
            "click",
            closeAddModal
        );

    document
        .getElementById("eventForm")
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const formData =
                    new FormData(
                        event.target
                    );

                const title =
                    formData
                        .get("title")
                        .trim();

                if (!title) return;

                events.push({
                    id: createId(),
                    title: title,
                    date: formData.get("date"),
                    time: formData.get("time"),
                    description:
                        formData
                            .get("description")
                            .trim(),
                    createdAt:
                        new Date()
                            .toISOString()
                });

                saveEvents();

                closeAddModal();

                renderCalendar();
                renderHomeEvents();
                renderSelectedDayEvents();

                resetModalContent();

            }
        );

}


/* =====================================================
   13. FORMULÁŘ – NOVÝ ÚKOL
====================================================== */

function showTaskForm() {

    const modalContent =
        addModal.querySelector(
            ".modal-content"
        );

    if (!modalContent) return;

    modalContent.innerHTML = `
        <button
            class="close-modal"
            id="dynamicCloseModal"
            aria-label="Zavřít"
        >
            <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="modal-heading">

            <span class="section-label">
                NOVÝ ÚKOL
            </span>

            <h2>Co je potřeba udělat?</h2>

            <p>
                Každý malý krok pomáhá
                našemu společnému domovu.
            </p>

        </div>

        <form
            id="taskForm"
            class="app-form"
        >

            <label>
                Název úkolu

                <input
                    type="text"
                    name="title"
                    placeholder="Např. Koupit potraviny"
                    required
                >
            </label>

            <label>
                Poznámka

                <textarea
                    name="description"
                    placeholder="Doplňující informace..."
                    rows="3"
                ></textarea>
            </label>

            <label>
                Stav

                <select name="status">

                    <option value="pending">
                        Čeká
                    </option>

                    <option value="progress">
                        Probíhá
                    </option>

                </select>

            </label>

            <button
                type="submit"
                class="form-submit"
            >

                <i class="fa-solid fa-plus"></i>

                Přidat úkol

            </button>

        </form>
    `;

    document
        .getElementById(
            "dynamicCloseModal"
        )
        ?.addEventListener(
            "click",
            closeAddModal
        );

    document
        .getElementById("taskForm")
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const formData =
                    new FormData(
                        event.target
                    );

                const title =
                    formData
                        .get("title")
                        .trim();

                if (!title) return;

                tasks.push({
                    id: createId(),
                    title: title,
                    description:
                        formData
                            .get("description")
                            .trim(),
                    status:
                        formData.get("status"),
                    createdAt:
                        new Date()
                            .toISOString()
                });

                saveTasks();

                closeAddModal();

                renderTasks();

                resetModalContent();

            }
        );

}


/* =====================================================
   14. OBNOVENÍ PŮVODNÍHO OBSAHU MODÁLU
====================================================== */

function resetModalContent() {

    const modalContent =
        addModal?.querySelector(
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
                NOVÝ ZÁZNAM
            </span>

            <h2>Co přidáme?</h2>

            <p>
                Vyberte, co chcete přidat
                do našeho rodinného prostoru.
            </p>

        </div>

        <div class="add-options">

            <button
                id="createEventButton"
                class="add-option"
            >

                <div class="add-option-icon">

                    <i class="fa-regular fa-calendar-plus"></i>

                </div>

                <div class="add-option-text">

                    <h3>Nová událost</h3>

                    <p>
                        Naplánovat důležitý
                        společný okamžik.
                    </p>

                </div>

                <i class="fa-solid fa-arrow-right"></i>

            </button>


            <button
                id="createTaskButton"
                class="add-option"
            >

                <div
                    class="add-option-icon task-icon"
                >

                    <i class="fa-solid fa-list-check"></i>

                </div>

                <div class="add-option-text">

                    <h3>Nový úkol</h3>

                    <p>
                        Přidat něco, co je
                        potřeba udělat.
                    </p>

                </div>

                <i class="fa-solid fa-arrow-right"></i>

            </button>

        </div>
    `;

    document
        .getElementById("closeModal")
        ?.addEventListener(
            "click",
            closeAddModal
        );

    document
        .getElementById(
            "createEventButton"
        )
        ?.addEventListener(
            "click",
            showEventForm
        );

    document
        .getElementById(
            "createTaskButton"
        )
        ?.addEventListener(
            "click",
            showTaskForm
        );

}


/* =====================================================
   15. TLAČÍTKA V PŮVODNÍM MODÁLU
====================================================== */

document
    .getElementById(
        "createEventButton"
    )
    ?.addEventListener(
        "click",
        showEventForm
    );

document
    .getElementById(
        "createTaskButton"
    )
    ?.addEventListener(
        "click",
        showTaskForm
    );


/* =====================================================
   16. NOTIFIKACE – PŘÍPRAVA
====================================================== */

const notificationButton =
    document.getElementById(
        "notificationButton"
    );

notificationButton?.addEventListener(
    "click",
    () => {

        if (
            "Notification" in window
        ) {

            if (
                Notification.permission ===
                "default"
            ) {

                Notification
                    .requestPermission();

            } else if (
                Notification.permission ===
                "granted"
            ) {

                new Notification(
                    "Malátovi",
                    {
                        body:
                            "Notifikace budou brzy propojeny se společným kalendářem."
                    }
                );

            }

        } else {

            alert(
                "Váš prohlížeč nepodporuje notifikace."
            );

        }

    }
);


/* =====================================================
   17. PRVNÍ VYKRESLENÍ APLIKACE
====================================================== */

updateCurrentDate();

renderCalendar();

renderSelectedDayEvents();

renderHomeEvents();

renderTasks();

resetModalContent();

});
