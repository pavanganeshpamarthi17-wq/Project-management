import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/common/SEO';
import { ProgressBar, Card, Spinner } from '../components/common/UI';
import { formatDate, timeAgo, priorityConfig, statusConfig } from '../utils/helpers';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService.getDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <Spinner size={32} color="var(--primary)" />
    </div>
  );

  const { stats = {}, recentProjects = [], recentTasks = [] } = data || {};

  const pieData = [
    { name: 'Completed', value: stats.completedTasks || 0, color: '#34d399' },
    { name: 'In Progress', value: stats.inProgressTasks || 0, color: '#4f8ef7' },
    { name: 'To Do', value: stats.pendingTasks || 0, color: '#8892b0' }
  ].filter(d => d.value > 0);

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects || 0, icon: '📁', color: 'var(--primary)', bg: 'var(--primary-glow)' },
    { label: 'Total Tasks', value: stats.totalTasks || 0, icon: '📋', color: 'var(--purple)', bg: 'var(--purple-bg)' },
    { label: 'Completed', value: stats.completedTasks || 0, icon: '✅', color: 'var(--success)', bg: 'var(--success-bg)' },
    { label: 'Pending', value: stats.pendingTasks || 0, icon: '⏳', color: 'var(--warning)', bg: 'var(--warning-bg)' }
  ];

  return (
    <div className={styles.page}>
      <SEO title="Dashboard" description="View your ProjectFlow workspace stats, total projects, tasks status, overdue alerts, and overall progress." />
      <div className={styles.welcome}>
        <div>
          <h2>Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h2>
          <p>{formatDate(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link to="/projects/new" className={styles.newBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Project
        </Link>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        {statCards.map((card) => (
          <Card key={card.label} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div className={styles.statValue}>{card.value}</div>
            <div className={styles.statLabel}>{card.label}</div>
            {stats.totalTasks > 0 && card.label !== 'Total Projects' && (
              <div className={styles.statPct} style={{ color: card.color }}>
                {Math.round((card.value / stats.totalTasks) * 100)}%
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className={styles.twoCol}>
        {/* Task Distribution Chart */}
        <Card style={{ padding: '24px' }}>
          <h3 className={styles.sectionTitle}>Task Distribution</h3>
          {pieData.length > 0 ? (
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: '8px', fontSize: '13px', color: 'var(--text)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.legend}>
                {pieData.map(d => (
                  <div key={d.name} className={styles.legendItem}>
                    <div className={styles.legendDot} style={{ background: d.color }} />
                    <span>{d.name}</span>
                    <strong>{d.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.emptyChart}>No tasks yet</div>
          )}
        </Card>

        {/* Recent Tasks */}
        <Card style={{ padding: '24px' }}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Tasks</h3>
            <Link to="/tasks" className={styles.viewAll}>View all</Link>
          </div>
          <div className={styles.taskList}>
            {recentTasks.slice(0, 6).map(task => {
              const s = statusConfig[task.status] || statusConfig.todo;
              const p = priorityConfig[task.priority] || priorityConfig.medium;
              return (
                <div key={task._id} className={styles.taskItem}>
                  <div className={styles.taskDot} style={{ background: p.color }} />
                  <div className={styles.taskInfo}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.taskProject}>{task.projectId?.title}</span>
                  </div>
                  <span className={styles.taskBadge} style={{ color: s.color, background: s.bg }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
            {recentTasks.length === 0 && (
              <div className={styles.emptyChart}>No tasks yet</div>
            )}
          </div>
        </Card>
      </div>

      {/* Projects Progress */}
      {recentProjects.length > 0 && (
        <Card style={{ padding: '24px' }}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Project Progress</h3>
            <Link to="/projects" className={styles.viewAll}>View all</Link>
          </div>
          <div className={styles.projectList}>
            {recentProjects.map(project => (
              <Link key={project._id} to={`/projects/${project._id}`} className={styles.projectItem}>
                <div className={styles.projectColor} style={{ background: project.color || 'var(--primary)' }} />
                <div className={styles.projectInfo}>
                  <div className={styles.projectHeader}>
                    <span className={styles.projectTitle}>{project.title}</span>
                    <span className={styles.projectPct}>{project.progress}%</span>
                  </div>
                  <ProgressBar value={project.progress} color={project.color || 'var(--primary)'} height={5} />
                  <span className={styles.projectMeta}>{project.taskCount} tasks · {project.completedCount} done</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Alert cards */}
      {(stats.overdueTasks > 0 || stats.highPriorityTasks > 0) && (
        <div className={styles.alerts}>
          {stats.overdueTasks > 0 && (
            <div className={styles.alert} style={{ borderColor: 'rgba(248,113,113,0.3)', background: 'var(--danger-bg)' }}>
              <span style={{ color: 'var(--danger)' }}>⚠️ {stats.overdueTasks} overdue task{stats.overdueTasks !== 1 ? 's' : ''}</span>
              <Link to="/tasks?status=overdue" style={{ color: 'var(--danger)', fontSize: '13px' }}>Review →</Link>
            </div>
          )}
          {stats.highPriorityTasks > 0 && (
            <div className={styles.alert} style={{ borderColor: 'rgba(251,191,36,0.3)', background: 'var(--warning-bg)' }}>
              <span style={{ color: 'var(--warning)' }}>🔴 {stats.highPriorityTasks} high-priority task{stats.highPriorityTasks !== 1 ? 's' : ''} pending</span>
              <Link to="/tasks?priority=high" style={{ color: 'var(--warning)', fontSize: '13px' }}>View →</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};
