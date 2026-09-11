/**
 * CloudTasks — app.js
 * Etapa 1: lógica local con localStorage
 * En Etapa 2 este archivo se adaptará para usar Supabase.
 */

// ==========================================
// ESTADO
// ==========================================
let tasks = [];
let filterStatus    = 'all';    // 'all' | 'pending' | 'completed'
let filterPriority  = 'all';    // 'all' | 'high' | 'medium' | 'low'
let selectedPriority = 'medium'; // prioridad elegida en el compositor
let editingId        = null;     // id de la tarea en edición, o null

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MESES_ABREV = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

// ==========================================
// PERSISTENCIA LOCAL (Etapa 1)
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

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function addDaysISO(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function formatRelativeDate(iso) {
  if (!iso) return '';
  const today    = todayISO();
  const tomorrow = addDaysISO(today, 1);
  if (iso === today) return 'Hoy';
  if (iso === tomorrow) return 'Mañana';
  const [, m, d] = iso.split('-');
  return `${parseInt(d, 10)} ${MESES_ABREV[parseInt(m, 10) - 1]}`;
}

function isOverdue(deadline) {
  if (!deadline) return false;
  return deadline < todayISO();
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

function renderAgendaDate() {
  const now = new Date();
  document.getElementById('date-num').textContent   = String(now.getDate()).padStart(2, '0');
  document.getElementById('date-month').textContent = MESES[now.getMonth()];
  document.getElementById('date-sub').textContent    = `${DIAS[now.getDay()].toUpperCase()} · ${now.getFullYear()}`;
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

  const values = {
    title:       document.getElementById('task-title').value.trim(),
    description: document.getElementById('task-desc').value.trim(),
    priority:    selectedPriority,
    deadline:    document.getElementById('task-deadline').value,
  };

  if (editingId) {
    const task = tasks.find(t => t.id === editingId);
    if (task) Object.assign(task, values);
    editingId = null;
    saveTasks();
    resetForm();
    renderAll();
    showToast('Tarea actualizada');
    return;
  }

  const task = {
    id: generateId(),
    ...values,
    completed:  false,
    created_at: new Date().toISOString(),
  };

  tasks.unshift(task);
  saveTasks();
  resetForm();
  renderAll();
  showToast('Tarea agregada');
}

function startEditTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingId = id;
  document.getElementById('task-title').value    = task.title;
  document.getElementById('task-desc').value     = task.description || '';
  document.getElementById('task-deadline').value = task.deadline || '';
  setSelectedPriority(task.priority);

  document.getElementById('composer-eyebrow').lastChild.textContent = 'Editar tarea';
  const btn = document.getElementById('btn-add');
  btn.textContent = 'Guardar';
  btn.classList.add('btn-editing');

  document.getElementById('task-title').focus();
  document.querySelector('.composer').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelEdit() {
  editingId = null;
  resetForm();
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
  if (editingId === id) cancelEdit();
  saveTasks();
  renderAll();
  showToast('Tarea eliminada');
}

function resetForm() {
  document.getElementById('task-title').value    = '';
  document.getElementById('task-desc').value     = '';
  document.getElementById('task-deadline').value = '';
  document.getElementById('err-title').textContent = '';
  setSelectedPriority('medium');

  document.getElementById('composer-eyebrow').lastChild.textContent = 'Nueva tarea';
  const btn = document.getElementById('btn-add');
  btn.textContent = 'Agregar';
  btn.classList.remove('btn-editing');
}

function setSelectedPriority(value) {
  selectedPriority = value;
  document.querySelectorAll('#priority-picker .pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === value);
  });
}

// ==========================================
// FILTRADO Y AGRUPACIÓN
// ==========================================
function getFilteredTasks() {
  return tasks.filter(task => {
    const statusOk =
      filterStatus === 'all' ||
      (filterStatus === 'pending'   && !task.completed) ||
      (filterStatus === 'completed' &&  task.completed) ||
      (filterStatus === 'overdue'   && !task.completed && isOverdue(task.deadline));

    const priorityOk =
      filterPriority === 'all' || task.priority === filterPriority;

    return statusOk && priorityOk;
  });
}

function buildSections(filtered) {
  if (filterStatus === 'completed') {
    return filtered.length ? [{ title: 'Completadas', tasks: filtered }] : [];
  }

  if (filterStatus === 'overdue') {
    return filtered.length ? [{ title: 'Vencidas', tasks: filtered }] : [];
  }

  const today = todayISO();
  const buckets = { overdue: [], today: [], upcoming: [], noDate: [], completed: [] };

  filtered.forEach(task => {
    if (task.completed)          { buckets.completed.push(task); return; }
    if (!task.deadline)          { buckets.noDate.push(task); return; }
    if (task.deadline < today)   { buckets.overdue.push(task); return; }
    if (task.deadline === today) { buckets.today.push(task); return; }
    buckets.upcoming.push(task);
  });

  const sections = [];
  if (buckets.overdue.length)   sections.push({ title: 'Vencidas',    tasks: buckets.overdue });
  if (buckets.today.length)     sections.push({ title: 'Hoy',         tasks: buckets.today });
  if (buckets.upcoming.length)  sections.push({ title: 'Próximas',    tasks: buckets.upcoming });
  if (buckets.noDate.length)    sections.push({ title: 'Sin fecha',   tasks: buckets.noDate });
  if (buckets.completed.length) sections.push({ title: 'Completadas', tasks: buckets.completed });
  return sections;
}

// ==========================================
// RENDER
// ==========================================
function renderAll() {
  renderStats();
  renderList();
}

function renderStats() {
  const total     = tasks.length;
  const pending   = tasks.filter(t => !t.completed).length;
  const completed = total - pending;
  const overdue   = tasks.filter(t => !t.completed && isOverdue(t.deadline)).length;
  const pct       = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById('stat-pending-big').textContent =
    `${pending} ${pending === 1 ? 'pendiente' : 'pendientes'}`;
  document.getElementById('stat-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('stat-caption').textContent =
    `${completed} DE ${total} COMPLETADAS`;

  document.getElementById('count-all').textContent       = total;
  document.getElementById('count-pending').textContent   = pending;
  document.getElementById('count-overdue').textContent   = overdue;
  document.getElementById('count-completed').textContent = completed;
}

function renderList() {
  const list     = document.getElementById('task-list');
  const emptyEl  = document.getElementById('empty-state');
  const filtered = getFilteredTasks();
  const sections = buildSections(filtered);

  list.innerHTML = '';

  if (sections.length === 0) {
    emptyEl.style.display = 'block';
    list.style.display    = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  list.style.display    = 'block';

  const priorityLabel = { high: 'Alta', medium: 'Media', low: 'Baja' };

  sections.forEach(section => {
    const sectionEl = document.createElement('div');
    sectionEl.className = 'task-section';

    const heading = document.createElement('h3');
    heading.className = 'section-heading';
    heading.innerHTML = `${section.title}<span class="section-count">${String(section.tasks.length).padStart(2, '0')}</span>`;
    sectionEl.appendChild(heading);

    const ul = document.createElement('ul');
    ul.className = 'task-group';

    section.tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item${task.completed ? ' completed' : ''}`;
      li.dataset.priority = task.priority;
      li.dataset.id       = task.id;

      const overdueClass = isOverdue(task.deadline) && !task.completed ? ' overdue' : '';
      const dateText = task.deadline ? formatRelativeDate(task.deadline) : '';

      li.innerHTML = `
        <span class="task-bar" aria-hidden="true"></span>
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
            <span class="task-priority-label">${priorityLabel[task.priority]}</span>
            ${dateText ? `<span class="task-date${overdueClass}">${dateText}</span>` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-edit" aria-label="Editar tarea '${escapeHtml(task.title)}'">✎</button>
          <button class="btn-delete" aria-label="Eliminar tarea '${escapeHtml(task.title)}'">✕</button>
        </div>
      `;

      li.querySelector('.task-check').addEventListener('change', () => toggleTask(task.id));
      li.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));
      li.querySelector('.btn-edit').addEventListener('click', () => startEditTask(task.id));

      ul.appendChild(li);
    });

    sectionEl.appendChild(ul);
    list.appendChild(sectionEl);
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
// FILTROS Y COMPOSITOR — EVENT LISTENERS
// ==========================================
function initFilters() {
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterStatus = btn.dataset.filter;
      renderList();
    });
  });

  document.querySelectorAll('#priority-filters [data-priority]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#priority-filters [data-priority]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterPriority = btn.dataset.priority;
      renderList();
    });
  });

  document.querySelectorAll('#priority-picker .pill').forEach(btn => {
    btn.addEventListener('click', () => setSelectedPriority(btn.dataset.value));
  });
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  renderAgendaDate();
  loadTasks();
  renderAll();
  initFilters();

  document.getElementById('btn-add').addEventListener('click', addTask);

  document.getElementById('task-title').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });

  document.getElementById('task-title').addEventListener('input', () => {
    document.getElementById('err-title').textContent = '';
  });
});
