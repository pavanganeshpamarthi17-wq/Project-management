import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService, userService } from '../services/projectService';
import { FormGroup, Input, Textarea, Select } from '../components/common/Form';
import { PROJECT_COLORS } from '../utils/helpers';
import toast from 'react-hot-toast';
import styles from './CreateProject.module.css';

export default function CreateProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', status: 'active', priority: 'medium',
    dueDate: '', color: PROJECT_COLORS[0], members: []
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    userService.getAll().then(res => setUsers(res.data.users)).catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length < 2) e.title = 'Title must be at least 2 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await projectService.create(form);
      toast.success('Project created!');
      navigate(`/projects/${res.data.project._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const change = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }));
  };

  const toggleMember = (userId) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(userId)
        ? f.members.filter(id => id !== userId)
        : [...f.members, userId]
    }));
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
      </div>

      <div className={styles.layout}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Create New Project</h2>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <FormGroup label="Project Title" required error={errors.title}>
              <Input
                placeholder="e.g. Website Redesign"
                value={form.title}
                onChange={change('title')}
                error={errors.title}
              />
            </FormGroup>

            <FormGroup label="Description">
              <Textarea
                placeholder="Describe the project goals and scope…"
                value={form.description}
                onChange={change('description')}
                rows={4}
              />
            </FormGroup>

            <div className={styles.twoCol}>
              <FormGroup label="Status">
                <Select value={form.status} onChange={change('status')}>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </FormGroup>

              <FormGroup label="Priority">
                <Select value={form.priority} onChange={change('priority')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </FormGroup>
            </div>

            <FormGroup label="Due Date">
              <Input type="date" value={form.dueDate} onChange={change('dueDate')} />
            </FormGroup>

            <FormGroup label="Project Color">
              <div className={styles.colorGrid}>
                {PROJECT_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`${styles.colorBtn} ${form.color === color ? styles.colorSelected : ''}`}
                    style={{ background: color }}
                    onClick={() => setForm(f => ({ ...f, color }))}
                  />
                ))}
              </div>
            </FormGroup>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>

        {/* Members Panel */}
        <div className={styles.membersCard}>
          <h3 className={styles.membersTitle}>
            Add Members
            {form.members.length > 0 && (
              <span className={styles.memberCount}>{form.members.length}</span>
            )}
          </h3>
          <input
            className={styles.memberSearch}
            placeholder="Search users…"
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
          />
          <div className={styles.memberList}>
            {filteredUsers.length === 0 ? (
              <div className={styles.noUsers}>No users found</div>
            ) : filteredUsers.map(u => (
              <div
                key={u._id}
                className={`${styles.memberItem} ${form.members.includes(u._id) ? styles.memberSelected : ''}`}
                onClick={() => toggleMember(u._id)}
              >
                <div className={styles.memberAvatar}>
                  {u.name[0].toUpperCase()}
                </div>
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{u.name}</span>
                  <span className={styles.memberEmail}>{u.email}</span>
                </div>
                <div className={styles.memberCheck}>
                  {form.members.includes(u._id) && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
