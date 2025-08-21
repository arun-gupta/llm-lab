'use client';

import { useEffect, useRef, useState } from 'react';

interface GraphNode {
  id: string;
  label: string;
  type: 'person' | 'organization' | 'concept' | 'document';
  connections: number;
}

interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  weight: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    topEntities: string[];
  };
}

interface GraphPreviewProps {
  graphData: GraphData;
}

interface NodePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function GraphPreview({ graphData }: GraphPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const nodePositions = useRef<Map<string, NodePosition>>(new Map());
  const animationId = useRef<number>();

  // Color scheme for different node types
  const nodeColors = {
    person: '#3B82F6',      // Blue
    organization: '#10B981', // Green
    concept: '#8B5CF6',     // Purple
    document: '#F59E0B'     // Amber
  };

  // Initialize node positions in a circle layout
  const initializePositions = () => {
    const centerX = 400;
    const centerY = 200;
    const radius = 150;
    
    graphData.nodes.forEach((node, index) => {
      const angle = (index / graphData.nodes.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      nodePositions.current.set(node.id, {
        x,
        y,
        vx: 0,
        vy: 0
      });
    });
  };

  // Force-directed graph simulation
  const simulate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Apply forces
    graphData.nodes.forEach(node => {
      const pos = nodePositions.current.get(node.id);
      if (!pos) return;

      // Repulsion between nodes
      graphData.nodes.forEach(otherNode => {
        if (node.id === otherNode.id) return;
        const otherPos = nodePositions.current.get(otherNode.id);
        if (!otherPos) return;

        const dx = pos.x - otherPos.x;
        const dy = pos.y - otherPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0 && distance < 100) {
          const force = (100 - distance) / distance * 0.1;
          pos.vx += (dx / distance) * force;
          pos.vy += (dy / distance) * force;
        }
      });

      // Attraction for connected nodes
      graphData.edges.forEach(edge => {
        if (edge.source === node.id) {
          const targetPos = nodePositions.current.get(edge.target);
          if (targetPos) {
            const dx = targetPos.x - pos.x;
            const dy = targetPos.y - pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              const force = (distance - 80) / distance * 0.01;
              pos.vx += (dx / distance) * force;
              pos.vy += (dy / distance) * force;
            }
          }
        }
      });

      // Damping
      pos.vx *= 0.95;
      pos.vy *= 0.95;

      // Update position
      pos.x += pos.vx;
      pos.y += pos.vy;

      // Keep nodes within bounds
      pos.x = Math.max(50, Math.min(width - 50, pos.x));
      pos.y = Math.max(50, Math.min(height - 50, pos.y));
    });
  };

  // Draw the graph
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw edges
    graphData.edges.forEach(edge => {
      const sourcePos = nodePositions.current.get(edge.source);
      const targetPos = nodePositions.current.get(edge.target);
      
      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;
        
        ctx.beginPath();
        ctx.moveTo(targetPos.x, targetPos.y);
        ctx.lineTo(
          targetPos.x - arrowLength * Math.cos(angle - arrowAngle),
          targetPos.y - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(targetPos.x, targetPos.y);
        ctx.lineTo(
          targetPos.x - arrowLength * Math.cos(angle + arrowAngle),
          targetPos.y - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw nodes
    graphData.nodes.forEach(node => {
      const pos = nodePositions.current.get(node.id);
      if (!pos) return;

      const isSelected = selectedNode === node.id;
      const isHovered = hoveredNode === node.id;
      const color = nodeColors[node.type] || '#6B7280';
      
      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isSelected ? 12 : isHovered ? 10 : 8, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      
      if (isSelected || isHovered) {
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Node label
      ctx.fillStyle = '#1F2937';
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Truncate long labels
      const maxLength = 15;
      const label = node.label.length > maxLength 
        ? node.label.substring(0, maxLength) + '...' 
        : node.label;
      
      ctx.fillText(label, pos.x, pos.y + 20);
      
      // Connection count badge
      if (node.connections > 0) {
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(pos.x + 8, pos.y - 8, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillText(node.connections.toString(), pos.x + 8, pos.y - 8);
      }
    });

    ctx.restore();
  };

  // Animation loop
  const animate = () => {
    simulate();
    draw();
    animationId.current = requestAnimationFrame(animate);
  };

  // Mouse event handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Check for node hover
    let foundHover = false;
    graphData.nodes.forEach(node => {
      const pos = nodePositions.current.get(node.id);
      if (pos) {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance < 15) {
          setHoveredNode(node.id);
          foundHover = true;
          canvas.style.cursor = 'pointer';
        }
      }
    });

    if (!foundHover) {
      setHoveredNode(null);
      canvas.style.cursor = 'default';
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Check for node click
    graphData.nodes.forEach(node => {
      const pos = nodePositions.current.get(node.id);
      if (pos) {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance < 15) {
          setSelectedNode(selectedNode === node.id ? null : node.id);
        }
      }
    });
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(2, prev * delta)));
  };

  // Initialize and start animation
  useEffect(() => {
    if (graphData && graphData.nodes.length > 0) {
      initializePositions();
      animate();
    }

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [graphData]);

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>No graph data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">Person</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Organization</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600">Concept</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {graphData.nodes.length} nodes, {graphData.edges.length} edges
        </div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-64 border border-gray-200 rounded-lg cursor-default"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onWheel={handleWheel}
        />
        
        {selectedNode && (
          <div className="absolute top-2 left-2 bg-white border border-gray-200 rounded-lg p-3 shadow-lg max-w-xs">
            <h4 className="font-medium text-sm mb-1">Selected Node</h4>
            <p className="text-xs text-gray-600 mb-2">
              {graphData.nodes.find(n => n.id === selectedNode)?.label}
            </p>
            <p className="text-xs text-gray-500">
              Type: {graphData.nodes.find(n => n.id === selectedNode)?.type}
            </p>
            <p className="text-xs text-gray-500">
              Connections: {graphData.nodes.find(n => n.id === selectedNode)?.connections}
            </p>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        💡 Tip: Click nodes to select, scroll to zoom, hover for details
      </div>
    </div>
  );
}
