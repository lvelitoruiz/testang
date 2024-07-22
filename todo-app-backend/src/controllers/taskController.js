const Task = require("../models/Task");
const { CATEGORIES, PRIORITIES } = require("../models/Task");

exports.getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find()
        .select(
          "-_id taskId title description completed priority imageUrl category createdAt"
        )
        .skip(startIndex)
        .limit(limit),
      Task.countDocuments(),
    ]);

    res.json({
      tasks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTasks: total,
    });
  } catch (error) {
    console.error("Error in getAllTasks:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.createTask = async (req, res) => {
  console.log("task created: ", req.body);
  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    priority: req.body.priority,
    category: req.body.category,
    imageUrl: req.body.imageUrl,
  });

  try {
    const newTask = await task.save();
    res.status(201).json({
      taskId: newTask.taskId,
      title: newTask.title,
      description: newTask.description,
      completed: newTask.completed,
      priority: newTask.priority,
      category: newTask.category,
      imageUrl: newTask.imageUrl,
      createdAt: newTask.createdAt,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ taskId: req.params.id }).select(
      "-_id taskId title description completed priority imageUrl category createdAt"
    );
    if (task == null) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.filterTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.priority) filter.priority = req.query.priority;

    const tasks = await Task.find(filter).select(
      "-_id taskId title description completed priority imageUrl category createdAt"
    );
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ taskId: req.params.id });
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTaskByTitle = async (req, res) => {
  try {
    const result = await Task.deleteOne({ title: req.body.title });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTaskByMongoId = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.mongoId);
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { taskId: req.params.id },
      {
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        category: req.body.category,
        imageUrl: req.body.imageUrl,
        completed: req.body.completed,
      },
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.toggleTaskComplete = async (req, res) => {
  try {
    const task = await Task.findOne({ taskId: req.params.id });
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    res.json(CATEGORIES);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPriorities = async (req, res) => {
  try {
    res.json(PRIORITIES);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
