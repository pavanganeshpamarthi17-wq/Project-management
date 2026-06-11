import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import SEO from '../components/common/SEO';
import { Card, ProgressBar, Badge, Spinner, EmptyState } from '../components/common/UI';
import { formatDate, projectStatusConfig, priorityConfig } from '../utils/helpers';
import toast from 'react-hot-toast';
import styles from './Projects.module.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.getAll({ search, status: statusFilter });
      setProjects(res.data.projects);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchProjects, 300);
    return () => clearTimeout(t);
  }, [fetchProjects]);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!confirm('Delete this project and all its tasks?')) return;
    setDeleting(id);
    try {
      await projectService.delete(id);
      setProjects(p => p.filter(x => x._id !== id));
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className={styles.page}>
      <SEO title="Projects" description="Explore, filter, search, and manage all active, completed, on-hold, or cancelled projects." />
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Link to="/projects/new" className={styles.createBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Project
        </Link>
      </div>

      {loading ? (
        <div className={styles.loading}><Spinner size={28} color="var(--primary)" /></div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon="📁"
          title={search ? 'No projects found' : 'No projects yet'}
          description={search ? 'Try different keywords' : 'Create your first project to get started'}
          action={!search && (
            <Link to="/projects/new" className={styles.createBtn} style={{ textDecoration: 'none' }}>
              Create project
            </Link>
          )}
        />
      ) : (
        <div className={styles.grid}>
          {projects.map(project => {
            const sc = projectStatusConfig[project.status] || projectStatusConfig.active;
            const pc = priorityConfig[project.priority] || priorityConfig.medium;
            return (
              <Link key={project._id} to={`/projects/${project._id}`} className={styles.projectCard}>
                <div className={styles.cardAccent} style={{ background: project.color || 'var(--primary)' }} />
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>{project.title}</div>
                    <div className={styles.cardActions} onClick={e => e.preventDefault()}>
                      <button
                        className={styles.editBtn}
                        onClick={() => navigate(`/projects/${project._id}`)}
                        title="View project"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={(e) => handleDelete(project._id, e)}
                        disabled={deleting === project._id}
                        title="Delete project"
                      >
                        {deleting === project._id ? <Spinner size={12} /> : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {project.description && (
                    <p className={styles.cardDesc}>{project.description}</p>
                  )}

                  <div className={styles.cardBadges}>
                    <span className={styles.badge} style={{ color: sc.color, background: sc.bg }}>
                      {sc.label}
                    </span>
                    <span className={styles.badge} style={{ color: pc.color, background: pc.bg }}>
                      {pc.label} priority
                    </span>
                  </div>

                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span className={styles.progressLabel}>Progress</span>
                      <span className={styles.progressPct}>{project.taskStats?.progress || 0}%</span>
                    </div>
                    <ProgressBar
                      value={project.taskStats?.progress || 0}
                      color={project.color || 'var(--primary)'}
                      height={5}
                    />
                    <div className={styles.taskStats}>
                      <span>{project.taskStats?.completed || 0} / {project.taskStats?.total || 0} tasks</span>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.ownerInfo}>
                      <div className={styles.ownerAvatar}>
                        {project.owner?.name?.[0]?.toUpperCase()}
                      </div>
                      <span>{project.owner?.name}</span>
                    </div>
                    <span className={styles.cardDate}>{formatDate(project.createdAt)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
