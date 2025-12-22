import React, { useState, useMemo, useEffect } from "react";
import { Trash2, Plus, Edit2, Divide, Calendar } from "lucide-react";
import {
  createTask,
  updateTask,
  deleteTask as deleteTaskAPI,

  deleteEvent as deleteEventAPI,
} from "../api/tasks";
// ... imports
// import { CreateEvent } from "./index.components"; // Removed CreateEvent import

const EventsPage = ({ tasks, events, onTasksUpdate, onEventsUpdate }) => {
  // Local form state
  const [taskDesc, setTaskDesc] = useState("");
  const [taskStart, setTaskStart] = useState("");
  const [taskEnd, setTaskEnd] = useState("");
  // const [isModalOpen, setIsModalOpen] = useState(false); // Removed modal state
  // const [editingEvent, setEditingEvent] = useState(null); // Removed event editing state
  const [editingTask, setEditingTask] = useState(null);

  // Removed handleOpenModal

  // open task in edit mode and prefill the task form
  const handleEditTask = (task) => {
    setTaskDesc(task.description || "");
    setTaskStart(task.startDate ? task.startDate.split("T")[0] : "");
    setTaskEnd(task.endDate ? task.endDate.split("T")[0] : "");
    setEditingTask(task);
    // scroll to top where the form is (optional)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Notification controls (Keep this logic for read-only events)
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [notificationOffset, setNotificationOffset] = useState("day");

  useEffect(() => {
    // ... (Keep existing notification logic)
    if (notificationPermission !== "granted" || notificationOffset === "none") return;
    // ...
    // ...
  }, [events, notificationOffset, notificationPermission]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  // Task handlers (Keep task handlers as students can manage their own tasks)
  const handleAddTask = async (e) => {
    // ... (Keep existing handleAddTask)
    e.preventDefault();
    if (!taskDesc || !taskStart || !taskEnd) return;

    try {
      if (editingTask && editingTask._id) {
        await updateTask(editingTask._id, {
          description: taskDesc,
          startDate: taskStart,
          endDate: taskEnd,
          isCompleted: !!editingTask.isCompleted,
        });
      } else {
        await createTask({
          description: taskDesc,
          startDate: taskStart,
          endDate: taskEnd,
        });
      }

      if (onTasksUpdate) await onTasksUpdate();

      setTaskDesc("");
      setTaskStart("");
      setTaskEnd("");
      setEditingTask(null);
    } catch (error) { // ...
      console.error("Error creating/updating task:", error);
      alert(`Failed to create/update task: ${error.response?.data?.message || error.message}`);
    }
  };

  const toggleTaskCompletion = async (id) => {
    // ... (Keep existing toggleTaskCompletion)
    const task = tasks.find((t) => t._id === id);
    if (!task) return;

    try {
      await updateTask(id, {
        description: task.description,
        startDate: task.startDate,
        endDate: task.endDate,
        isCompleted: !task.isCompleted,
      });
      if (onTasksUpdate) await onTasksUpdate();
    } catch (error) { //...
      console.error("Error updating task:", error);
      alert(`Failed to update task: ${error.response?.data?.message || error.message}`);
    }
  };

  const deleteTask = async (id) => {
    // ... (Keep existing deleteTask)
    try {
      await deleteTaskAPI(id);
      if (onTasksUpdate) await onTasksUpdate();
    } catch (error) { //...
      console.error("Error deleting task:", error);
      alert(`Failed to delete task: ${error.response?.data?.message || error.message}`);
    }
  };

  // Removed Event handlers (handleClose, deleteEvent, handleEditEvent)

  // Group tasks logic (Keep existing)
  const groupedTasks = useMemo(() => {
    // ...
    const groups = {};
    const sorted = [...tasks].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    sorted.forEach((t) => {
      const key = `${t.startDate}|${t.endDate}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    return Object.entries(groups).map(([key, items]) => {
      const [startDate, endDate] = key.split("|");
      const completedCount = items.filter((x) => x.isCompleted).length;
      const totalCount = items.length;
      const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
      return { startDate, endDate, tasks: items, completedCount, totalCount, percentage };
    });
  }, [tasks]);

  return (
    <div className="w-full max-w-full overflow-hidden p-3 md:p-6 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-900 space-y-4 md:space-y-8 overflow-y-auto">
      {/* Tasks Section */}
      <section>
        <h2 className="text-lg md:text-3xl font-bold mb-2 md:mb-4">Task Planner - Manage Your Tasks</h2>
        {/* ... (Keep existing form and task list) */}
        <form onSubmit={handleAddTask} className="bg-gray-50 p-3 md:p-4 rounded-lg mb-4 md:mb-6 flex flex-col md:flex-row gap-3 md:gap-4 items-end border border-gray-200">
          {/* ... form content ... */}
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700">Task Description</label>
            <input type="text" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="e.g., Complete math assignment" className="mt-1 w-full bg-white text-gray-900 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" value={taskStart} onChange={(e) => setTaskStart(e.target.value)} className="mt-1 w-full bg-white text-gray-900 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors" />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">Target Date</label>
              <input type="date" value={taskEnd} onChange={(e) => setTaskEnd(e.target.value)} className="mt-1 w-full bg-white text-gray-900 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button type="submit" className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex justify-center items-center gap-2 transition-colors shadow-sm whitespace-nowrap h-[50px]">
              <Plus className="w-5 h-5" /> {editingTask ? "Update" : "Add Task"}
            </button>
            {editingTask && (
              <button type="button" onClick={() => { setTaskDesc(""); setTaskStart(""); setTaskEnd(""); setEditingTask(null); }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors h-[50px]">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-6">
          {/* ... Task List ... */}
          {groupedTasks.map((group, idx) => {
            const startDateStr = new Date(group.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
            const endDateStr = new Date(group.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

            return (
              <div key={idx} className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-base md:text-lg mb-2 text-gray-900">Tasks for {startDateStr} - {endDateStr}</h3>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${group.percentage}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{group.completedCount} / {group.totalCount} completed ({Math.round(group.percentage)}%)</span>
                </div>
                <div className="space-y-3">
                  {group.tasks.map((task) => (
                    <div key={task._id} className="bg-white p-2 md:p-3 rounded-lg border border-gray-200 flex items-center justify-between gap-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input type="checkbox" checked={!!task.isCompleted} onChange={() => toggleTaskCompletion(task._id)} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 flex-shrink-0" />
                        <p className={`font-semibold text-sm md:text-base break-words leading-tight ${task.isCompleted ? "line-through text-gray-400" : "text-gray-900"}`}>{task.description}</p>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                        <button onClick={() => handleEditTask(task)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors hover:bg-blue-50 rounded-full" title="Edit task"><Edit2 className="w-4 h-4 md:w-5 md:h-5" /></button>
                        <button onClick={() => deleteTask(task._id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4 md:w-5 md:h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {tasks.length === 0 && <p className="text-gray-500">You have no tasks. Add one above!</p>}
        </div>
      </section>


      {/* Modal logic removed */}
    </div>
  );
};

export default EventsPage;
