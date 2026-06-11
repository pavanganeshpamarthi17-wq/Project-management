const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getProjects = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    };

    if (search) {
      query.$and = [
        { $or: [{ owner: req.user._id }, { members: req.user._id }] },
        { $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]}
      ];
      delete query.$or;
    }

    if (status) query.status = status;

    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Project.countDocuments(query);

    // Attach task stats to each project
    const projectsWithStats = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ projectId: project._id });
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalTasks = tasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      return {
        ...project.toObject(),
        taskStats: { total: totalTasks, completed: completedTasks, progress }
      };
    }));

    res.json({
      success: true,
      projects: projectsWithStats,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const tasks = await Task.find({ projectId: project._id })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      project: {
        ...project.toObject(),
        taskStats: { total: totalTasks, completed: completedTasks, progress }
      },
      tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { title, description, members, status, priority, dueDate, color } = req.body;

    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
      members: members || [],
      status,
      priority,
      dueDate,
      color
    });

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can update this project' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can delete this project' });
    }

    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project and all associated tasks deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }]
    });

    const projectIds = projects.map(p => p._id);
    const tasks = await Task.find({ projectId: { $in: projectIds } });

    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'todo').length;

    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;

    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    const recentProjects = await Project.find({
      $or: [{ owner: userId }, { members: userId }]
    })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentTasks = await Task.find({ projectId: { $in: projectIds } })
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title color')
      .sort({ createdAt: -1 })
      .limit(10);

    // Task status breakdown by project
    const projectStats = await Promise.all(recentProjects.map(async (project) => {
      const projectTasks = tasks.filter(t => t.projectId.toString() === project._id.toString());
      const completed = projectTasks.filter(t => t.status === 'completed').length;
      const total = projectTasks.length;
      return {
        ...project.toObject(),
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        taskCount: total,
        completedCount: completed
      };
    }));

    res.json({
      success: true,
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        highPriorityTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      recentProjects: projectStats,
      recentTasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
