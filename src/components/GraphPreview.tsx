'use client';

/**
 * GraphPreview Component
 * 
 * Graph Visualization Library: Custom HTML5 Canvas Implementation
 * 
 * This component implements a custom force-directed graph visualization using:
 * - HTML5 Canvas API for rendering
 * - Custom force-directed layout algorithm
 * - React hooks for state management and animations
 * - No external graph visualization libraries
 * 
 * Features:
 * - Force-directed node positioning with repulsion and attraction forces
 * - Interactive node selection and hover effects
 * - Zoom and pan functionality
 * - Color-coded nodes by type (person, organization, concept, document)
 * - Connection count badges
 * - Responsive canvas sizing
 * 
 * Alternative libraries that could be used instead:
 * - D3.js (d3-force for force-directed layouts)
 * - Cytoscape.js (comprehensive graph library)
 * - Vis.js (network visualization)
 * - React Force Graph (React wrapper for D3)
 * - Three.js (3D graph visualization)
 * 
 * @param graphData - Graph data containing nodes, edges, and statistics
 */
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.2; // Smaller radius for tighter initial layout
    
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
        
        if (distance > 0 && distance < 120) {
          const force = (120 - distance) / distance * 0.15;
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

      // Strong centering force - pull nodes towards the center
      const centerX = width / 2;
      const centerY = height / 2;
      const dx = centerX - pos.x;
      const dy = centerY - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const centeringForce = 0.05; // Very strong centering force
        pos.vx += (dx / distance) * centeringForce;
        pos.vy += (dy / distance) * centeringForce;
      }

      // Boundary force - push nodes away from edges
      const margin = 100;
      if (pos.x < margin) {
        pos.vx += (margin - pos.x) * 0.02;
      } else if (pos.x > width - margin) {
        pos.vx += (width - margin - pos.x) * 0.02;
      }
      
      if (pos.y < margin) {
        pos.vy += (margin - pos.y) * 0.02;
      } else if (pos.y > height - margin) {
        pos.vy += (height - margin - pos.y) * 0.02;
      }

      // Damping
      pos.vx *= 0.98;
      pos.vy *= 0.98;

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

    // Get the container dimensions
    const container = canvas.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    // Set canvas size to match container
    canvas.width = rect.width;
    canvas.height = rect.height;

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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Convert mouse position to canvas coordinates, accounting for zoom and pan
    const x = ((e.clientX - rect.left) * scaleX - pan.x) / zoom;
    const y = ((e.clientY - rect.top) * scaleY - pan.y) / zoom;

    // Check for node hover
    let foundHover = false;
    graphData.nodes.forEach(node => {
      const pos = nodePositions.current.get(node.id);
      if (pos) {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance < 20) {
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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Convert mouse position to canvas coordinates, accounting for zoom and pan
    const x = ((e.clientX - rect.left) * scaleX - pan.x) / zoom;
    const y = ((e.clientY - rect.top) * scaleY - pan.y) / zoom;

    // Check for node click
    graphData.nodes.forEach(node => {
      const pos = nodePositions.current.get(node.id);
      if (pos) {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance < 20) {
          setSelectedNode(selectedNode === node.id ? null : node.id);
          return; // Exit early after finding a node
        }
      }
    });
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom * delta));
    
    // Zoom towards mouse position
    const zoomFactor = newZoom / zoom;
    setPan(prev => ({
      x: mouseX - (mouseX - prev.x) * zoomFactor,
      y: mouseY - (mouseY - prev.y) * zoomFactor
    }));
    
    setZoom(newZoom);
  };

  // Initialize and start animation
  useEffect(() => {
    if (graphData && graphData.nodes.length > 0) {
      initializePositions();
      animate();
      
      // Periodic re-centering every 3 seconds
      const recenterInterval = setInterval(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          
          // Calculate current graph center
          let avgX = 0, avgY = 0;
          let count = 0;
          graphData.nodes.forEach(node => {
            const pos = nodePositions.current.get(node.id);
            if (pos) {
              avgX += pos.x;
              avgY += pos.y;
              count++;
            }
          });
          
          if (count > 0) {
            avgX /= count;
            avgY /= count;
            
            // If graph has drifted significantly, apply extra centering force
            const driftX = centerX - avgX;
            const driftY = centerY - avgY;
            const driftDistance = Math.sqrt(driftX * driftX + driftY * driftY);
            
            if (driftDistance > 50) {
              graphData.nodes.forEach(node => {
                const pos = nodePositions.current.get(node.id);
                if (pos) {
                  pos.vx += driftX * 0.01;
                  pos.vy += driftY * 0.01;
                }
              });
            }
          }
        }
      }, 3000);
      
      return () => {
        clearInterval(recenterInterval);
        if (animationId.current) {
          cancelAnimationFrame(animationId.current);
        }
      };
    }

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [graphData]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Reinitialize positions when canvas size changes
      if (graphData && graphData.nodes.length > 0) {
        initializePositions();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [graphData]);

  // Redraw when zoom or pan changes
  useEffect(() => {
    if (graphData && graphData.nodes.length > 0) {
      draw();
    }
  }, [zoom, pan]);

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
          className="w-full h-64 border border-gray-200 rounded-lg cursor-default"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onWheel={handleWheel}
        />
        
        {/* Zoom controls */}
        <div className="absolute top-2 right-2 flex flex-col space-y-1">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                // Zoom in
                setZoom(prev => Math.min(3, prev * 1.2));
              }}
              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50"
              title="Zoom in"
            >
              🔍+
            </button>
            <button
              onClick={() => {
                // Zoom out
                setZoom(prev => Math.max(0.5, prev * 0.8));
              }}
              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50"
              title="Zoom out"
            >
              🔍-
            </button>
            <button
              onClick={() => {
                // Reset zoom and pan
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50"
              title="Reset view"
            >
              🔄
            </button>
            <button
              onClick={() => {
                // Reinitialize positions to center the graph
                initializePositions();
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50"
              title="Center graph"
            >
              🎯
            </button>
          </div>
          <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 text-center">
            {Math.round(zoom * 100)}%
          </div>
        </div>
        
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
