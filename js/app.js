const SUPABASE_URL = 'https://dyihctgcpimueefzkprw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_v6iM30ry7gBneox9Eukt0Q_u5pP1dU2';

// Usamos supabaseClient para evitar el conflicto de nombres con la librería global
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// ESTADO LOCAL Y FILTROS
// ==========================================
let tasks = [];
let filterStatus   = 'all';   // 'all' | 'pending' | 'completed'
let filterPriority = 'all';   // 'all' | 'high' | 'medium' | 'low'

// ==========================================
// UTILIDADES
// ==========================================
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

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==========================================
// VALIDACIÓN DE FORMULARIO
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

function resetForm() {
  document.getElementById('task-title').value    = '';
  document.getElementById('task-desc').value     = '';
  document.getElementById('task-priority').value = 'medium';
  document.getElementById('task-deadline').value = '';
  document.getElementById('err-title').textContent = '';
}

// ==========================================
// OPERACIONES CRUD (SUPABASE)
// ==========================================

// READ: Cargar tareas desde Supabase
async function loadTasks() {
  const { data, error } = await supabaseClient
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al cargar tareas:', error);
    showToast('Error al conectar con la base de datos');
  } else {
    tasks = data || [];
    renderAll();
  }
}

// CREATE: Insertar una nueva tarea
async function addTask() {
  if (!validateForm()) return;

  const title       = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-desc').value.trim();
  const priority    = document.getElementById('task-priority').value;
  const deadlineVal = document.getElementById('task-deadline').value;

  const newTask = {
    title: title,
    description: description || null,
    priority: priority,
    deadline: deadlineVal || null,
    completed: false
  };

  const { error } = await supabaseClient
    .from('tasks')
    .insert([newTask]);

  if (error) {
    console.error('Error al insertar tarea:', error);
    showToast('Error al guardar la tarea');
  } else {
    resetForm();
    await loadTasks();
    showToast('Tarea agregada');
  }
}

// UPDATE: Cambiar estado completado/pendiente
async function toggleTask(id, currentCompleted) {
  const { error } = await supabaseClient
    .from('tasks')
    .update({ completed: !currentCompleted })
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar tarea:', error);
    showToast('Error al actualizar');
  } else {
    await loadTasks();
    showToast(!currentCompleted ? 'Tarea completada' : 'Tarea pendiente');
  }
}

// DELETE: Eliminar tarea de Supabase
async function deleteTask(id) {
  const { error } = await supabaseClient
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar tarea:', error);
    showToast('Error al eliminar');
  } else {
    await loadTasks();
    showToast('Tarea eliminada');
  }
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
// RENDERIZADO DE INTERFAZ
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
  const list     = document.getElementById('task-list');
  const emptyEl  = document.getElementById('empty-state');
  const filtered = getFilteredTasks();

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
    
    const createdDate = task.created_at ? task.created_at.split('T')[0] : '';
    const createdText = createdDate ? `Creada ${formatDate(createdDate)}` : '';

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
          <span class="badge badge-${task.priority}">${priorityLabel[task.priority] || task.priority}</span>
          ${deadlineText ? `<span class="task-date${overdueClass}">${deadlineText}</span>` : ''}
          ${createdText ? `<span class="task-date">${createdText}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-delete" aria-label="Eliminar tarea '${escapeHtml(task.title)}'">✕</button>
      </div>
    `;

    // Asignación de eventos dinámicos
    li.querySelector('.task-check').addEventListener('change', () => toggleTask(task.id, task.completed));
    li.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));

    list.appendChild(li);
  });
}

// ==========================================
// FILTROS — EVENT LISTENERS
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
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  initFilters();

  document.getElementById('btn-add').addEventListener('click', addTask);

  document.getElementById('task-title').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });

  document.getElementById('task-title').addEventListener('input', () => {
    document.getElementById('err-title').textContent = '';
  });
});