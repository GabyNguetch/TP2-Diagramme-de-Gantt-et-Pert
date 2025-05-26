'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Calendar, Clock, GitBranch, AlertCircle, CheckCircle2, Target, Zap, Route, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  name: string;
  duration: number;
  dependencies: string[];
  earliestStart?: number;
  latestStart?: number;
  earliestFinish?: number;
  latestFinish?: number;
  totalFloat?: number;
  isCritical?: boolean;
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

interface PertNode {
  id: string;
  x: number;
  y: number;
  earliestTime: number;
  latestTime: number;
  isStart?: boolean;
  isEnd?: boolean;
}

interface PertEdge {
  from: string;
  to: string;
  taskId: string;
  taskName: string;
  duration: number;
  isCritical: boolean;
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

export default function ModernPertDiagramGenerator() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInputs, setTaskInputs] = useState<TaskInput[]>([
    { name: '', duration: '', dependencies: [] }
  ]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [pertNodes, setPertNodes] = useState<PertNode[]>([]);
  const [pertEdges, setPertEdges] = useState<PertEdge[]>([]);
  const [criticalPath, setCriticalPath] = useState<string[]>([]);
  const [projectDuration, setProjectDuration] = useState(0);

  const addTaskInput = () => {
    setTaskInputs([...taskInputs, { name: '', duration: '', dependencies: [] }]);
  };

  const removeTaskInput = (index: number) => {
    if (taskInputs.length > 1) {
      const newInputs = taskInputs.filter((_, i) => i !== index);
      const updatedInputs = newInputs.map(task => ({
        ...task,
        dependencies: task.dependencies.filter(depIndex => 
          parseInt(depIndex) !== index && 
          parseInt(depIndex) < newInputs.length + (parseInt(depIndex) > index ? 0 : 1)
        ).map(depIndex => {
          const depIdx = parseInt(depIndex);
          return depIdx > index ? (depIdx - 1).toString() : depIndex;
        })
      }));
      setTaskInputs(updatedInputs);
    }
  };

  const updateTaskInput = (index: number, field: keyof TaskInput, value: string | string[]) => {
    const newInputs = [...taskInputs];
    if (field === 'dependencies') {
      newInputs[index][field] = value as string[];
    } else {
      newInputs[index][field] = value as string;
    }
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
      
      if (!task.duration.trim()) {
        errors.push({
          taskIndex: index,
          field: 'duration',
          message: 'La durée est requise'
        });
      } else if (parseInt(task.duration) <= 0) {
        errors.push({
          taskIndex: index,
          field: 'duration',
          message: 'La durée doit être supérieure à 0'
        });
      }
    });

    return errors;
  };

  const calculatePertTimes = useCallback((tasks: Task[]): Task[] => {
    const processedTasks = tasks.map(task => ({ ...task }));
    const taskMap = new Map<string, Task>();
    
    processedTasks.forEach(task => {
      taskMap.set(task.id, task);
    });

    // Calcul des temps au plus tôt (Forward Pass)
    const calculateEarliest = (taskId: string, visited: Set<string> = new Set()): void => {
      if (visited.has(taskId)) {
        throw new Error(`Dépendance circulaire détectée pour la tâche: ${taskId}`);
      }
      
      const task = taskMap.get(taskId);
      if (!task || task.earliestStart !== undefined) return;
      
      visited.add(taskId);
      
      let maxEarliestFinish = 0;
      
      for (const depId of task.dependencies) {
        calculateEarliest(depId, new Set(visited));
        const depTask = taskMap.get(depId);
        if (depTask && depTask.earliestFinish !== undefined) {
          maxEarliestFinish = Math.max(maxEarliestFinish, depTask.earliestFinish);
        }
      }
      
      task.earliestStart = maxEarliestFinish;
      task.earliestFinish = task.earliestStart + task.duration;
      
      visited.delete(taskId);
    };

    // Calculer tous les temps au plus tôt
    processedTasks.forEach(task => {
      calculateEarliest(task.id);
    });

    // Trouver la durée totale du projet
    const maxFinishTime = Math.max(...processedTasks.map(t => t.earliestFinish || 0));

    // Calcul des temps au plus tard (Backward Pass)
    const calculateLatest = (taskId: string, visited: Set<string> = new Set()): void => {
      if (visited.has(taskId)) return;
      
      const task = taskMap.get(taskId);
      if (!task || task.latestFinish !== undefined) return;
      
      visited.add(taskId);
      
      // Trouver les tâches qui dépendent de cette tâche
      const dependentTasks = processedTasks.filter(t => t.dependencies.includes(taskId));
      
      if (dependentTasks.length === 0) {
        // Tâche finale
        task.latestFinish = maxFinishTime;
      } else {
        let minLatestStart = Infinity;
        
        for (const depTask of dependentTasks) {
          calculateLatest(depTask.id, new Set(visited));
          if (depTask.latestStart !== undefined) {
            minLatestStart = Math.min(minLatestStart, depTask.latestStart);
          }
        }
        
        task.latestFinish = minLatestStart;
      }
      
      task.latestStart = task.latestFinish - task.duration;
      task.totalFloat = task.latestStart - task.earliestStart;
      task.isCritical = task.totalFloat === 0;
      
      visited.delete(taskId);
    };

    // Calculer tous les temps au plus tard
    processedTasks.forEach(task => {
      calculateLatest(task.id);
    });

    return processedTasks;
  }, []);

  const generatePertNetwork = useCallback((tasks: Task[]) => {
    const nodes: PertNode[] = [];
    const edges: PertEdge[] = [];
    const nodeMap = new Map<string, string>();
    
    // Créer le nœud de début
    const startNodeId = 'start';
    nodes.push({
      id: startNodeId,
      x: 100,
      y: 300,
      earliestTime: 0,
      latestTime: 0,
      isStart: true
    });

    // Créer les nœuds pour chaque tâche
    let nodeCounter = 1;
    const taskStartNodes = new Map<string, string>();
    const taskEndNodes = new Map<string, string>();

    tasks.forEach((task, index) => {
      const startNodeId = `node-${nodeCounter++}`;
      const endNodeId = `node-${nodeCounter++}`;
      
      taskStartNodes.set(task.id, startNodeId);
      taskEndNodes.set(task.id, endNodeId);
      
      // Position des nœuds (disposition en grille)
      const col = Math.floor(index / 3);
      const row = index % 3;
      const startX = 200 + col * 250;
      const startY = 150 + row * 150;
      
      nodes.push({
        id: startNodeId,
        x: startX,
        y: startY,
        earliestTime: task.earliestStart || 0,
        latestTime: task.latestStart || 0
      });
      
      nodes.push({
        id: endNodeId,
        x: startX + 150,
        y: startY,
        earliestTime: task.earliestFinish || 0,
        latestTime: task.latestFinish || 0
      });

      // Créer l'arête pour la tâche
      edges.push({
        from: startNodeId,
        to: endNodeId,
        taskId: task.id,
        taskName: task.name,
        duration: task.duration,
        isCritical: task.isCritical || false
      });
    });

    // Créer le nœud de fin
    const endNodeId = 'end';
    const maxFinishTime = Math.max(...tasks.map(t => t.earliestFinish || 0));
    nodes.push({
      id: endNodeId,
      x: 200 + Math.ceil(tasks.length / 3) * 250,
      y: 300,
      earliestTime: maxFinishTime,
      latestTime: maxFinishTime,
      isEnd: true
    });

    // Connecter le nœud de début aux tâches sans dépendances
    const tasksWithoutDeps = tasks.filter(t => t.dependencies.length === 0);
    tasksWithoutDeps.forEach(task => {
      const startNodeId = taskStartNodes.get(task.id);
      if (startNodeId) {
        edges.push({
          from: 'start',
          to: startNodeId,
          taskId: 'dummy-start-' + task.id,
          taskName: '',
          duration: 0,
          isCritical: false
        });
      }
    });

    // Connecter les tâches selon leurs dépendances
    tasks.forEach(task => {
      task.dependencies.forEach(depId => {
        const depEndNode = taskEndNodes.get(depId);
        const taskStartNode = taskStartNodes.get(task.id);
        if (depEndNode && taskStartNode) {
          edges.push({
            from: depEndNode,
            to: taskStartNode,
            taskId: `dep-${depId}-${task.id}`,
            taskName: '',
            duration: 0,
            isCritical: false
          });
        }
      });
    });

    // Connecter les tâches finales au nœud de fin
    const finalTasks = tasks.filter(task => 
      !tasks.some(t => t.dependencies.includes(task.id))
    );
    finalTasks.forEach(task => {
      const endNodeId = taskEndNodes.get(task.id);
      if (endNodeId) {
        edges.push({
          from: endNodeId,
          to: 'end',
          taskId: 'dummy-end-' + task.id,
          taskName: '',
          duration: 0,
          isCritical: false
        });
      }
    });

    setPertNodes(nodes);
    setPertEdges(edges);
    setProjectDuration(maxFinishTime);
    
    // Identifier le chemin critique
    const criticalTasks = tasks.filter(t => t.isCritical).map(t => t.id);
    setCriticalPath(criticalTasks);
  }, []);

  const generatePertDiagram = () => {
    setShowValidation(true);
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
        }));

      if (validTasks.length === 0) {
        alert('Veuillez ajouter au moins une tâche valide.');
        return;
      }

      const calculatedTasks = calculatePertTimes(validTasks);
      setTasks(calculatedTasks);
      generatePertNetwork(calculatedTasks);
      setShowValidation(false);
    } catch (error) {
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const getAvailableDependencies = (currentIndex: number) => {
    return taskInputs
      .map((task, index) => ({ task, index }))
      .filter(({ index }) => index !== currentIndex && taskInputs[index].name.trim())
      .map(({ task, index }) => ({ 
        value: index.toString(), 
        label: task.name.trim() || `Tâche ${index + 1}` 
      }));
  };

  const getTaskErrors = (taskIndex: number) => {
    return validationErrors.filter(error => error.taskIndex === taskIndex);
  };

const renderPertDiagram = () => {
  if (pertNodes.length === 0 || pertEdges.length === 0) return null;

  // Algorithme amélioré de positionnement des nœuds
  const calculateNodePositions = () => {
    const nodePositions = new Map();
    const nodeLevels = new Map();
    const processedNodes = new Set();
    
    // Identifier les niveaux hiérarchiques
    const calculateLevels = (nodeId, level = 0) => {
      if (processedNodes.has(nodeId)) return;
      processedNodes.add(nodeId);
      
      const currentLevel = nodeLevels.get(nodeId) || 0;
      nodeLevels.set(nodeId, Math.max(currentLevel, level));
      
      // Trouver les nœuds suivants
      const outgoingEdges = pertEdges.filter(edge => edge.from === nodeId);
      outgoingEdges.forEach(edge => {
        calculateLevels(edge.to, level + 1);
      });
    };
    
    // Commencer par le nœud de début
    calculateLevels('start', 0);
    
    // Organiser les nœuds par niveau
    const nodesByLevel = new Map();
    nodeLevels.forEach((level, nodeId) => {
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level).push(nodeId);
    });
    
    // Calculer les positions
    const levelWidth = 200;
    const nodeSpacing = 120;
    const maxNodesPerLevel = Math.max(...Array.from(nodesByLevel.values()).map(nodes => nodes.length));
    
    nodesByLevel.forEach((nodes, level) => {
      const x = 100 + level * levelWidth;
      const totalHeight = (nodes.length - 1) * nodeSpacing;
      const startY = 100 + (maxNodesPerLevel * nodeSpacing - totalHeight) / 2;
      
      nodes.forEach((nodeId, index) => {
        const y = startY + index * nodeSpacing;
        nodePositions.set(nodeId, { x, y });
      });
    });
    
    return { nodePositions, maxLevel: Math.max(...nodeLevels.values()) };
  };
  
  const { nodePositions, maxLevel } = calculateNodePositions();
  
  // Calculer la taille dynamique du SVG
  const svgWidth = Math.max(800, (maxLevel + 2) * 200);
  const svgHeight = Math.max(600, Math.max(...Array.from(nodePositions.values()).map(pos => pos.y)) + 150);
  
  // Fonction pour calculer le point de connexion optimal
  const getConnectionPoint = (fromPos, toPos, radius = 35) => {
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    return {
      from: {
        x: fromPos.x + unitX * radius,
        y: fromPos.y + unitY * radius
      },
      to: {
        x: toPos.x - unitX * radius,
        y: toPos.y - unitY * radius
      }
    };
  };

  return (
    <div className="mt-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
          <Route className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Diagramme PERT
        </h2>
      </div>
      
      <div className="bg-gray-50 rounded-2xl p-6 mb-6 overflow-auto max-h-[600px]">
        <svg 
          width={svgWidth} 
          height={svgHeight} 
          className="w-full h-auto min-w-[800px]"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Définir les marqueurs de flèches */}
          <defs>
            <marker 
              id="arrowhead" 
              markerWidth="12" 
              markerHeight="10" 
              refX="10" 
              refY="5" 
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 12 5, 0 10" fill="#6b7280" />
            </marker>
            <marker 
              id="arrowhead-critical" 
              markerWidth="12" 
              markerHeight="10" 
              refX="10" 
              refY="5" 
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 12 5, 0 10" fill="#dc2626" />
            </marker>
            
            {/* Filtre pour l'ombre */}
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Dessiner les arêtes avec connexions optimisées */}
          {pertEdges.map((edge, index) => {
            const fromPos = nodePositions.get(edge.from);
            const toPos = nodePositions.get(edge.to);
            
            if (!fromPos || !toPos) return null;
            
            const isCriticalEdge = edge.isCritical || criticalPath.includes(edge.taskId);
            const strokeColor = isCriticalEdge ? '#dc2626' : '#6b7280';
            const strokeWidth = isCriticalEdge ? 3 : 2;
            
            const connectionPoints = getConnectionPoint(fromPos, toPos);
            
            // Calculer la position de l'étiquette sur la ligne
            const midX = (connectionPoints.from.x + connectionPoints.to.x) / 2;
            const midY = (connectionPoints.from.y + connectionPoints.to.y) / 2;
            
            // Décaler l'étiquette perpendiculairement à la ligne
            const dx = connectionPoints.to.x - connectionPoints.from.x;
            const dy = connectionPoints.to.y - connectionPoints.from.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const offsetX = (-dy / length) * 25; // Décalage perpendiculaire
            const offsetY = (dx / length) * 25;
            
            const labelX = midX + offsetX;
            const labelY = midY + offsetY;
            
            return (
              <g key={`edge-${index}`}>
                {/* Ligne de connexion */}
                <line
                  x1={connectionPoints.from.x}
                  y1={connectionPoints.from.y}
                  x2={connectionPoints.to.x}
                  y2={connectionPoints.to.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={isCriticalEdge ? "url(#arrowhead-critical)" : "url(#arrowhead)"}
                  strokeDasharray={edge.duration === 0 ? "5,5" : "none"}
                  opacity={edge.duration === 0 ? 0.6 : 1}
                />
                
                {/* Étiquette de la tâche */}
                {edge.taskName && edge.duration > 0 && (
                  <g>
                    <rect
                      x={labelX - 40}
                      y={labelY - 20}
                      width="80"
                      height="40"
                      fill="white"
                      stroke={strokeColor}
                      strokeWidth="1"
                      rx="8"
                      filter="url(#shadow)"
                      opacity="0.95"
                    />
                    <text
                      x={labelX}
                      y={labelY - 5}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill={strokeColor}
                    >
                      {edge.taskName.length > 10 ? edge.taskName.substring(0, 10) + '...' : edge.taskName}
                    </text>
                    <text
                      x={labelX}
                      y={labelY + 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill={strokeColor}
                      fontWeight="600"
                    >
                      ({edge.duration}j)
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          
          {/* Dessiner les nœuds */}
          {pertNodes.map((node, index) => {
            const position = nodePositions.get(node.id);
            if (!position) return null;
            
            const isSpecialNode = node.isStart || node.isEnd;
            const nodeColor = isSpecialNode ? '#059669' : '#3b82f6';
            const textColor = 'white';
            const radius = isSpecialNode ? 40 : 35;
            
            return (
              <g key={`node-${index}`}>
                {/* Cercle du nœud avec ombre */}
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={radius}
                  fill={nodeColor}
                  stroke="white"
                  strokeWidth="3"
                  filter="url(#shadow)"
                />
                
                {/* Contenu du nœud */}
                {isSpecialNode ? (
                  <text
                    x={position.x}
                    y={position.y + 5}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill={textColor}
                  >
                    {node.isStart ? 'DÉBUT' : 'FIN'}
                  </text>
                ) : (
                  <>
                    {/* Temps au plus tôt */}
                    <text
                      x={position.x}
                      y={position.y - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill={textColor}
                    >
                      {node.earliestTime}
                    </text>
                    
                    {/* Ligne de séparation */}
                    <line
                      x1={position.x - 25}
                      y1={position.y}
                      x2={position.x + 25}
                      y2={position.y}
                      stroke={textColor}
                      strokeWidth="2"
                    />
                    
                    {/* Temps au plus tard */}
                    <text
                      x={position.x}
                      y={position.y + 15}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill={textColor}
                    >
                      {node.latestTime}
                    </text>
                  </>
                )}
                
                {/* ID du nœud (optionnel, pour debug) */}
                <text
                  x={position.x}
                  y={position.y + radius + 15}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#6b7280"
                  fontWeight="500"
                >
                  {node.id.replace('node-', 'N')}
                </text>
              </g>
            );
          })}
          
          {/* Légende du chemin critique */}
          <g transform="translate(20, 20)">
            <rect x="0" y="0" width="200" height="80" fill="white" stroke="#e5e7eb" strokeWidth="1" rx="8" opacity="0.95"/>
            <text x="10" y="20" fontSize="12" fontWeight="bold" fill="#374151">Légende</text>
            <line x1="10" y1="35" x2="40" y2="35" stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrowhead-critical)"/>
            <text x="45" y="40" fontSize="10" fill="#374151">Chemin critique</text>
            <line x1="10" y1="55" x2="40" y2="55" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <text x="45" y="60" fontSize="10" fill="#374151">Chemin normal</text>
          </g>
        </svg>
      </div>

      {/* Contrôles de zoom et navigation */}
      <div className="flex items-center gap-4 mb-6 bg-white/50 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Navigation:</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Utilisez la molette pour zoomer, glissez pour naviguer
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Chemin critique</span>
          <div className="w-3 h-3 bg-blue-500 rounded-full ml-4"></div>
          <span className="text-sm text-gray-600">Nœuds normaux</span>
          <div className="w-3 h-3 bg-emerald-500 rounded-full ml-4"></div>
          <span className="text-sm text-gray-600">Début/Fin</span>
        </div>
      </div>

      {/* Tableau récapitulatif */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Analyse des Tâches
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white rounded-lg">
                <th className="px-4 py-3 text-left font-semibold text-gray-800">Tâche</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-800">Durée</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-800">Début au + tôt</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-800">Fin au + tôt</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-800">Début au + tard</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-800">Fin au + tard</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-800">Marge totale</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-800">Critique</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {tasks.map((task, index) => (
                <tr key={task.id} className={`${task.isCritical ? 'bg-red-50' : 'bg-white'} rounded-lg`}>
                  <td className="px-4 py-3 font-medium text-gray-800">{task.name}</td>
                  <td className="px-4 py-3 text-center">{task.duration}</td>
                  <td className="px-4 py-3 text-center">{task.earliestStart}</td>
                  <td className="px-4 py-3 text-center">{task.earliestFinish}</td>
                  <td className="px-4 py-3 text-center">{task.latestStart}</td>
                  <td className="px-4 py-3 text-center">{task.latestFinish}</td>
                  <td className="px-4 py-3 text-center">{task.totalFloat}</td>
                  <td className="px-4 py-3 text-center">
                    {task.isCritical ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                        OUI
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        NON
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200/50">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Tâches</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{tasks.length}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200/50">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Durée projet</span>
            </div>
            <div className="text-3xl font-bold text-emerald-600">{projectDuration}j</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200/50">
            <div className="flex items-center gap-3 mb-2">
              <Route className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">Tâches critiques</span>
            </div>
            <div className="text-3xl font-bold text-red-600">{criticalPath.length}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200/50">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Durée moyenne</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {tasks.length > 0 ? Math.round(tasks.reduce((sum, task) => sum + task.duration, 0) / tasks.length) : 0}j
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 p-6">
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
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg">
              <Route className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-purple-800 to-pink-800 bg-clip-text text-transparent">
              Générateur de Diagramme PERT
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visualisez le réseau de vos tâches avec les temps au plus tôt et au plus tard, et identifiez le chemin critique
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Configuration du Projet</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Tâches du Projet</h3>
            </div>
            
            {showValidation && validationErrors.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h4 className="font-semibold text-red-800">Erreurs de validation :</h4>
                </div>
                <ul className="space-y-1 text-sm text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index}>
                      Tâche {error.taskIndex + 1} - {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {taskInputs.map((taskInput, index) => {
              const taskErrors = getTaskErrors(index);
              const hasErrors = showValidation && taskErrors.length > 0;
              
              return (
                <div key={index} className={`p-6 rounded-2xl border transition-all duration-200 ${
                  hasErrors 
                    ? 'bg-red-50/50 border-red-200' 
                    : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom de la tâche
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Conception UI/UX"
                        value={taskInput.name}
                        onChange={(e) => updateTaskInput(index, 'name', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                          hasErrors && taskErrors.some(e => e.field === 'name')
                            ? 'border-red-300 focus:ring-red-500 bg-red-50'
                            : 'border-gray-200 focus:ring-purple-500 focus:border-transparent bg-white/70'
                        }`}
                      />
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
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                          hasErrors && taskErrors.some(e => e.field === 'duration')
                            ? 'border-red-300 focus:ring-red-500 bg-red-50'
                            : 'border-gray-200 focus:ring-purple-500 focus:border-transparent bg-white/70'
                        }`}
                      />
                    </div>
                    
                    <div className="col-span-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dépendances
                      </label>
                      <select
                        multiple
                        value={taskInput.dependencies}
                        onChange={(e) => {
                          const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                          updateTaskInput(index, 'dependencies', selectedOptions);
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 transition-all duration-200"
                      >
                        {getAvailableDependencies(index).map(option => (
                          <option key={option.value} value={option.value} className="py-2">
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Maintenez Ctrl (Cmd sur Mac) pour sélectionner plusieurs tâches
                      </p>
                    </div>
                    
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={() => removeTaskInput(index)}
                        className="p-3 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200 disabled:opacity-50"
                        disabled={taskInputs.length === 1}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {taskInput.dependencies.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        Dépend de : {taskInput.dependencies.map(depIndex => 
                          taskInputs[parseInt(depIndex)]?.name || `Tâche ${parseInt(depIndex) + 1}`
                        ).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={addTaskInput}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Plus className="w-5 h-5" />
                Ajouter une tâche
              </button>
              
              <button
                type="button"
                onClick={generatePertDiagram}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                <CheckCircle2 className="w-5 h-5" />
                Générer le Diagramme PERT
              </button>
            </div>
          </div>
        </div>

        {renderPertDiagram()}

      </div>
    </div>
  );
}