'use client';

import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Calendar, Clock, GitBranch, AlertCircle, CheckCircle2, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  name: string;
  duration: number;
  dependencies: string[];
  startDate?: Date;
  endDate?: Date;
  color?: string;
}

interface TaskInput {
  name: string;
  duration: string;
  dependencies: string[];
}

interface ValidationError {
  taskIndex: number;
  field: string;
  message: string;
}

const COLORS = [
  'bg-gradient-to-r from-blue-500 to-blue-600',
  'bg-gradient-to-r from-emerald-500 to-emerald-600',
  'bg-gradient-to-r from-amber-500 to-amber-600',
  'bg-gradient-to-r from-purple-500 to-purple-600',
  'bg-gradient-to-r from-rose-500 to-rose-600',
  'bg-gradient-to-r from-indigo-500 to-indigo-600',
  'bg-gradient-to-r from-pink-500 to-pink-600',
  'bg-gradient-to-r from-teal-500 to-teal-600',
];

export default function GanttChartGenerator() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInputs, setTaskInputs] = useState<TaskInput[]>([
    { name: '', duration: '', dependencies: [] }
  ]);
  const [projectStartDate, setProjectStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const addTaskInput = () => {
    setTaskInputs([...taskInputs, { name: '', duration: '', dependencies: [] }]);
  };

  const removeTaskInput = (index: number) => {
    if (taskInputs.length > 1) {
      const newInputs = taskInputs.filter((_, i) => i !== index);
      // Nettoyer les dépendances qui référencent la tâche supprimée
      newInputs.forEach(task => {
        task.dependencies = task.dependencies.filter(dep => dep !== index.toString());
      });
      setTaskInputs(newInputs);
    }
  };

  const updateTaskInput = (index: number, field: keyof TaskInput, value: any) => {
    const newInputs = [...taskInputs];
    newInputs[index][field] = value;
    setTaskInputs(newInputs);
  };

  const validateTasks = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    taskInputs.forEach((task, index) => {
      if (!task.name.trim()) {
        errors.push({
          taskIndex: index,
          field: 'name',
          message: 'Le nom de la tâche est requis'
        });
      }
      
      if (!task.duration.trim() || parseInt(task.duration) <= 0) {
        errors.push({
          taskIndex: index,
          field: 'duration',
          message: 'La durée doit être un nombre positif'
        });
      }
    });

    return errors;
  };

  const calculateTaskSchedule = useCallback((tasks: Task[], startDate: Date): Task[] => {
    const scheduledTasks: Task[] = [];
    const taskMap = new Map<string, Task>();

    tasks.forEach(task => {
      taskMap.set(task.id, { ...task });
    });

    const scheduleTask = (taskId: string, visited: Set<string> = new Set()): Task => {
      if (visited.has(taskId)) {
        throw new Error(`Dépendance circulaire détectée pour la tâche: ${taskId}`);
      }

      const task = taskMap.get(taskId);
      if (!task) {
        throw new Error(`Tâche non trouvée: ${taskId}`);
      }

      if (task.startDate && task.endDate) {
        return task;
      }

      visited.add(taskId);

      let earliestStart = new Date(startDate);

      for (const depId of task.dependencies) {
        const depTask = scheduleTask(depId, new Set(visited));
        if (depTask.endDate && depTask.endDate >= earliestStart) {
          earliestStart = new Date(depTask.endDate.getTime() + 24 * 60 * 60 * 1000);
        }
      }

      task.startDate = earliestStart;
      task.endDate = new Date(earliestStart.getTime() + (task.duration - 1) * 24 * 60 * 60 * 1000);

      visited.delete(taskId);
      return task;
    };

    tasks.forEach(task => {
      scheduleTask(task.id);
    });

    return Array.from(taskMap.values());
  }, []);

  const generateGanttChart = () => {
    const errors = validateTasks();
    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    try {
      const validTasks: Task[] = taskInputs
        .filter(input => input.name.trim() && input.duration.trim())
        .map((input, index) => ({
          id: `task-${index}`,
          name: input.name.trim(),
          duration: parseInt(input.duration),
          dependencies: input.dependencies.map(depIndex => `task-${depIndex}`),
          color: COLORS[index % COLORS.length],
        }));

      const startDate = new Date(projectStartDate);
      const scheduledTasks = calculateTaskSchedule(validTasks, startDate);
      setTasks(scheduledTasks);
    } catch (error) {
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const getAvailableDependencies = (currentIndex: number) => {
    return taskInputs
      .map((task, index) => ({ task, index }))
      .filter(({ task, index }) => 
        index !== currentIndex && 
        task.name.trim() !== ''
      );
  };

  const getTaskError = (taskIndex: number, field: string) => {
    return validationErrors.find(error => 
      error.taskIndex === taskIndex && error.field === field
    );
  };

  const renderGanttChart = () => {
    if (tasks.length === 0) return null;

    const minDate = Math.min(...tasks.map(t => t.startDate!.getTime()));
    const maxDate = Math.max(...tasks.map(t => t.endDate!.getTime()));
    const totalDays = Math.ceil((maxDate - minDate) / (24 * 60 * 60 * 1000)) + 1;

    const getTaskPosition = (task: Task) => {
      const startOffset = Math.floor((task.startDate!.getTime() - minDate) / (24 * 60 * 60 * 1000));
      const width = task.duration;
      return { left: (startOffset / totalDays) * 100, width: (width / totalDays) * 100 };
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };

    return (
      <div className="mt-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Diagramme de Gantt
          </h2>
        </div>
        
        <div className="mb-6 relative">
          <div className="flex justify-between text-sm text-gray-600 font-medium mb-3">
            <span className="px-3 py-1 bg-gray-100 rounded-full">{formatDate(new Date(minDate))}</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">{formatDate(new Date(maxDate))}</span>
          </div>
          <div className="h-10 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl relative border border-gray-200">
            {Array.from({ length: totalDays }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full border-r border-gray-200"
                style={{ left: `${(i / totalDays) * 100}%`, width: `${100 / totalDays}%` }}
              >
                <div className="text-xs text-center pt-2 text-gray-500">
                  {i % Math.ceil(totalDays / 10) === 0 && (
                    new Date(minDate + i * 24 * 60 * 60 * 1000).getDate()
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {tasks.map((task, index) => {
            const position = getTaskPosition(task);
            return (
              <div key={task.id} className="group">
                <div className="flex items-center mb-3">
                  <div className="w-56 text-sm font-semibold text-gray-700 truncate">
                    {task.name}
                  </div>
                  <div className="flex-1 relative h-10 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    <div
                      className={`absolute top-1 bottom-1 ${task.color} rounded-lg shadow-lg flex items-center justify-center text-white text-xs font-medium transition-all duration-300 hover:shadow-xl`}
                      style={{
                        left: `${position.left}%`,
                        width: `${position.width}%`,
                      }}
                    >
                      <span className="truncate px-3 font-medium">
                        {task.duration}j
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-56 text-xs text-gray-500 flex items-center gap-6">
                  <span className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                    <Clock className="w-3 h-3" />
                    {formatDate(task.startDate!)} - {formatDate(task.endDate!)}
                  </span>
                  {task.dependencies.length > 0 && (
                    <span className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full">
                      <GitBranch className="w-3 h-3" />
                      {task.dependencies.length} dépendance(s)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{tasks.length}</div>
              <div className="text-sm text-blue-700 font-medium">Tâches</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200">
              <div className="text-3xl font-bold text-emerald-600">{totalDays}</div>
              <div className="text-sm text-emerald-700 font-medium">Jours totaux</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(tasks.reduce((sum, task) => sum + task.duration, 0) / tasks.length)}
              </div>
              <div className="text-sm text-purple-700 font-medium">Durée moyenne</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 font-bold text-slate-800">
            <div className="relative">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>
            <span className="text-xl">TaskFlow Pro</span>
          </div>
          
          <nav className="flex items-center gap-1">
            <Link href='/gantt'>
            <button className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-all duration-200">
              Diagramme de Gantt
            </button>
            </Link>
            <Link href='/pert'>
            <button className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-all duration-200">
              Diagramme de PERT
            </button>
            </Link>
            <button className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-all duration-200">
              Aide
            </button>
          </nav>
        </div>
      </header>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-4">
            Générateur de Diagramme de Gantt
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Planifiez vos projets en définissant les tâches, leurs durées et dépendances avec une interface moderne et intuitive
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Configuration du Projet
            </h2>
          </div>
          
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Date de début du projet
            </label>
            <input
              type="date"
              value={projectStartDate}
              onChange={(e) => setProjectStartDate(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            />
          </div>

          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Erreurs de validation</h3>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>
                    Tâche {error.taskIndex + 1}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Tâches du Projet
              </h3>
            </div>
            
            {taskInputs.map((taskInput, index) => (
              <div key={index} className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom de la tâche
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Conception du produit"
                      value={taskInput.name}
                      onChange={(e) => updateTaskInput(index, 'name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm ${
                        getTaskError(index, 'name') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {getTaskError(index, 'name') && (
                      <p className="text-xs text-red-600 mt-1">{getTaskError(index, 'name')?.message}</p>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Durée (jours)
                    </label>
                    <input
                      type="number"
                      placeholder="5"
                      min="1"
                      value={taskInput.duration}
                      onChange={(e) => updateTaskInput(index, 'duration', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm ${
                        getTaskError(index, 'duration') ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {getTaskError(index, 'duration') && (
                      <p className="text-xs text-red-600 mt-1">{getTaskError(index, 'duration')?.message}</p>
                    )}
                  </div>
                  
                  <div className="col-span-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dépendances
                    </label>
                    <select
                      multiple
                      value={taskInput.dependencies.map(String)}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                        updateTaskInput(index, 'dependencies', values);
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm min-h-[48px]"
                    >
                      {getAvailableDependencies(index).map(({ task, index: taskIndex }) => (
                        <option key={taskIndex} value={taskIndex} className="py-2">
                          {task.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl/Cmd pour sélectionner plusieurs tâches</p>
                  </div>
                  
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeTaskInput(index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={taskInputs.length === 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={addTaskInput}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Plus className="w-5 h-5" />
                Ajouter une tâche
              </button>
              
              <button
                type="button"
                onClick={generateGanttChart}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                <CheckCircle2 className="w-5 h-5" />
                Générer le Diagramme
              </button>
            </div>
          </div>
        </div>

        {renderGanttChart()}

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Guide d'utilisation
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-semibold text-gray-700">Nom de la tâche :</span> Donnez un nom descriptif et unique à chaque tâche
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-semibold text-gray-700">Durée :</span> Indiquez la durée en jours ouvrables (nombre entier positif)
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-semibold text-gray-700">Dépendances :</span> Sélectionnez les tâches qui doivent être terminées avant celle-ci
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-semibold text-gray-700">Validation :</span> Le système vérifie automatiquement les erreurs et dépendances circulaires
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}