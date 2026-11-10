// Shared navigation
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// About page audio introduction. Uses the browser's built-in speech voice.
// Play Emmanuel's actual recorded introduction
const emmanuelAudio = document.getElementById("emmanuelAudio");

if (emmanuelAudio) {
  const playIntro = document.getElementById("playIntro");
  const pauseIntro = document.getElementById("pauseIntro");
  const stopIntro = document.getElementById("stopIntro");
  const audioStatus = document.getElementById("audioStatus");

  playIntro.addEventListener("click", async () => {
    try {
      await emmanuelAudio.play();

      audioStatus.textContent = "Playing Emmanuel's introduction...";
      playIntro.textContent = "Play Again";
      pauseIntro.disabled = false;
      stopIntro.disabled = false;
    } catch (error) {
      audioStatus.textContent = "Unable to play the audio file.";
      console.error(error);
    }
  });

  pauseIntro.addEventListener("click", () => {
    if (emmanuelAudio.paused) {
      emmanuelAudio.play();
      pauseIntro.textContent = "Pause";
      audioStatus.textContent = "Playing introduction...";
    } else {
      emmanuelAudio.pause();
      pauseIntro.textContent = "Resume";
      audioStatus.textContent = "Introduction paused.";
    }
  });

  stopIntro.addEventListener("click", () => {
    emmanuelAudio.pause();
    emmanuelAudio.currentTime = 0;

    pauseIntro.textContent = "Pause";
    pauseIntro.disabled = true;
    stopIntro.disabled = true;

    audioStatus.textContent = "Introduction stopped.";
  });

  emmanuelAudio.addEventListener("ended", () => {
    pauseIntro.disabled = true;
    stopIntro.disabled = true;
    pauseIntro.textContent = "Pause";
    audioStatus.textContent = "Introduction finished.";
  });

  emmanuelAudio.addEventListener("error", () => {
    audioStatus.textContent = "The audio file could not be loaded.";
  });
}

// Contact form opens the visitor's email application; no backend is assumed.
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = encodeURIComponent("Portfolio enquiry for Emmanuel Ayedun");
    const body = encodeURIComponent(
      `Name: ${form.get("name")}\nEmail: ${form.get("email")}\n\n${form.get("message")}`,
    );
    window.location.href = `mailto:emmanueayedun0082@miva.edu.ng?subject=${subject}&body=${body}`;
  });
}

// Academic planner: tasks persist in localStorage in this browser.
const taskForm = document.getElementById("taskForm");
if (taskForm) {
  const taskInput = document.getElementById("taskInput");
  const taskDueDate = document.getElementById("taskDueDate");
  const taskSubmit = document.getElementById("taskSubmit");
  const cancelEdit = document.getElementById("cancelEdit");
  const taskList = document.getElementById("taskList");
  const filterButtons = [...document.querySelectorAll(".filter")];
  const feedback = document.getElementById("plannerFeedback");
  const summary = document.getElementById("plannerSummary");
  const storageKey = "emmanuelAyedunAcademicPlanner";
  let tasks = [];
  let currentFilter = "all";
  let editingId = null;

  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    tasks = Array.isArray(stored)
      ? stored.filter(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.text === "string",
        )
      : [];
  } catch (error) {
    tasks = [];
    feedback.textContent =
      "Saved tasks could not be read. You can start a new list.";
  }

  function saveTasks() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
      feedback.textContent = "Changes saved.";
      return true;
    } catch (error) {
      feedback.textContent =
        "Your browser could not save these changes. Check its storage settings.";
      return false;
    }
  }

  function resetEditor() {
    editingId = null;
    taskForm.reset();
    taskSubmit.innerHTML = "Add Task <span>＋</span>";
    cancelEdit.hidden = true;
  }

  function formatDate(dateValue) {
    if (!dateValue) return "";
    const date = new Date(`${dateValue}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  }

  function renderTasks() {
    taskList.replaceChildren();
    const visibleTasks = tasks.filter(
      (task) =>
        currentFilter === "all" ||
        (currentFilter === "completed" ? task.done : !task.done),
    );

    visibleTasks.sort((a, b) => {
      if (a.done !== b.done) return Number(a.done) - Number(b.done);
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

    visibleTasks.forEach((task) => {
      const item = document.createElement("li");
      item.className = `task-item${task.done ? " done" : ""}`;

      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(task.done);
      checkbox.setAttribute(
        "aria-label",
        `Mark ${task.text} as ${task.done ? "pending" : "completed"}`,
      );
      checkbox.addEventListener("change", () => {
        task.done = checkbox.checked;
        saveTasks();
        renderTasks();
      });

      const content = document.createElement("span");
      content.className = "task-content";
      const taskText = document.createElement("span");
      taskText.className = "task-text";
      taskText.textContent = task.text;
      content.append(taskText);

      if (task.dueDate) {
        const due = document.createElement("small");
        due.className = "task-due";
        due.textContent = `Due ${formatDate(task.dueDate)}`;
        content.append(due);
      }

      label.append(checkbox, content);

      const actions = document.createElement("div");
      actions.className = "task-actions";

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "edit-task";
      edit.textContent = "Edit";
      edit.addEventListener("click", () => {
        editingId = task.id;
        taskInput.value = task.text;
        taskDueDate.value = task.dueDate || "";
        taskSubmit.textContent = "Save Changes";
        cancelEdit.hidden = false;
        taskInput.focus();
        feedback.textContent = "Editing task.";
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "delete-task";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Delete ${task.text}`);
      remove.addEventListener("click", () => {
        tasks = tasks.filter((item) => item.id !== task.id);
        if (editingId === task.id) resetEditor();
        saveTasks();
        renderTasks();
      });

      actions.append(edit, remove);
      item.append(label, actions);
      taskList.append(item);
    });

    if (!visibleTasks.length) {
      const empty = document.createElement("li");
      empty.className = "task-empty";
      empty.textContent =
        currentFilter === "all"
          ? "No tasks yet. Add your first task above."
          : `No ${currentFilter} tasks.`;
      taskList.append(empty);
    }

    const completed = tasks.filter((task) => task.done).length;
    summary.textContent = `${tasks.length} task${tasks.length === 1 ? "" : "s"} · ${completed} completed · ${tasks.length - completed} pending`;
  }

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = taskInput.value.trim();
    if (!value) {
      feedback.textContent = "Enter a task before saving.";
      taskInput.focus();
      return;
    }

    if (editingId) {
      const task = tasks.find((item) => item.id === editingId);
      if (task) {
        task.text = value;
        task.dueDate = taskDueDate.value;
      }
      feedback.textContent = "Task updated.";
    } else {
      tasks.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text: value,
        dueDate: taskDueDate.value,
        done: false,
        createdAt: new Date().toISOString(),
      });
      feedback.textContent = "Task added.";
    }

    resetEditor();
    saveTasks();
    renderTasks();
  });

  cancelEdit.addEventListener("click", () => {
    resetEditor();
    feedback.textContent = "Edit cancelled.";
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;
      filterButtons.forEach((item) =>
        item.classList.toggle("active", item === button),
      );
      renderTasks();
    });
  });

  renderTasks();
}
