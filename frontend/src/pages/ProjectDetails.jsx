import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService, taskService, userService } from '../services/projectService';
import { ProgressBar, Spinner, EmptyState, Avatar } from '../components/common/UI';
import Modal from '../components/common/Modal';
import { FormGroup, Input, Textarea, Select } from '../components/common/Form';
import { formatDate, timeAgo, priorityConfig, statusConfig, projectStatusConfig, PROJECT_COLORS } from '../utils/helpers';
import toast from 'react-hot-toast';
import styles from './ProjectDetails.module.css';

const EMPTY_TASK = { title: '', description: '', assignedTo: '', priority: 'medium', status: 'todo', dueDate: '' };
const EMPTY_PROJECT = { title: '', description: '', status: 'active', priority: 'medium', dueDate: '', color: PROJECT_COLORS[0] };

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals
  const [taskModal, setTaskModal] = useState(false);
  const [editTaskModal, setEditTaskModal] = useState(false);
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [commentModal, setCommentModal] = useState(null); // taskId

  const [taskForm, setTaskForm] = useState(EMPTY_TASK);
  const [editTask, setEditTask] = useState(null);
  const [editProjectForm, setEditProjectForm] = useState(EMPTY_PROJECT);
  const [commentText, setCommentText] = useState('');
  const [taskErrors, setTaskErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);

  useEffect(() => {
    fetchProject();
    userService.getAll().then(r => setUsers(r.data.users)).catch(() => {});
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await projectService.getOne(id);
      setProject(res.data.project);
      setTasks(res.data.tasks);
    } catch {
      toast.error('Project not found');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  const validateTask = (form) => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    setTaskErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!validateTask(taskForm)) return;
    setSaving(true);
    try {
      const res = await taskService.create({ ...taskForm, projectId: id });
      setTasks(t => [res.data.task, ...t]);
      setTaskModal(false);
      setTaskForm(EMPTY_TASK);
      toast.success('Task created!');
      // refresh project stats
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!validateTask(editTask)) return;
    setSaving(true);
    try {
      const res = await taskService.update(editTask._id, editTask);
      setTasks(t => t.map(x => x._id === editTask._id ? res.data.task : x));
      setEditTaskModal(false);
      setEditTask(null);
      toast.success('Task updated!');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    setDeletingTask(taskId);
    try {
      await taskService.delete(taskId);
      setTasks(t => t.filter(x => x._id !== taskId));
      toast.success('Task deleted');
      fetchProject();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeletingTask(null);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editProjectForm.title.trim()) return;
    setSaving(true);
    try {
      const res = await projectService.update(id, editProjectForm);
      setProject(res.data.project);
      setEditProjectModal(false);
      toast.success('Project updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and ALL its tasks? This cannot be undone.')) return;
    try {
      await projectService.delete(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleAddComment = async (taskId) => {
    if (!commentText.trim()) return;
    try {
      const res = await taskService.addComment(taskId, commentText);
      setTasks(t => t.map(x => x._id === taskId ? { ...x, comments: res.data.comments } : x));
      setCommentText('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const openEditTask = (task) => {
    setEditTask({
      ...task,
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setEditTaskModal(true);
  };

  const openEditProject = () => {
    setEditProjectForm({
      title: project.title,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      dueDate: project.dueDate ? project.dueDate.split('T')[0] : '',
      color: project.color || PROJECT_COLORS[0]
    });
    setEditProjectModal(true);
  };

  const quickStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskService.update(taskId, { status: newStatus });
      setTasks(t => t.map(x => x._id === taskId ? res.data.task : x));
      fetchProject();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <Spinner size={28} color="var(--primary)" />
    </div>
  );

  const sc = projectStatusConfig[project.status] || projectStatusConfig.active;
  const taskStats = project.taskStats || {};
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    completed: tasks.filter(t => t.status === 'completed')
  };

  return (
    <div className={styles.page}>
      {/* Project Header */}
      <div className={styles.projectHeader}>
        <div className={styles.headerLeft}>
          <button onClick={() => navigate('/projects')} className={styles.backBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className={styles.projectAccent} style={{ background: project.color || 'var(--primary)' }} />
          <div>
            <div className={styles.projectTitleRow}>
              <h1 className={styles.projectTitle}>{project.title}</h1>
              <span className={styles.statusBadge} style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
            </div>
            {project.description && <p className={styles.projectDesc}>{project.description}</p>}
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.editBtn} onClick={openEditProject}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
          <button className={styles.deleteBtn} onClick={handleDeleteProject}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <div className={styles.statNum}>{taskStats.total || 0}</div>
          <div className={styles.statLbl}>Total Tasks</div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <div className={styles.statNum} style={{ color: 'var(--success)' }}>{taskStats.completed || 0}</div>
          <div className={styles.statLbl}>Completed</div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <div className={styles.statNum} style={{ color: 'var(--primary)' }}>
            {tasks.filter(t => t.status === 'in-progress').length}
          </div>
          <div className={styles.statLbl}>In Progress</div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <div className={styles.statNum} style={{ color: 'var(--text-muted)' }}>
            {tasks.filter(t => t.status === 'todo').length}
          </div>
          <div className={styles.statLbl}>To Do</div>
        </div>
        <div className={styles.progressWrap}>
          <div className={styles.progressLabel}>
            <span>Progress</span>
            <strong>{taskStats.progress || 0}%</strong>
          </div>
          <ProgressBar value={taskStats.progress || 0} color={project.color || 'var(--primary)'} height={8} />
        </div>
      </div>

      {/* Members */}
      {project.members?.length > 0 && (
        <div className={styles.members}>
          <span className={styles.membersLabel}>Members:</span>
          <div className={styles.memberAvatars}>
            {project.members.map(m => (
              <div key={m._id} className={styles.memberAvatar} title={m.name}>
                <Avatar name={m.name} size={30} />
              </div>
            ))}
          </div>
          <div className={styles.ownerBadge}>
            <Avatar name={project.owner?.name} size={24} />
            <span>{project.owner?.name} (owner)</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        {['tasks', 'board', 'activity'].map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'tasks' && <span className={styles.tabCount}>{tasks.length}</span>}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className={styles.tasksSection}>
          <div className={styles.tasksToolbar}>
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
            <button className={styles.addTaskBtn} onClick={() => setTaskModal(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Task
            </button>
          </div>

          {filteredTasks.length === 0 ? (
            <EmptyState icon="📋" title="No tasks yet" description="Add your first task to get started"
              action={<button className={styles.addTaskBtn} onClick={() => setTaskModal(true)}>Add Task</button>} />
          ) : (
            <div className={styles.taskList}>
              {filteredTasks.map(task => {
                const ps = priorityConfig[task.priority] || priorityConfig.medium;
                const ss = statusConfig[task.status] || statusConfig.todo;
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
                return (
                  <div key={task._id} className={`${styles.taskCard} ${task.status === 'completed' ? styles.taskDone : ''}`}>
                    <div className={styles.taskLeft}>
                      <button
                        className={`${styles.taskCheck} ${task.status === 'completed' ? styles.checked : ''}`}
                        onClick={() => quickStatusChange(task._id, task.status === 'completed' ? 'todo' : 'completed')}
                        title="Toggle complete"
                      >
                        {task.status === 'completed' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className={styles.taskBody}>
                      <div className={styles.taskTitleRow}>
                        <span className={styles.taskTitle}>{task.title}</span>
                        <div className={styles.taskBadges}>
                          <span className={styles.priorityBadge} style={{ color: ps.color, background: ps.bg }}>{ps.label}</span>
                          <span className={styles.statusBadge2} style={{ color: ss.color, background: ss.bg }}>{ss.label}</span>
                        </div>
                      </div>
                      {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                      <div className={styles.taskMeta}>
                        {task.assignedTo && (
                          <div className={styles.assignee}>
                            <Avatar name={task.assignedTo.name} size={18} />
                            <span>{task.assignedTo.name}</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <span className={styles.dueDate} style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>
                            {isOverdue ? '⚠️' : '📅'} {formatDate(task.dueDate)}
                          </span>
                        )}
                        {task.comments?.length > 0 && (
                          <span className={styles.commentCount}>
                            💬 {task.comments.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.taskActions}>
                      <button className={styles.taskActionBtn} onClick={() => setCommentModal(task._id)} title="Comments">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                      </button>
                      <button className={styles.taskActionBtn} onClick={() => openEditTask(task)} title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        className={`${styles.taskActionBtn} ${styles.deleteTaskBtn}`}
                        onClick={() => handleDeleteTask(task._id)}
                        disabled={deletingTask === task._id}
                        title="Delete"
                      >
                        {deletingTask === task._id ? <Spinner size={12} /> : (
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
        </div>
      )}

      {/* Board Tab */}
      {activeTab === 'board' && (
        <div className={styles.board}>
          {Object.entries({ todo: 'To Do', 'in-progress': 'In Progress', completed: 'Completed' }).map(([key, label]) => {
            const colTasks = tasksByStatus[key] || [];
            const colors = { todo: 'var(--text-dim)', 'in-progress': 'var(--primary)', completed: 'var(--success)' };
            return (
              <div key={key} className={styles.boardCol}>
                <div className={styles.boardColHeader} style={{ borderTopColor: colors[key] }}>
                  <span className={styles.boardColTitle}>{label}</span>
                  <span className={styles.boardColCount}>{colTasks.length}</span>
                </div>
                <div className={styles.boardCards}>
                  {colTasks.map(task => {
                    const ps = priorityConfig[task.priority] || priorityConfig.medium;
                    return (
                      <div key={task._id} className={styles.boardCard}>
                        <div className={styles.boardCardTitle}>{task.title}</div>
                        {task.description && <p className={styles.boardCardDesc}>{task.description}</p>}
                        <div className={styles.boardCardFooter}>
                          <span className={styles.priorityBadge} style={{ color: ps.color, background: ps.bg }}>{ps.label}</span>
                          {task.assignedTo && <Avatar name={task.assignedTo.name} size={22} />}
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <div className={styles.boardEmpty}>No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className={styles.activity}>
          <div className={styles.activityList}>
            {tasks.slice(0, 20).map(task => (
              <div key={task._id} className={styles.activityItem}>
                <div className={styles.activityDot} />
                <div className={styles.activityContent}>
                  <span className={styles.activityText}>
                    Task <strong>"{task.title}"</strong> created
                  </span>
                  <span className={styles.activityTime}>{timeAgo(task.createdAt)}</span>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <EmptyState icon="📜" title="No activity yet" />}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={taskModal} onClose={() => { setTaskModal(false); setTaskForm(EMPTY_TASK); setTaskErrors({}); }} title="Add New Task">
        <TaskForm
          form={taskForm}
          setForm={setTaskForm}
          errors={taskErrors}
          users={users}
          onSubmit={handleCreateTask}
          onCancel={() => { setTaskModal(false); setTaskForm(EMPTY_TASK); }}
          saving={saving}
          submitLabel="Create Task"
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={editTaskModal} onClose={() => { setEditTaskModal(false); setEditTask(null); }} title="Edit Task">
        {editTask && (
          <TaskForm
            form={editTask}
            setForm={setEditTask}
            errors={taskErrors}
            users={users}
            onSubmit={handleUpdateTask}
            onCancel={() => { setEditTaskModal(false); setEditTask(null); }}
            saving={saving}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={editProjectModal} onClose={() => setEditProjectModal(false)} title="Edit Project">
        <form onSubmit={handleUpdateProject} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <FormGroup label="Title" required>
            <Input value={editProjectForm.title} onChange={e => setEditProjectForm(f => ({ ...f, title: e.target.value }))} />
          </FormGroup>
          <FormGroup label="Description">
            <Textarea value={editProjectForm.description} onChange={e => setEditProjectForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </FormGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FormGroup label="Status">
              <Select value={editProjectForm.status} onChange={e => setEditProjectForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </FormGroup>
            <FormGroup label="Priority">
              <Select value={editProjectForm.priority} onChange={e => setEditProjectForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormGroup>
          </div>
          <FormGroup label="Due Date">
            <Input type="date" value={editProjectForm.dueDate} onChange={e => setEditProjectForm(f => ({ ...f, dueDate: e.target.value }))} />
          </FormGroup>
          <FormGroup label="Color">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {PROJECT_COLORS.map(color => (
                <button key={color} type="button"
                  style={{ width: 28, height: 28, borderRadius: '50%', background: color, border: editProjectForm.color === color ? '3px solid var(--text)' : '3px solid transparent', cursor: 'pointer' }}
                  onClick={() => setEditProjectForm(f => ({ ...f, color }))}
                />
              ))}
            </div>
          </FormGroup>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setEditProjectModal(false)} style={{ padding: '9px 18px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '14px' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ padding: '9px 20px', background: 'var(--primary)', border: 'none', borderRadius: '9px', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Comment Modal */}
      {commentModal && (
        <Modal isOpen={!!commentModal} onClose={() => { setCommentModal(null); setCommentText(''); }} title="Task Comments" size="md">
          {(() => {
            const task = tasks.find(t => t._id === commentModal);
            if (!task) return null;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  {task.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                  {task.comments?.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px', fontSize: '14px' }}>No comments yet</div>}
                  {task.comments?.map(c => (
                    <div key={c._id} style={{ display: 'flex', gap: '10px' }}>
                      <Avatar name={c.user?.name} size={30} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '13px', color: 'var(--text)' }}>{c.user?.name}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{timeAgo(c.createdAt)}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '8px' }}>{c.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Add a comment…"
                    rows={2}
                    style={{ flex: 1, padding: '9px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', fontFamily: 'var(--font)', outline: 'none', resize: 'none' }}
                  />
                  <button onClick={() => handleAddComment(commentModal)} disabled={!commentText.trim()}
                    style={{ padding: '9px 16px', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', cursor: commentText.trim() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '13px', opacity: commentText.trim() ? 1 : 0.5 }}>
                    Post
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}

function TaskForm({ form, setForm, errors, users, onSubmit, onCancel, saving, submitLabel }) {
  const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <FormGroup label="Title" required error={errors.title}>
        <Input placeholder="Task title" value={form.title} onChange={change('title')} error={errors.title} />
      </FormGroup>
      <FormGroup label="Description">
        <Textarea placeholder="Optional description…" value={form.description} onChange={change('description')} rows={3} />
      </FormGroup>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <FormGroup label="Priority">
          <Select value={form.priority} onChange={change('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </FormGroup>
        <FormGroup label="Status">
          <Select value={form.status} onChange={change('status')}>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>
        </FormGroup>
      </div>
      <FormGroup label="Assign To">
        <Select value={form.assignedTo} onChange={change('assignedTo')}>
          <option value="">Unassigned</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
        </Select>
      </FormGroup>
      <FormGroup label="Due Date">
        <Input type="date" value={form.dueDate} onChange={change('dueDate')} />
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
