(function() {
  const STORAGE_KEY = 'ems_employees_v1';

  const seed = [
    { id: 'e1', name: 'Priya Nair', department: 'Engineering', salary: 92000 },
    { id: 'e2', name: 'Rahul Verma', department: 'Sales', salary: 68000 },
    { id: 'e3', name: 'Anjali Menon', department: 'Human Resources', salary: 71000 },
    { id: 'e4', name: 'Karthik Subramaniam', department: 'Engineering', salary: 98500 },
    { id: 'e5', name: 'Divya Krishnan', department: 'Marketing', salary: 64000 },
    { id: 'e6', name: 'Suresh Pillai', department: 'Finance', salary: 76500 },
  ];

  function loadEmployees() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through to seed */ }
    return seed.slice();
  }

  function saveEmployees(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) { /* storage unavailable, continue in-memory */ }
  }

  let employees = loadEmployees();
  let sortKey = 'name';
  let sortDir = 1;

  const tableBody = document.getElementById('tableBody');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const deptFilter = document.getElementById('deptFilter');
  const overlay = document.getElementById('overlay');
  const modalTitle = document.getElementById('modalTitle');
  const addBtn = document.getElementById('addBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const saveBtn = document.getElementById('saveBtn');
  const editId = document.getElementById('editId');
  const nameInput = document.getElementById('nameInput');
  const deptInput = document.getElementById('deptInput');
  const salaryInput = document.getElementById('salaryInput');
  const deptList = document.getElementById('deptList');

  document.getElementById('todayStamp').textContent = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  function fmtMoney(n) {
    return '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  function uniqueDepartments() {
    return [...new Set(employees.map(e => e.department))].sort((a,b)=>a.localeCompare(b));
  }

  function refreshDeptOptions() {
    const depts = uniqueDepartments();
    const currentFilter = deptFilter.value;
    deptFilter.innerHTML = '<option value="">All departments</option>' +
      depts.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
    if (depts.includes(currentFilter)) deptFilter.value = currentFilter;
    deptList.innerHTML = depts.map(d => `<option value="${escapeHtml(d)}">`).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function updateStats(list) {
    document.getElementById('statTotal').textContent = employees.length;
    document.getElementById('statDepts').textContent = uniqueDepartments().length;
    const total = employees.reduce((s, e) => s + Number(e.salary), 0);
    const avg = employees.length ? total / employees.length : 0;
    document.getElementById('statAvg').textContent = fmtMoney(avg);
    document.getElementById('statTotalSalary').textContent = fmtMoney(total);
  }

  function setArrows() {
    ['name','department','salary'].forEach(k => {
      const el = document.getElementById('arrow-' + k);
      el.textContent = (k === sortKey) ? (sortDir === 1 ? '▲' : '▼') : '';
    });
  }

  function render() {
    refreshDeptOptions();
    updateStats();

    const q = searchInput.value.trim().toLowerCase();
    const deptQ = deptFilter.value;

    let filtered = employees.filter(e => {
      const matchesSearch = !q || e.name.toLowerCase().includes(q) || e.department.toLowerCase().includes(q);
      const matchesDept = !deptQ || e.department === deptQ;
      return matchesSearch && matchesDept;
    });

    filtered.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === 'salary') { av = Number(av); bv = Number(bv); }
      else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
      if (av < bv) return -1 * sortDir;
      if (av > bv) return 1 * sortDir;
      return 0;
    });

    setArrows();

    if (!filtered.length) {
      tableBody.innerHTML = '';
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    tableBody.innerHTML = filtered.map(e => `
      <tr data-id="${e.id}">
        <td class="name-cell">${escapeHtml(e.name)}</td>
        <td><span class="dept-pill">${escapeHtml(e.department)}</span></td>
        <td class="salary-cell">${fmtMoney(e.salary)}</td>
        <td>
          <div class="row-actions">
            <button class="icon-btn edit-btn" title="Edit" data-id="${e.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <button class="icon-btn danger delete-btn" title="Delete" data-id="${e.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  document.querySelectorAll('thead th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.getAttribute('data-sort');
      if (sortKey === key) sortDir *= -1;
      else { sortKey = key; sortDir = 1; }
      render();
    });
  });

  searchInput.addEventListener('input', render);
  deptFilter.addEventListener('change', render);

  function openModal(mode, emp) {
    document.getElementById('nameError').textContent = '';
    document.getElementById('deptError').textContent = '';
    document.getElementById('salaryError').textContent = '';
    if (mode === 'edit') {
      modalTitle.textContent = 'Edit employee';
      editId.value = emp.id;
      nameInput.value = emp.name;
      deptInput.value = emp.department;
      salaryInput.value = emp.salary;
    } else {
      modalTitle.textContent = 'Add employee';
      editId.value = '';
      nameInput.value = '';
      deptInput.value = '';
      salaryInput.value = '';
    }
    overlay.hidden = false;
    nameInput.focus();
  }

  function closeModal() { overlay.hidden = true; }

  addBtn.addEventListener('click', () => openModal('add'));
  cancelBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  tableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    const delBtn = e.target.closest('.delete-btn');
    if (editBtn) {
      const emp = employees.find(x => x.id === editBtn.dataset.id);
      if (emp) openModal('edit', emp);
    } else if (delBtn) {
      const emp = employees.find(x => x.id === delBtn.dataset.id);
      if (emp && confirm(`Remove ${emp.name} from the roster?`)) {
        employees = employees.filter(x => x.id !== delBtn.dataset.id);
        saveEmployees(employees);
        render();
      }
    }
  });

  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const department = deptInput.value.trim();
    const salary = salaryInput.value;

    let valid = true;
    if (!name) { document.getElementById('nameError').textContent = 'Enter a name.'; valid = false; }
    if (!department) { document.getElementById('deptError').textContent = 'Enter a department.'; valid = false; }
    if (salary === '' || isNaN(salary) || Number(salary) < 0) {
      document.getElementById('salaryError').textContent = 'Enter a valid salary.'; valid = false;
    }
    if (!valid) return;

    if (editId.value) {
      const emp = employees.find(x => x.id === editId.value);
      if (emp) { emp.name = name; emp.department = department; emp.salary = Number(salary); }
    } else {
      employees.push({ id: 'e' + Date.now() + Math.floor(Math.random()*1000), name, department, salary: Number(salary) });
    }
    saveEmployees(employees);
    closeModal();
    render();
  });

  render();
})();
