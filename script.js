const STORAGE_KEY = "studentActivityTrackerLevel2";
const THEME_KEY = "studentActivityTrackerTheme";
const PROFILE_KEY = "studentActivityTrackerProfile";

const sampleActivities = [
    {
        id: 1,
        title: "Tamil",
        description: "Read the prose lesson, revise key grammar points, and complete the written exercise.",
        completed: false,
        priority: false,
        notes: ""
    },
    {
        id: 2,
        title: "English",
        description: "Practice comprehension, note difficult vocabulary, and prepare a short summary.",
        completed: true,
        priority: false,
        notes: ""
    },
    {
        id: 3,
        title: "Mathematics",
        description: "Work through algebra problems and recheck the steps for accuracy.",
        completed: false,
        priority: true,
        notes: ""
    },
    {
        id: 4,
        title: "Science",
        description: "Revise the current chapter concepts and complete the diagram-based questions.",
        completed: false,
        priority: false,
        notes: ""
    },
    {
        id: 5,
        title: "Social Sciences",
        description: "Review important dates, map work, and answer the short questions from the chapter.",
        completed: false,
        priority: false,
        notes: ""
    }
];

const legacySampleTitles = [
    "HTML Structure Practice",
    "CSS Styling Exercise",
    "JavaScript DOM Task",
    "Local Storage Practice"
];

const defaultProfile = {
    studentName: "",
    studentClass: "",
    department: "",
    schoolCollegeName: "",
    universityName: "",
    academicYear: "",
    semester: "",
    phoneNumber: "",
    emailAddress: "",
    profileNotes: ""
};

let activities = loadActivities();
let studentProfile = loadProfile();
let swRegistration = null;
let isRefreshing = false;
let activeDetailActivityId = null;

function setComposerExpanded(isExpanded) {
    const toggleButton = document.getElementById("activityComposerToggle");
    const composerPanel = document.getElementById("activityComposerPanel");
    const titleInput = document.getElementById("activityTitle");

    if (!toggleButton || !composerPanel) {
        return;
    }

    composerPanel.hidden = !isExpanded;
    toggleButton.setAttribute("aria-expanded", String(isExpanded));

    if (isExpanded && titleInput) {
        window.setTimeout(() => {
            titleInput.focus();
        }, 50);
    }
}

function cloneActivities(activityArray) {
    return activityArray.map((activity) => ({ ...activity }));
}

function normalizeActivity(activity, index = 0) {
    return {
        id: typeof activity.id === "number" ? activity.id : Date.now() + index,
        title: String(activity.title ?? "").trim(),
        description: String(activity.description ?? "").trim(),
        completed: Boolean(activity.completed),
        priority: Boolean(activity.priority),
        notes: String(activity.notes ?? "")
    };
}

function getSortedActivities(activityArray = activities) {
    return [...activityArray].sort((left, right) => {
        if (left.completed !== right.completed) {
            return Number(left.completed) - Number(right.completed);
        }

        if (!left.completed && left.priority !== right.priority) {
            return Number(right.priority) - Number(left.priority);
        }

        return left.id - right.id;
    });
}

function loadActivities() {
    const savedActivities = localStorage.getItem(STORAGE_KEY);

    if (!savedActivities) {
        const defaults = cloneActivities(sampleActivities);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        return defaults;
    }

    try {
        const parsedActivities = JSON.parse(savedActivities);

        if (!Array.isArray(parsedActivities)) {
            throw new Error("Saved data is not an array.");
        }

        const parsedTitles = parsedActivities.map((activity) => String(activity.title ?? "").trim());
        const isLegacySampleData = parsedTitles.length === legacySampleTitles.length
            && legacySampleTitles.every((title, index) => parsedTitles[index] === title);

        if (isLegacySampleData) {
            const defaults = cloneActivities(sampleActivities);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
            return defaults;
        }

        return parsedActivities
            .map((activity, index) => normalizeActivity(activity, index))
            .filter((activity) => activity.title && activity.description);
    } catch (error) {
        const defaults = cloneActivities(sampleActivities);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        return defaults;
    }
}

function loadProfile() {
    const savedProfile = localStorage.getItem(PROFILE_KEY);

    if (!savedProfile) {
        return { ...defaultProfile };
    }

    try {
        const parsedProfile = JSON.parse(savedProfile);

        return {
            studentName: String(parsedProfile.studentName ?? ""),
            studentClass: String(parsedProfile.studentClass ?? ""),
            department: String(parsedProfile.department ?? ""),
            schoolCollegeName: String(parsedProfile.schoolCollegeName ?? ""),
            universityName: String(parsedProfile.universityName ?? ""),
            academicYear: String(parsedProfile.academicYear ?? ""),
            semester: String(parsedProfile.semester ?? ""),
            phoneNumber: String(parsedProfile.phoneNumber ?? ""),
            emailAddress: String(parsedProfile.emailAddress ?? ""),
            profileNotes: String(parsedProfile.profileNotes ?? "")
        };
    } catch (error) {
        return { ...defaultProfile };
    }
}

function saveActivities() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

function saveProfile() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(studentProfile));
}

function findActivityById(activityId) {
    return activities.find((activity) => activity.id === activityId) ?? null;
}

function countCompletedActivities() {
    return activities.filter((activity) => activity.completed).length;
}

function getProgressSummary() {
    const totalActivities = activities.length;
    const completedActivities = countCompletedActivities();

    return {
        totalActivities,
        completedActivities,
        pendingActivities: totalActivities - completedActivities
    };
}

function updateProgress() {
    const { totalActivities, completedActivities, pendingActivities } = getProgressSummary();
    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");
    const progressHeading = document.getElementById("progressHeading");
    const totalCount = document.getElementById("totalCount");
    const completedCount = document.getElementById("completedCount");
    const pendingCount = document.getElementById("pendingCount");
    const dashboardSummary = document.getElementById("dashboardSummary");
    const dashboardPercent = document.getElementById("dashboardPercent");
    const dashboardHeadline = document.getElementById("dashboardHeadline");
    const dashboardMessage = document.getElementById("dashboardMessage");
    const progressRing = document.querySelector(".progress-ring");

    const percentComplete = totalActivities === 0
        ? 0
        : Math.round((completedActivities / totalActivities) * 100);

    if (progressText) {
        progressText.textContent = `${completedActivities} out of ${totalActivities} activities completed`;
    }

    if (progressHeading) {
        progressHeading.textContent = totalActivities === 0
            ? "Add your first activity"
            : completedActivities === totalActivities
                ? "All activities completed"
                : "Track your completion";
    }

    if (progressFill) {
        progressFill.style.width = `${percentComplete}%`;
    }

    if (totalCount) {
        totalCount.textContent = String(totalActivities);
    }

    if (completedCount) {
        completedCount.textContent = String(completedActivities);
    }

    if (pendingCount) {
        pendingCount.textContent = String(pendingActivities);
    }

    if (dashboardSummary) {
        dashboardSummary.textContent = `${completedActivities} out of ${totalActivities} activities completed`;
    }

    if (dashboardPercent) {
        dashboardPercent.textContent = `${percentComplete}%`;
    }

    if (progressRing) {
        const degrees = Math.round((percentComplete / 100) * 360);
        progressRing.style.background = `conic-gradient(var(--accent) ${degrees}deg, rgba(15, 157, 122, 0.14) ${degrees}deg)`;
    }

    if (dashboardHeadline && dashboardMessage) {
        if (totalActivities === 0) {
            dashboardHeadline.textContent = "No activities available yet";
            dashboardMessage.textContent = "Go to the activity page and add a few tasks to start tracking progress.";
        } else if (completedActivities === totalActivities) {
            dashboardHeadline.textContent = "Every activity is completed";
            dashboardMessage.textContent = "Excellent work. Your tracker shows that all current activities are done.";
        } else {
            dashboardHeadline.textContent = "Keep moving through your activities";
            dashboardMessage.textContent = `${pendingActivities} ${pendingActivities === 1 ? "Activity" : "Activities"} still pending.`;
        }
    }
}

function animateListReorder(activityList, previousPositions) {
    const updatedCards = activityList.querySelectorAll(".activity-item");

    updatedCards.forEach((card) => {
        const previousBox = previousPositions.get(card.dataset.id);

        if (!previousBox) {
            return;
        }

        const currentBox = card.getBoundingClientRect();
        const deltaY = previousBox.top - currentBox.top;

        if (Math.abs(deltaY) < 1) {
            return;
        }

        card.classList.add("moving");
        card.animate(
            [
                { transform: `translateY(${deltaY}px)` },
                { transform: "translateY(0)" }
            ],
            {
                duration: 320,
                easing: "ease"
            }
        );

        window.setTimeout(() => {
            card.classList.remove("moving");
        }, 320);
    });
}

function renderActivities(options = {}) {
    const activityList = document.getElementById("activityList");
    const emptyState = document.getElementById("emptyState");
    const previousPositions = options.animate && activityList
        ? new Map(
            [...activityList.querySelectorAll(".activity-item")]
                .map((card) => [card.dataset.id, card.getBoundingClientRect()])
        )
        : new Map();

    if (!activityList) {
        updateProgress();
        return;
    }

    activityList.innerHTML = "";

    if (activities.length === 0) {
        emptyState.hidden = false;
        emptyState.textContent = "No activities available. Add a new activity or reset the sample data.";
        updateProgress();
        return;
    }

    emptyState.hidden = true;

    getSortedActivities().forEach((activity) => {
        const activityCard = document.createElement("article");
        activityCard.className = `activity-item activity-clickable${activity.completed ? " completed-activity" : ""}`;
        activityCard.dataset.id = String(activity.id);

        const currentStatus = activity.completed ? "Completed" : "Pending";
        const toggleLabel = activity.completed ? "Mark as Pending" : "Mark as Completed";
        const priorityBadge = activity.priority && !activity.completed
            ? '<span class="status-badge priority">Priority</span>'
            : "";
        const priorityLabel = activity.priority ? "Priority On" : "Set Priority";
        const notesPreview = activity.notes.trim()
            ? escapeHtml(activity.notes.trim().slice(0, 140))
            : "Open to add study details, syllabus, question banks, or materials.";

        activityCard.innerHTML = `
            <div class="activity-top">
                <div>
                    <h3 class="activity-title">${escapeHtml(activity.title)}</h3>
                    <p class="activity-description">${escapeHtml(activity.description)}</p>
                </div>
                <div class="status-group">
                    ${priorityBadge}
                    <span class="status-badge ${activity.completed ? "completed" : "pending"}">${currentStatus}</span>
                </div>
            </div>
            <div class="activity-notes-preview">${notesPreview}</div>
            <div class="activity-actions">
                <button class="secondary-button" type="button" data-action="priority" data-id="${activity.id}">
                    ${priorityLabel}
                </button>
                <button class="toggle-button" type="button" data-action="toggle" data-id="${activity.id}">${toggleLabel}</button>
                <button class="secondary-button" type="button" data-action="edit" data-id="${activity.id}">Edit</button>
                <button class="delete-button" type="button" data-action="delete" data-id="${activity.id}">Delete</button>
            </div>
        `;

        activityList.appendChild(activityCard);
    });

    if (options.animate) {
        animateListReorder(activityList, previousPositions);
    }

    updateProgress();
}

function toggleActivityCompletion(activityId) {
    activities = activities.map((activity) => {
        if (activity.id === activityId) {
            return {
                ...activity,
                completed: !activity.completed
            };
        }

        return activity;
    });

    saveActivities();
    renderActivities({ animate: true });
}

function toggleActivityPriority(activityId) {
    activities = activities.map((activity) => {
        if (activity.id === activityId) {
            return {
                ...activity,
                priority: !activity.priority
            };
        }

        return activity;
    });

    saveActivities();
    renderActivities({ animate: true });
}

function addActivity(title, description, priority) {
    const highestId = activities.reduce((maxId, activity) => Math.max(maxId, activity.id), 0);
    const newActivity = {
        id: highestId + 1,
        title,
        description,
        completed: false,
        priority,
        notes: ""
    };

    activities = [...activities, newActivity];
    saveActivities();
    renderActivities({ animate: true });
}

function updateActivity(activityId, updates) {
    activities = activities.map((activity) => {
        if (activity.id !== activityId) {
            return activity;
        }

        return normalizeActivity({
            ...activity,
            ...updates,
            id: activity.id
        });
    });

    saveActivities();
}

function deleteActivity(activityId) {
    activities = activities.filter((activity) => activity.id !== activityId);
    saveActivities();
    renderActivities({ animate: true });
}

function resetSampleData() {
    activities = cloneActivities(sampleActivities);
    saveActivities();
    renderActivities();
}

function clearAllActivities() {
    activities = [];
    saveActivities();
    renderActivities();
}

function buildActivityContext(activity) {
    const contextParts = [
        activity.title,
        activity.description,
        studentProfile.department && `department ${studentProfile.department}`,
        studentProfile.studentClass && `class ${studentProfile.studentClass}`,
        studentProfile.universityName && `university ${studentProfile.universityName}`,
        studentProfile.schoolCollegeName && `college ${studentProfile.schoolCollegeName}`,
        studentProfile.academicYear && `academic year ${studentProfile.academicYear}`,
        studentProfile.semester && `semester ${studentProfile.semester}`,
        activity.notes.trim() && `syllabus ${activity.notes.trim()}`
    ].filter(Boolean);

    return [
        "\"study material\"",
        "\"question bank\"",
        "\"notes\"",
        ...contextParts
    ].join(" ");
}

function buildChatGptPrompt(activity) {
    const promptSections = [
        `Act as a world-class professor, senior examiner, and last-minute exam strategist for "${activity.title}".`,
        `The student is behind in studies, has limited time, and needs the highest possible exam score in the shortest realistic preparation time.`,
        `Topic: ${activity.title}.`,
        `Activity description: ${activity.description}.`
    ];

    if (studentProfile.universityName) {
        promptSections.push(`University: ${studentProfile.universityName}.`);
    }

    if (studentProfile.schoolCollegeName) {
        promptSections.push(`Institution: ${studentProfile.schoolCollegeName}.`);
    }

    if (studentProfile.department) {
        promptSections.push(`Department: ${studentProfile.department}.`);
    }

    if (studentProfile.studentClass) {
        promptSections.push(`Class: ${studentProfile.studentClass}.`);
    }

    if (studentProfile.academicYear) {
        promptSections.push(`Academic year: ${studentProfile.academicYear}.`);
    }

    if (studentProfile.semester) {
        promptSections.push(`Semester: ${studentProfile.semester}.`);
    }

    if (activity.notes.trim()) {
        promptSections.push(`Detailed syllabus / study material / notes provided by the student: ${activity.notes.trim()}.`);
    }

    if (studentProfile.profileNotes.trim()) {
        promptSections.push(`Student profile notes: ${studentProfile.profileNotes.trim()}.`);
    }

    promptSections.push("Your job is to help the student pass the upcoming examinations with limited preparation time.");
    promptSections.push("Prioritize the most important and high-scoring topics first.");
    promptSections.push("Identify likely repeated questions and patterns based on previous 3 years question papers whenever possible.");
    promptSections.push("Filter out low-value content and focus on exam-relevant material only.");
    promptSections.push("Prepare very short but strong answers, 2-mark answers, 5-mark answers, 10-mark answers, and high-value long answers where appropriate.");
    promptSections.push("Give compact revision notes, key definitions, formulas, core concepts, important derivations or explanations, and memory tricks.");
    promptSections.push("Highlight the minimum preparation strategy needed to pass safely, then the best extra topics to score higher.");
    promptSections.push("If the syllabus appears broad, rank the units or subtopics by exam importance and return the most probable questions first.");
    promptSections.push("Make the output practical, crisp, and directly usable for last-minute study.");
    promptSections.push("Where useful, include: 1. Must-study topics 2. Repeated/high-probability questions 3. Best possible short answers 4. High-value long answers 5. Final revision checklist.");

    return promptSections.join(" ");
}

function updateDetailLinks(activity) {
    const googleSearchButton = document.getElementById("googleSearchButton");
    const chatgptButton = document.getElementById("chatgptButton");

    if (!googleSearchButton || !chatgptButton) {
        return;
    }

    const googleQuery = encodeURIComponent(buildActivityContext(activity));
    const chatPrompt = encodeURIComponent(buildChatGptPrompt(activity));

    googleSearchButton.href = `https://www.google.com/search?q=${googleQuery}`;
    chatgptButton.href = `https://chatgpt.com/?q=${chatPrompt}`;
}

function openActivityDetail(activityId) {
    const activity = findActivityById(activityId);
    const detailDialog = document.getElementById("activityDetailDialog");

    if (!activity || !detailDialog) {
        return;
    }

    activeDetailActivityId = activityId;
    document.getElementById("detailTitle").textContent = activity.title;
    document.getElementById("detailDescription").textContent = activity.description;
    document.getElementById("activityNotes").value = activity.notes;

    const statusBadge = document.getElementById("detailStatusBadge");
    const priorityBadge = document.getElementById("detailPriorityBadge");

    statusBadge.textContent = activity.completed ? "Completed" : "Pending";
    statusBadge.className = `status-badge ${activity.completed ? "completed" : "pending"}`;
    priorityBadge.hidden = !activity.priority;

    updateDetailLinks(activity);
    detailDialog.showModal();
}

function closeActivityDetail() {
    const detailDialog = document.getElementById("activityDetailDialog");

    if (detailDialog) {
        detailDialog.close();
    }
}

function saveActivityNotes() {
    if (activeDetailActivityId === null) {
        return;
    }

    const notesInput = document.getElementById("activityNotes");
    const activity = findActivityById(activeDetailActivityId);

    if (!notesInput || !activity) {
        return;
    }

    updateActivity(activeDetailActivityId, {
        notes: notesInput.value
    });

    const updatedActivity = findActivityById(activeDetailActivityId);

    if (updatedActivity) {
        updateDetailLinks(updatedActivity);
    }

    renderActivities();
    alert("Study details saved.");
}

function openEditDialog(activityId) {
    const activity = findActivityById(activityId);
    const editDialog = document.getElementById("editActivityDialog");

    if (!activity || !editDialog) {
        return;
    }

    document.getElementById("editActivityId").value = String(activity.id);
    document.getElementById("editActivityTitle").value = activity.title;
    document.getElementById("editActivityDescription").value = activity.description;
    document.getElementById("editActivityPriority").checked = activity.priority;
    editDialog.showModal();
}

function closeEditDialog() {
    const editDialog = document.getElementById("editActivityDialog");

    if (editDialog) {
        editDialog.close();
    }
}

function setupActivityDialogs() {
    const detailDialog = document.getElementById("activityDetailDialog");
    const saveNotesButton = document.getElementById("saveNotesButton");
    const closeDetailButton = document.getElementById("closeDetailButton");
    const openEditButton = document.getElementById("openEditButton");
    const editActivityForm = document.getElementById("editActivityForm");
    const closeEditButton = document.getElementById("closeEditButton");

    if (!detailDialog) {
        return;
    }

    saveNotesButton?.addEventListener("click", saveActivityNotes);
    closeDetailButton?.addEventListener("click", closeActivityDetail);

    openEditButton?.addEventListener("click", () => {
        if (activeDetailActivityId !== null) {
            openEditDialog(activeDetailActivityId);
        }
    });

    closeEditButton?.addEventListener("click", closeEditDialog);

    editActivityForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const activityId = Number(document.getElementById("editActivityId").value);
        const title = document.getElementById("editActivityTitle").value.trim();
        const description = document.getElementById("editActivityDescription").value.trim();
        const priority = document.getElementById("editActivityPriority").checked;

        if (!title || !description) {
            return;
        }

        updateActivity(activityId, { title, description, priority });
        renderActivities();

        if (activeDetailActivityId === activityId) {
            closeEditDialog();
            openActivityDetail(activityId);
        } else {
            closeEditDialog();
        }
    });
}

function setupActivityForm() {
    const activityForm = document.getElementById("activityForm");
    const composerToggle = document.getElementById("activityComposerToggle");

    if (composerToggle) {
        composerToggle.addEventListener("click", () => {
            const isExpanded = composerToggle.getAttribute("aria-expanded") === "true";
            setComposerExpanded(!isExpanded);
        });
    }

    if (!activityForm) {
        return;
    }

    activityForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const titleInput = document.getElementById("activityTitle");
        const descriptionInput = document.getElementById("activityDescription");
        const priorityInput = document.getElementById("activityPriority");
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const priority = Boolean(priorityInput?.checked);

        if (!title || !description) {
            return;
        }

        addActivity(title, description, priority);
        activityForm.reset();
        setComposerExpanded(false);
    });
}

function setupActionButtons() {
    const activityList = document.getElementById("activityList");
    const resetButton = document.getElementById("resetButton");
    const clearButton = document.getElementById("clearButton");

    if (activityList) {
        activityList.addEventListener("click", (event) => {
            const clickedButton = event.target.closest("button");
            const clickedCard = event.target.closest(".activity-item");

            if (clickedButton) {
                const action = clickedButton.dataset.action;
                const activityId = Number(clickedButton.dataset.id);

                if (action === "toggle") {
                    toggleActivityCompletion(activityId);
                }

                if (action === "priority") {
                    toggleActivityPriority(activityId);
                }

                if (action === "edit") {
                    openEditDialog(activityId);
                }

                if (action === "delete") {
                    deleteActivity(activityId);
                }

                return;
            }

            if (clickedCard) {
                openActivityDetail(Number(clickedCard.dataset.id));
            }
        });
    }

    if (resetButton) {
        resetButton.addEventListener("click", resetSampleData);
    }

    if (clearButton) {
        clearButton.addEventListener("click", clearAllActivities);
    }
}

function populateProfileForm() {
    const profileForm = document.getElementById("profileForm");

    if (!profileForm) {
        return;
    }

    Object.entries(studentProfile).forEach(([key, value]) => {
        const field = document.getElementById(key);

        if (field) {
            field.value = value;
        }
    });
}

function setupProfileForm() {
    const profileForm = document.getElementById("profileForm");

    if (!profileForm) {
        return;
    }

    populateProfileForm();

    profileForm.addEventListener("submit", (event) => {
        event.preventDefault();

        studentProfile = {
            studentName: document.getElementById("studentName").value.trim(),
            studentClass: document.getElementById("studentClass").value.trim(),
            department: document.getElementById("department").value.trim(),
            schoolCollegeName: document.getElementById("schoolCollegeName").value.trim(),
            universityName: document.getElementById("universityName").value.trim(),
            academicYear: document.getElementById("academicYear").value.trim(),
            semester: document.getElementById("semester").value.trim(),
            phoneNumber: document.getElementById("phoneNumber").value.trim(),
            emailAddress: document.getElementById("emailAddress").value.trim(),
            profileNotes: document.getElementById("profileNotes").value.trim()
        };

        saveProfile();
        alert("Profile saved.");
    });
}

function applyTheme(theme) {
    document.body.classList.toggle("dark-mode", theme === "dark");
}

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === "dark" || savedTheme === "light") {
        applyTheme(savedTheme);
    }
}

function toggleDarkMode() {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    alert(`Dark mode ${nextTheme === "dark" ? "enabled" : "disabled"}.`);
}

function exportBackup() {
    const payload = {
        exportedAt: new Date().toISOString(),
        activities,
        studentProfile
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "activity-tracker-backup.json";
    link.click();
    URL.revokeObjectURL(url);
}

function importBackup(file) {
    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
        try {
            const parsed = JSON.parse(String(reader.result ?? ""));
            const importedActivities = Array.isArray(parsed)
                ? parsed
                : Array.isArray(parsed.activities)
                    ? parsed.activities
                    : null;

            if (!importedActivities) {
                throw new Error("Invalid backup file.");
            }

            activities = importedActivities
                .map((activity, index) => normalizeActivity(activity, index))
                .filter((activity) => activity.title && activity.description);

            if (parsed.studentProfile && typeof parsed.studentProfile === "object") {
                studentProfile = {
                    ...defaultProfile,
                    ...parsed.studentProfile
                };
                saveProfile();
                populateProfileForm();
            }

            saveActivities();
            renderActivities();
            alert("Backup imported successfully.");
        } catch (error) {
            alert("Unable to import that backup file.");
        }
    });

    reader.readAsText(file);
}

function openAboutDialog() {
    const aboutDialog = document.getElementById("aboutDialog");

    if (aboutDialog) {
        aboutDialog.showModal();
    }
}

function closeAboutDialog() {
    const aboutDialog = document.getElementById("aboutDialog");

    if (aboutDialog) {
        aboutDialog.close();
    }
}

function setupMenu() {
    const menuButton = document.getElementById("menuButton");
    const appMenu = document.getElementById("appMenu");
    const importInput = document.getElementById("importInput");
    const closeAboutButton = document.getElementById("closeAboutButton");

    if (!menuButton || !appMenu) {
        return;
    }

    function closeMenu() {
        appMenu.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
        appMenu.hidden = false;
        menuButton.setAttribute("aria-expanded", "true");
    }

    menuButton.addEventListener("click", () => {
        if (appMenu.hidden) {
            openMenu();
        } else {
            closeMenu();
        }
    });

    appMenu.addEventListener("click", (event) => {
        const clickedButton = event.target.closest("button[data-menu-action]");

        if (!clickedButton) {
            return;
        }

        const action = clickedButton.dataset.menuAction;
        closeMenu();

        if (action === "profile") {
            window.location.href = "profile.html";
        }

        if (action === "updates") {
            checkForUpdates();
        }

        if (action === "backup") {
            exportBackup();
        }

        if (action === "import") {
            importInput.click();
        }

        if (action === "dark-mode") {
            toggleDarkMode();
        }

        if (action === "about") {
            openAboutDialog();
        }
    });

    importInput.addEventListener("change", (event) => {
        const selectedFile = event.target.files?.[0];
        importBackup(selectedFile);
        importInput.value = "";
    });

    if (closeAboutButton) {
        closeAboutButton.addEventListener("click", closeAboutDialog);
    }

    document.addEventListener("click", (event) => {
        const target = event.target;

        if (!(target instanceof Node)) {
            return;
        }

        if (!menuButton.contains(target) && !appMenu.contains(target)) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
}

function escapeHtml(text) {
    const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    };

    return String(text).replace(/[&<>"']/g, (character) => replacements[character]);
}

async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        return;
    }

    try {
        swRegistration = await navigator.serviceWorker.register("sw.js");

        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (isRefreshing) {
                return;
            }

            isRefreshing = true;
            window.location.reload();
        });
    } catch (error) {
        console.error("Service worker registration failed:", error);
    }
}

async function checkForUpdates() {
    if (!swRegistration) {
        alert("Update check is not available right now.");
        return;
    }

    if (swRegistration.waiting) {
        swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
        alert("New version found. Reloading...");
        return;
    }

    await swRegistration.update();

    window.setTimeout(() => {
        if (swRegistration.waiting) {
            swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
            alert("New version found. Reloading...");
        } else {
            alert("You already have the latest version.");
        }
    }, 700);
}

function initializeApp() {
    loadTheme();
    setupActivityForm();
    setupActionButtons();
    setupActivityDialogs();
    setupProfileForm();
    setupMenu();
    renderActivities();
    updateProgress();
    registerServiceWorker();
}

initializeApp();
