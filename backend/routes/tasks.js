const express = require('express');
const router = express.Router();
const {
  getTasks, getTask, createTask, updateTask, deleteTask, addComment, deleteComment
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.route('/:id/comments').post(addComment);
router.route('/:id/comments/:commentId').delete(deleteComment);

module.exports = router;
