import { useState, useEffect, useCallback } from 'react';
import { taskService, projectService, userService } from '../services/projectService';
import SEO from '../components/common/SEO';
import { Spinner, EmptyState, Avatar } from '../components/common/UI';
import Modal from '../components/common/Modal';
import { FormGroup, Input, Textarea, Select } from '../components/common/Form';
import { formatDate, timeAgo, priorityConfig, statusConfig } from '../utils/helpers';
import toast from 'react-hot-toast';
import styles from './Tasks.module.css';

const EMPTY_TASK = { title: '', description: '', projectId: '', assignedTo: '', priority: 'medium', status: 'todo', dueDate: '' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState(EMPTY_TASK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    Promise.all([
      projectService.getAll(),
      userService.getAll()
    ]).then(([pr, ur]) => {
      setProjects(pr.data.projects);
      setUsers(ur.data.users);
    }).catch(() => {});
    fetchTasks();
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (projectFilter) params.projectId = projectFilter;
      if (search) params.search = search;
      const res = await taskService.getAll(params);
      setTasks(res.data.tasks);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, projectFilter, search]);

  useEffect(() => {
    const t = setTimeout(fetchTasks, 300);
    return () => clearTimeout(t);
  }, [fetchTasks]);

  const validate = (form) => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.projectId) e.projectId = 'Project is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate(taskForm)) return;
    setSaving(true);
    try {
      const res = await taskService.create(taskForm);
      setTasks(t => [res.data.task, ...t]);
      setCreateModal(false);
      setTaskForm(EMPTY_TASK);
      toast.success('Task created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate(editTask)) return;
    setSaving(true);
    try {
      const res = await taskService.update(editTask._id, editTask);
      setTasks(t => t.map(x => x._id === editTask._id ? res.data.task : x));
      setEditModal(false);
      setEditTask(null);
      toast.success('Task updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    setDeleting(id);
    try {
      await taskService.delete(id);
      setTasks(t => t.filter(x => x._id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(null);
    }
  };

  const openEdit = (task) => {
    setEditTask({
      ...task,
      projectId: task.projectId?._id || task.projectId || '',
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setErrors({});
    setEditModal(true);
  };

  const quickStatus = async (taskId, status) => {
    try {
      const res = await taskService.update(taskId, { status });
      setTasks(t => t.map(x => x._id === taskId ? res.data.task : x));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const groupedByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  return (
    <div className={styles.page}>
      <SEO title="Tasks" description="Track, prioritize, assign, and update statuses of your projects tasks in real time." />
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select className={styles.filterSelect} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className={styles.filterSelect} value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
            <option value="">All projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
        </div>
        <button className={styles.createBtn} onClick={() => { setTaskForm(EMPTY_TASK); setErrors({}); setCreateModal(true); }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Task
        </button>
      </div>

      {/* Summary badges */}
      <div className={styles.summaryRow}>
        {Object.entries({ todo: 'To Do', 'in-progress': 'In Progress', completed: 'Completed' }).map(([key, label]) => {
          const count = groupedByStatus[key]?.length || 0;
          const colors = { todo: 'var(--text-dim)', 'in-progress': 'var(--primary)', completed: 'var(--success)' };
          return (
            <div key={key} className={styles.summaryItem}
              style={{ borderColor: statusFilter === key ? colors[key] : 'var(--border)' }}
              onClick={() => setStatusFilter(statusFilter === key ? '' : key)}>
              <span className={styles.summaryCount} style={{ color: colors[key] }}>{count}</span>
              <span className={styles.summaryLabel}>{label}</span>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Spinner size={28} color="var(--primary)" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="✅"
          title={search || statusFilter || priorityFilter ? 'No tasks found' : 'No tasks yet'}
          description="Create your first task to start tracking work"
          action={
            <button className={styles.createBtn} onClick={() => { setCreateModal(true); }}>
              Create Task
            </button>
          }
        />
      ) : (
        <div className={styles.taskList}>
          {tasks.map(task => {
            const ps = priorityConfig[task.priority] || priorityConfig.medium;
            const ss = statusConfig[task.status] || statusConfig.todo;
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
            return (
              <div key={task._id} className={`${styles.taskRow} ${task.status === 'completed' ? styles.taskDone : ''}`}>
                <button
                  className={`${styles.checkBtn} ${task.status === 'completed' ? styles.checked : ''}`}
                  onClick={() => quickStatus(task._id, task.status === 'completed' ? 'todo' : 'completed')}
                >
                  {task.status === 'completed' && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>

                <div className={styles.taskMain}>
                  <div className={styles.taskTopRow}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <div className={styles.taskBadges}>
                      <span className={styles.badge} style={{ color: ps.color, background: ps.bg }}>{ps.label}</span>
                      <span className={styles.badge} style={{ color: ss.color, background: ss.bg }}>{ss.label}</span>
                    </div>
                  </div>
                  {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                  <div className={styles.taskMeta}>
                    {task.projectId && (
                      <span className={styles.projectTag} style={{ background: task.projectId.color ? task.projectId.color + '22' : 'var(--primary-glow)', color: task.projectId.color || 'var(--primary)' }}>
                        📁 {task.projectId.title}
                      </span>
                    )}
                    {task.assignedTo && (
                      <div className={styles.assignee}>
                        <Avatar name={task.assignedTo.name} size={16} />
                        <span>{task.assignedTo.name}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <span className={styles.due} style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {isOverdue ? '⚠️' : '📅'} {formatDate(task.dueDate)}
                      </span>
                    )}
                    <span className={styles.timeago}>{timeAgo(task.createdAt)}</span>
                  </div>
                </div>

                <div className={styles.rowActions}>
                  <select
                    className={styles.statusSelect}
                    value={task.status}
                    onChange={e => quickStatus(task._id, e.target.value)}
                    style={{ color: ss.color }}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button className={styles.actionBtn} onClick={() => openEdit(task)} title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => handleDelete(task._id)} disabled={deleting === task._id} title="Delete">
                    {deleting === task._id ? <Spinner size={12} /> : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New Task">
        <TaskForm form={taskForm} setForm={setTaskForm} errors={errors} projects={projects} users={users}
          onSubmit={handleCreate} onCancel={() => setCreateModal(false)} saving={saving} submitLabel="Create Task" />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Task">
        {editTask && (
          <TaskForm form={editTask} setForm={setEditTask} errors={errors} projects={projects} users={users}
            onSubmit={handleUpdate} onCancel={() => setEditModal(false)} saving={saving} submitLabel="Save Changes" />
        )}
      </Modal>
    </div>
  );
}

function TaskForm({ form, setForm, errors, projects, users, onSubmit, onCancel, saving, submitLabel }) {
  const ch = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <FormGroup label="Title" required error={errors.title}>
        <Input placeholder="Task title" value={form.title} onChange={ch('title')} error={errors.title} />
      </FormGroup>
      <FormGroup label="Description">
        <Textarea placeholder="Optional description…" value={form.description} onChange={ch('description')} rows={3} />
      </FormGroup>
      <FormGroup label="Project" required error={errors.projectId}>
        <Select value={form.projectId} onChange={ch('projectId')} error={errors.projectId}>
          <option value="">Select a project</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </Select>
      </FormGroup>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <FormGroup label="Priority">
          <Select value={form.priority} onChange={ch('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </FormGroup>
        <FormGroup label="Status">
          <Select value={form.status} onChange={ch('status')}>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>
        </FormGroup>
      </div>
      <FormGroup label="Assign To">
        <Select value={form.assignedTo} onChange={ch('assignedTo')}>
          <option value="">Unassigned</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
        </Select>
      </FormGroup>
      <FormGroup label="Due Date">
        <Input type="date" value={form.dueDate} onChange={ch('dueDate')} />
      </FormGroup>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
        <button type="button" onClick={onCancel} style={{ padding: '9px 18px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '14px' }}>
          Cancel
        </button>
        <button type="submit" disabled={saving} style={{ padding: '9px 20px', background: 'var(--primary)', border: 'none', borderRadius: '9px', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
