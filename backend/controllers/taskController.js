const Task = require('../models/Task');
const Project = require('../models/Project');

const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { allowed: false, message: 'Project not found' };
  const isOwner = project.owner.toString() === userId.toString();
  const isMember = project.members.some(m => m.toString() === userId.toString());
  if (!isOwner && !isMember) return { allowed: false, message: 'Access denied to this project' };
  return { allowed: true, project };
};

exports.getTasks = async (req, res) => {
  try {
    const { projectId, status, priority, assignedTo, search } = req.query;

    const accessibleProjects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    }).select('_id');

    const accessibleProjectIds = accessibleProjects.map(p => p._id);
    const query = { projectId: { $in: accessibleProjectIds } };

    if (projectId) {
      const { allowed } = await checkProjectAccess(projectId, req.user._id);
      if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });
      query.projectId = projectId;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) query.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'title color')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'title color')
      .populate('comments.user', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { allowed } = await checkProjectAccess(task.projectId, req.user._id);
    if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, status, dueDate, tags } = req.body;

    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project is required' });
    }

    const { allowed } = await checkProjectAccess(projectId, req.user._id);
    if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority,
      status,
      dueDate,
      tags
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('projectId', 'title color');

    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { allowed } = await checkProjectAccess(task.projectId, req.user._id);
    if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

    const { comments, ...updateData } = req.body;

    task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'title color')
      .populate('comments.user', 'name email');

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { allowed } = await checkProjectAccess(task.projectId, req.user._id);
    if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Comment text is required' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { allowed } = await checkProjectAccess(task.projectId, req.user._id);
    if (!allowed) return res.status(403).json({ success: false, message: 'Access denied' });

    task.comments.push({ user: req.user._id, text });
    await task.save();

    await task.populate('comments.user', 'name email');
    res.json({ success: true, comments: task.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await task.save();

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
