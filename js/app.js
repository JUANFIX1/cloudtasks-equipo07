/**
 * CloudTasks — app.js
 * Etapa 1: lógica local con localStorage
 * En Etapa 2 este archivo se adaptará para usar Supabase.
 */

// ==========================================
// ESTADO
// ==========================================
let tasks = [];
let filterStatus   = 'all';   // 'all' | 'pending' | 'completed'
let filterPriority = 'all';   // 'all' | 'high' | 'medium' | 'low'

// ==========================================
// PERSISTENCIA LOCAL (Etapa 1)
// En Etapa 2 se reemplaza por llamadas a Supabase
// ==========================================
function loadTasks() {
  const stored = localStorage.getItem('cloudtasks');
  tasks = stored ? JSON.parse(stored) : [];
}

function saveTasks() {
  localStorage.setItem('cloudtasks', JSON.stringify(tasks));
}

// ==========================================
// UTILIDADES
// ==========================================
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function isOverdue(deadline) {
  if (!deadline) return false;
  const today = new Date().toISOString().split('T')[0];
  return deadline < today;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

// ==========================================
// VALIDACIÓN
// ==========================================
function validateForm() {
  const title = document.getElementById('task-title').value.trim();
  const errEl = document.getElementById('err-title');

  if (!title) {
    errEl.textContent = 'El título es obligatorio.';
    document.getElementById('task-title').focus();
    return false;
  }
  if (title.length < 3) {
    errEl.textContent = 'El título debe tener al menos 3 caracteres.';
    document.getElementById('task-title').focus();
    return false;
  }
  errEl.textContent = '';
  return true;
}

// ==========================================
// CRUD
// ==========================================
function addTask() {
  if (!validateForm()) return;

  const task = {
    id:          generateId(),
    title:       document.getElementById('task-title').value.trim(),
    description: document.getElementById('task-desc').value.trim(),
    priority:    document.getElementById('task-priority').value,
    deadline:    document.getElementById('task-deadline').value,
    completed:   false,
    created_at:  new Date().toISOString(),
  };

  tasks.unshift(task);
  saveTasks();
  resetForm();
  renderAll();
  showToast('Tarea agregada');
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  renderAll();
  showToast(task.completed ? 'Tarea completada' : 'Tarea pendiente');
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderAll();
  showToast('Tarea eliminada');
}

function resetForm() {
  document.getElementById('task-title').value    = '';
  document.getElementById('task-desc').value     = '';
  document.getElementById('task-priority').value = 'medium';
  document.getElementById('task-deadline').value = '';
  document.getElementById('err-title').textContent = '';
}

// ==========================================
// FILTRADO
// ==========================================
function getFilteredTasks() {
  return tasks.filter(task => {
    const statusOk =
      filterStatus === 'all' ||
      (filterStatus === 'pending'   && !task.completed) ||
      (filterStatus === 'completed' &&  task.completed);

    const priorityOk =
      filterPriority === 'all' || task.priority === filterPriority;

    return statusOk && priorityOk;
  });
}

// ==========================================
// RENDER
// ==========================================
function renderAll() {
  renderStats();
  renderList();
}

function renderStats() {
  const total   = tasks.length;
  const pending = tasks.filter(t => !t.completed).length;

  document.getElementById('stat-total').textContent =
    `${total} ${total === 1 ? 'tarea' : 'tareas'}`;
  document.getElementById('stat-pending').textContent =
    `${pending} ${pending === 1 ? 'pendiente' : 'pendientes'}`;
}

function renderList() {
  const list      = document.getElementById('task-list');
  const emptyEl   = document.getElementById('empty-state');
  const filtered  = getFilteredTasks();

  list.innerHTML = '';

  if (filtered.length === 0) {
    emptyEl.style.display = 'flex';
    list.style.display    = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  list.style.display    = 'flex';

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.completed ? ' completed' : ''}`;
    li.dataset.priority = task.priority;
    li.dataset.id       = task.id;

    const overdueClass = isOverdue(task.deadline) && !task.completed ? ' overdue' : '';
    const deadlineText = task.deadline
      ? `Límite: ${formatDate(task.deadline)}`
      : '';
    const createdText = `Creada ${formatDate(task.created_at.split('T')[0])}`;

    const priorityLabel = { high: 'Alta', medium: 'Media', low: 'Baja' };

    li.innerHTML = `
      <input
        type="checkbox"
        class="task-check"
        aria-label="Marcar '${escapeHtml(task.title)}' como completada"
        ${task.completed ? 'checked' : ''}
      />
      <div class="task-body">
        <p class="task-title">${escapeHtml(task.title)}</p>
        ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
        <div class="task-meta">
          <span class="badge badge-${task.priority}">${priorityLabel[task.priority]}</span>
          ${deadlineText ? `<span class="task-date${overdueClass}">${deadlineText}</span>` : ''}
          <span class="task-date">${createdText}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-delete" aria-label="Eliminar tarea '${escapeHtml(task.title)}'">✕</button>
      </div>
    `;

    // Eventos
    li.querySelector('.task-check').addEventListener('change', () => toggleTask(task.id));
    li.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));

    list.appendChild(li);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==========================================
// FILTROS — EVENT LISTENERS
// ==========================================
function initFilters() {
  // Filtros de estado
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterStatus = btn.dataset.filter;
      renderList();
    });
  });

  // Filtros de prioridad
  document.querySelectorAll('[data-priority]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-priority]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterPriority = btn.dataset.priority;
      renderList();
    });
  });
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  renderAll();
  initFilters();

  document.getElementById('btn-add').addEventListener('click', addTask);

  // Permitir agregar con Enter en el campo de título
  document.getElementById('task-title').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });

  // Limpiar error mientras escribe
  document.getElementById('task-title').addEventListener('input', () => {
    document.getElementById('err-title').textContent = '';
  });
});
