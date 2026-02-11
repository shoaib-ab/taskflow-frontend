import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const getTasks = async (filters = {}) => {
    try {
      setLoading(true);

      const query = new URLSearchParams(filters).toString();
      const response = await api.get(`/tasks/mytasks?${query}`);
      setTasks(response.data);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (data) => {
    try {
      setLoading(true);
      await api.post('/tasks', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await getTasks();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id, data) => {
    try {
      setLoading(true);
      await api.put(`/tasks/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await getTasks();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/tasks/${id}`);
      await getTasks();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaskContext.Provider
      value={{ tasks, loading, getTasks, addTask, updateTask, deleteTask }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
