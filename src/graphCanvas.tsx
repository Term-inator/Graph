import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import { Graph } from './graph';
import { ToolTypes } from './tools';
import { Node, Link } from './types';


function calculateEdgePoint(node: Node | undefined, target: Node | undefined) {
  if (!node || !target) {
    return { x: 0, y: 0 };
  }

  const dx = target.x - node.x;
  const dy = target.y - node.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) {
    return { x: node.x, y: node.y };
  }

  return {
    x: node.x + (dx * node.r) / dist,
    y: node.y + (dy * node.r) / dist,
  };
}

interface Props {
  graph: Graph;
  activeTool: string | null;
  setGraph: (graph: Graph) => void;
  setActiveTool: (tool: string | null) => void;
}

interface SelectionBox {
  startX: number | null;
  startY: number | null;
  width: number | null;
  height: number | null;
  isSelecting: boolean;
}

export const GraphCanvas = ({ graph, activeTool, setGraph, setActiveTool }: Props) => {
  const svgRef = useRef<SVGElement>(null);
  const [selectedItems, setSelectedItems] = useState<Node[]>([]);
  const [selectionBox, setSelectionBox] = useState<SelectionBox>({ startX: null, startY: null, width: null, height: null, isSelecting: false });
  const linkSource = useRef<Node | null>(null);

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (activeTool === ToolTypes.SELECT.value) {
      setSelectedItems([]);  // click on canvas to clear selection
    }
    else if (activeTool === ToolTypes.NODE.value) {
      const coords = d3.pointer(event);
      const newNode: Node = {
        id: `node-${graph.getNodeId()}`,
        type: activeTool.replace('add', ''),
        x: coords[0],
        y: coords[1],
        r: 20,
        properties: {}
      };
      graph.addNode(newNode);
      setGraph(new Graph([...graph.nodes], [...graph.links]));
      console.log('New node added:', newNode);
    }
  };

  const handleLinkNode = (event: React.MouseEvent<SVGSVGElement, MouseEvent>, node: Node) => {
    if (activeTool === ToolTypes.LINK.value) {
      if (linkSource.current && node !== linkSource.current) {
        // choose target node for link
        const newLink: Link = {
          sourceId: linkSource.current.id,
          targetId: node.id,
          properties: {}
        };
        graph.addLink(newLink);
        setGraph(new Graph([...graph.nodes], [...graph.links]));
        linkSource.current = null;  // reset link source
      } else {
        // set link source
        linkSource.current = node;
      }
    }
  };


  const handleSelection = (event: React.MouseEvent<SVGSVGElement, MouseEvent>, item: Node) => {
    let newSelectedItems;

    if (event.ctrlKey || event.metaKey) {
      // use Ctrl or Cmd key to toggle selection
      if (selectedItems.includes(item)) {
        newSelectedItems = selectedItems.filter(si => si !== item); // remove from selected list
      } else {
        newSelectedItems = [...selectedItems, item]; // add to selected list
      }
    } else {
      // select only the clicked item or clear selection
      newSelectedItems = selectedItems.includes(item) ? [] : [item];
    }

    console.log('Selected items:', newSelectedItems);

    setSelectedItems(newSelectedItems);
  };


  const handleNodeClick = (event: React.MouseEvent<SVGSVGElement, MouseEvent>, node: Node) => {
    event.stopPropagation();
    handleLinkNode(event, node);
    handleSelection(event, node);
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // remove existing defs and marker
    svg.selectAll('defs').remove();

    // create new defs and marker
    const defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)  // 确保 refX, refY 调整为合适的位置
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#333');

    // define drag behavior
    const drag = d3.drag<SVGCircleElement, Node>()
      .on("start", function (event: d3.D3DragEvent<SVGCircleElement, Node, unknown>, d: Node) {

      })
      .on("drag", function (event: d3.D3DragEvent<SVGCircleElement, Node, unknown>, d: Node) {
        if (activeTool === ToolTypes.SELECT.value) {
          if (selectedItems.includes(d)) {
            d3.select(svgRef.current).select(`circle#${d.id}`).raise()
            const dx = event.dx;
            const dy = event.dy;

            // update position of selected nodes
            selectedItems.forEach(item => {
              const node = graph.getNodeById(item.id);
              if (!node) {
                return;
              }
              node.x += dx;
              node.y += dy;

              d3.select(svgRef.current).select(`circle#${node.id}`)
                .attr("cx", node.x)
                .attr("cy", node.y);

              // update position of connected edges
              svg.selectAll("line")
                .filter(l => l.sourceId === node.id || l.targetId === node.id)
                .attr("x1", l => calculateEdgePoint(graph.getNodeById(l.sourceId), graph.getNodeById(l.targetId)).x)
                .attr("y1", l => calculateEdgePoint(graph.getNodeById(l.sourceId), graph.getNodeById(l.targetId)).y)
                .attr("x2", l => calculateEdgePoint(graph.getNodeById(l.targetId), graph.getNodeById(l.sourceId)).x)
                .attr("y2", l => calculateEdgePoint(graph.getNodeById(l.targetId), graph.getNodeById(l.sourceId)).y);
            });
          }
        }
        else {
          // while dragging a node, reset link source
          linkSource.current = null;
          d3.select(this).raise();
        }
      })
      .on("end", function (event: d3.D3DragEvent<SVGCircleElement, Node, unknown>, d: Node) {

      });

    // handle canvas click
    svg.on('click', handleCanvasClick);

    // draw and update nodes
    const nodes = svg.selectAll("circle")
      .data(graph.nodes, d => d.id);

    nodes.enter()
      .append("circle")
      .attr("id", d => d.id)
      .attr("r", 20)
      .style("fill", "steelblue")
      .style("cursor", "pointer")
      .merge(nodes)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("class", d => selectedItems.includes(d) ? "selected" : "")
      .on('click', (event, d) => {
        handleNodeClick(event, d);
      })
      .call(drag);

    nodes.exit().remove();


    // draw and update links
    const links = svg.selectAll("line")
      .data(graph.links, d => `${d.sourceId}-${d.targetId}`);

    links.enter()
      .append("line")
      .merge(links)
      .attr("x1", l => calculateEdgePoint(graph.getNodeById(l.sourceId), graph.getNodeById(l.targetId)).x)
      .attr("y1", l => calculateEdgePoint(graph.getNodeById(l.sourceId), graph.getNodeById(l.targetId)).y)
      .attr("x2", l => calculateEdgePoint(graph.getNodeById(l.targetId), graph.getNodeById(l.sourceId)).x)
      .attr("y2", l => calculateEdgePoint(graph.getNodeById(l.targetId), graph.getNodeById(l.sourceId)).y)
      .style("stroke", "#333")
      .style("stroke-width", 2)
      .style("cursor", "pointer")
      .attr("marker-end", "url(#arrow)")

    links.exit().remove();


  }, [graph, activeTool, setGraph, selectedItems]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        const nodesToKeep = graph.nodes.filter(n => !selectedItems.includes(n));
        const linksToKeep = graph.links.filter(l => !selectedItems.includes(l));

        setGraph(new Graph(nodesToKeep, linksToKeep));
        setSelectedItems([]); // clear selection
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedItems, graph, setGraph]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    function handleMouseDown(event: React.MouseEvent<SVGSVGElement, MouseEvent>) {
      const [x, y] = d3.pointer(event);
      setSelectionBox({ startX: x, startY: y, width: 0, height: 0, isSelecting: true });
      console.log(selectionBox)
    }

    function handleMouseMove(event: React.MouseEvent<SVGSVGElement, MouseEvent>) {
      if (selectionBox.isSelecting) {
        const [x, y] = d3.pointer(event);

        if (selectionBox.startX === null || selectionBox.startY === null) {
          return;
        }

        const width = Math.abs(x - selectionBox.startX);
        const height = Math.abs(y - selectionBox.startY);
        const startX = Math.min(x, selectionBox.startX);
        const startY = Math.min(y, selectionBox.startY);
        setSelectionBox(prev => ({ ...prev, startX, startY, width, height }));
      }
    }

    function handleMouseUp(event: React.MouseEvent<SVGSVGElement, MouseEvent>) {
      if (selectionBox.isSelecting) {
        // Perform the selection
        const selected = selectNodesInArea(selectionBox);
        if (event.ctrlKey || event.metaKey) {
          // use Ctrl or Cmd key to add to selection
          setSelectedItems([...selectedItems, ...selected]);
        }
        else {
          setSelectedItems(selected);
          console.log('Selected items:', selected);
        }
        setSelectionBox(prev => ({ ...prev, isSelecting: false }));
      }
    }

    svg.on('mousedown', handleMouseDown);
    svg.on('mousemove', handleMouseMove);
    svg.on('mouseup', handleMouseUp);

    return () => {
      svg.on('mousedown', null);
      svg.on('mousemove', null);
      svg.on('mouseup', null);
    };
  }, [selectionBox]);

  function selectNodesInArea(box: SelectionBox) {
    if (!box.startX || !box.startY || !box.width || !box.height) {
      return [];
    }

    const selected = graph.nodes.filter(node => {
      return node.x >= box.startX && node.x <= box.startX + box.width &&
        node.y >= box.startY && node.y <= box.startY + box.height;
    });
    return selected
  }


  return (
    <svg ref={svgRef} width="800" height="600">
      {selectionBox.isSelecting && (
        <rect fill="rgba(0, 0, 255, 0.2)" stroke="blue"
          x={selectionBox.startX as number} y={selectionBox.startY as number}
          width={selectionBox.width as number} height={selectionBox.height as number}
        />
      )}
      {/* Render nodes and links here */}
    </svg>
  );
};

export default GraphCanvas;
