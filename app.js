document.addEventListener("DOMContentLoaded", () => {

/* ========================================
   NAŠE DOMÁCNOST – HLAVNÍ JAVASCRIPT
======================================== */


// ========================================
// 1. AKTUÁLNÍ DATUM
// ========================================

const currentDateElement = document.getElementById("currentDate");
const today = new Date();

if (currentDateElement) {
    currentDateElement.textContent = today.toLocaleDateString("cs-CZ", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// ========================================
// 2. RODINNÉ CITÁTY
// ========================================

const quotes = [
    "Rodina je místo, kde začíná život a nikdy nekončí láska.",
    "Domov není místo. Domov jsou lidé, které máme rádi.",
    "Společné chvíle jsou ty nejcennější vzpomínky.",
    "Rodina je přístav, kam se můžeme vždy vrátit.",
    "Nejdůležitější věci v životě nejsou věci, ale lidé, se kterými je sdílíme.",
    "Šťastná rodina je malý svět plný velké lásky.",
    "Tam, kde je rodina, je i domov.",
    "Každý společný den je malou kapitolou našeho příběhu.",
    "Největší bohatství člověka jsou lidé, kteří stojí po jeho boku.",
    "Láska rodiny je jedním z nejkrásnějších darů života.",
    "Domov je tam, kde se o sebe navzájem staráme."
];

const familyQuote = document.getElementById("familyQuote");

// Jeden citát se zobrazí podle aktuálního dne.
// Díky tomu se během dne nemění při každém otevření aplikace.
const startOfYear = new Date(today.getFullYear(), 0, 0);
const dayNumber = Math.floor(
    (today - startOfYear) / (1000 * 60 * 60 * 24)
);

if (familyQuote) {
    familyQuote.textContent =
        "„" + quotes[dayNumber % quotes.length] + "“";
}


// ========================================
// 3. NAVIGACE MEZI SEKCE
// ========================================

const navigationButtons = document.querySelectorAll(
    ".nav-item, .bottom-nav-item"
);

const contentSections = document.querySelectorAll(".content-section");

function openSection(sectionId) {

    contentSections.forEach(section => {
        section.classList.remove("active");
    });

    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active");
    }

    // Aktivní tlačítko v horním i spodním menu
    navigationButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.section === sectionId
        );
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

navigationButtons.forEach(button => {
    button.addEventListener("click", () => {
        openSection(button.dataset.section);
    });
});


// Tlačítka, která otevřou jinou sekci
document.querySelectorAll("[data-section-target]").forEach(button => {
    button.addEventListener("click", () => {
        openSection(button.dataset.sectionTarget);
    });
});


// ========================================
// 4. KALENDÁŘ
// ========================================

const calendarMonthElement =
    document.getElementById("calendarMonth");

const calendarDaysElement =
    document.getElementById("calendarDays");

const selectedDayTitle =
    document.getElementById("selectedDayTitle");

const selectedDayEvents =
    document.getElementById("selectedDayEvents");

let calendarDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
);

let selectedDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
);


// Ukázkové události.
// Později budou nahrazeny skutečnými daty ze Supabase.
const events = [];


function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function renderCalendar() {

    if (!calendarDaysElement) return;

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const monthName = new Date(year, month, 1)
        .toLocaleDateString("cs-CZ", {
            month: "long",
            year: "numeric"
        });

    if (calendarMonthElement) {
        calendarMonthElement.textContent =
            monthName.charAt(0).toUpperCase() +
            monthName.slice(1);
    }

    calendarDaysElement.innerHTML = "";

    // Pondělí = první den týdne
    const firstDay = new Date(year, month, 1);
    let firstWeekday = firstDay.getDay() - 1;

    if (firstWeekday < 0) {
        firstWeekday = 6;
    }

    // Prázdná místa před prvním dnem
    for (let i = 0; i < firstWeekday; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.classList.add("calendar-empty-day");
        calendarDaysElement.appendChild(emptyDay);
    }

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {

        const dayDate = new Date(year, month, day);

        const dayButton = document.createElement("button");

        dayButton.type = "button";
        dayButton.classList.add("calendar-day");
        dayButton.textContent = day;

        const dayKey = formatDateKey(dayDate);

        // Je dnes?
        if (
            dayDate.getFullYear() === today.getFullYear() &&
            dayDate.getMonth() === today.getMonth() &&
            day === today.getDate()
        ) {
            dayButton.classList.add("today");
        }

        // Je vybraný?
        if (
            dayKey === formatDateKey(selectedDate)
        ) {
            dayButton.classList.add("selected");
        }

        // Má událost?
        const hasEvent = events.some(event => {
            return event.date === dayKey;
        });

        if (hasEvent) {
            dayButton.classList.add("has-event");
        }

        dayButton.addEventListener("click", () => {

            selectedDate = dayDate;

            renderCalendar();
            renderSelectedDayEvents();

        });

        calendarDaysElement.appendChild(dayButton);
    }

}


function renderSelectedDayEvents() {

    if (!selectedDayEvents) return;

    const dateKey = formatDateKey(selectedDate);

    const dayEvents = events.filter(event => {
        return event.date === dateKey;
    });

    if (selectedDayTitle) {
        selectedDayTitle.textContent =
            selectedDate.toLocaleDateString("cs-CZ", {
                weekday: "long",
                day: "numeric",
                month: "long"
            });
    }

    selectedDayEvents.innerHTML = "";

    if (dayEvents.length === 0) {

        selectedDayEvents.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-calendar"></i>
                <p>Pro tento den zatím nemáte žádnou událost.</p>
            </div>
        `;

        return;
    }

    dayEvents.forEach(event => {

        const eventElement =
            document.createElement("article");

        eventElement.className = "event-card";

        eventElement.innerHTML = `
            <div class="event-date-icon">
                <span class="event-time">
                    ${event.time || "Celý den"}
                </span>
            </div>

            <div class="event-info">
                <h3>${event.title}</h3>
                <p>${event.description || ""}</p>
            </div>
        `;

        selectedDayEvents.appendChild(eventElement);

    });

}


// Přepínání měsíců

const previousMonthButton =
    document.getElementById("previousMonth");

const nextMonthButton =
    document.getElementById("nextMonth");

if (previousMonthButton) {
    previousMonthButton.addEventListener("click", () => {

        calendarDate.setMonth(
            calendarDate.getMonth() - 1
        );

        renderCalendar();

    });
}

if (nextMonthButton) {
    nextMonthButton.addEventListener("click", () => {

        calendarDate.setMonth(
            calendarDate.getMonth() + 1
        );

        renderCalendar();

    });
}


// ========================================
// 5. MODÁLNÍ OKNO PRO PŘIDÁNÍ
// ========================================

const addModal = document.getElementById("addModal");

const closeModalButton =
    document.getElementById("closeModal");

const floatingAddButton =
    document.getElementById("floatingAddButton");


function openAddModal() {
    if (addModal) {
        addModal.classList.remove("hidden");
    }
}


function closeAddModal() {
    if (addModal) {
        addModal.classList.add("hidden");
    }
}


// Všechna tlačítka Přidat
document.querySelectorAll("[data-action]").forEach(button => {

    button.addEventListener("click", () => {

        const action = button.dataset.action;

        // Zatím otevřeme výběr.
        // Později se podle action otevře přímo formulář.
        if (
            action === "add-event" ||
            action === "add-task"
        ) {
            openAddModal();
        }

    });

});


if (floatingAddButton) {
    floatingAddButton.addEventListener(
        "click",
        openAddModal
    );
}


if (closeModalButton) {
    closeModalButton.addEventListener(
        "click",
        closeAddModal
    );
}


// Kliknutí mimo okno
const modalBackdrop =
    document.querySelector(".modal-backdrop");

if (modalBackdrop) {
    modalBackdrop.addEventListener(
        "click",
        closeAddModal
    );
}


// Klávesa Escape
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeAddModal();
    }
});


// ========================================
// 6. ODKLIKÁVÁNÍ UKÁZKOVÝCH ÚKOLŮ
// ========================================

document.querySelectorAll(
    ".task-preview .task-item input"
).forEach(checkbox => {

    checkbox.addEventListener("change", () => {

        const taskItem =
            checkbox.closest(".task-item");

        if (taskItem) {
            taskItem.classList.toggle(
                "completed",
                checkbox.checked
            );
        }

    });

});


// ========================================
// 7. TLAČÍTKA VE VÝBĚRU
// ========================================

const createEventButton =
    document.getElementById("createEventButton");

const createTaskButton =
    document.getElementById("createTaskButton");


if (createEventButton) {
    createEventButton.addEventListener("click", () => {

        alert(
            "Formulář pro vytvoření události přidáme v dalším kroku."
        );

    });
}


if (createTaskButton) {
    createTaskButton.addEventListener("click", () => {

        alert(
            "Formulář pro vytvoření úkolu přidáme v dalším kroku."
        );

    });
}


// ========================================
// 8. PRVNÍ VYKRESLENÍ APLIKACE
// ========================================

renderCalendar();
renderSelectedDayEvents();

});
