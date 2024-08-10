// App.tsx
import React, { useState } from 'react';
import { Drawer, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Graph } from './graph';
import { GraphCanvas } from './graphCanvas';
import { ToolType, ToolTypes } from './tools';

interface ToolbarProps {
  className: string;
  activeTool: string | null;
  setActiveTool: (tool: string) => void;
}

const Toolbar = ({ className, activeTool, setActiveTool }: ToolbarProps) => {
  const handleToolChange = (event: React.MouseEvent<HTMLElement>, newTool: string | null) => {
    if (newTool !== null) {
      setActiveTool(newTool);
    }
  };

  return (
    <div className={className}>
      <ToggleButtonGroup
        orientation="vertical"
        value={activeTool}
        exclusive
        onChange={handleToolChange}
        aria-label="tool selection"
        sx={{ width: 60, position: 'absolute', top: 20, left: 0 }}
      >
        {Object.values(ToolTypes).map((tool) => (
          <ToggleButton key={tool.value} value={tool.value} aria-label={tool.value.toLowerCase()}>
            {tool.Icon ? <tool.Icon /> : tool.value}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
};

const GraphEditor = () => {
  const [graph, setGraph] = useState<Graph>(new Graph());

  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleToolSelect = (tool: string) => {
    // if the selected tool is active, deactivate it; otherwise, activate it and deactivate the others
    setActiveTool(activeTool === tool ? null : tool);
  };

  return (
    <div className="graph-editor">
      <Toolbar 
        className="toolbar"
        activeTool={activeTool} 
        setActiveTool={handleToolSelect} 
      />
      <GraphCanvas
        className="graph-canvas"
        graph={graph}
        activeTool={activeTool}
        setGraph={setGraph}
        setActiveTool={setActiveTool}
        setDrawerVisible={setDrawerVisible}
      />
      <Drawer
        title="Node Properties"
        anchor={"right"}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        ModalProps={{ hideBackdrop: true }}  // hide the backdrop to prevent clicking on the canvas
        sx={{ width: 300 }}
      >
        {/* Node properties form goes here */}
        <div>123</div>
      </Drawer>
    </div>
  );
};


export const App: React.FC = () => {
  return (
    <div className="app">
      <GraphEditor />
    </div>
  );
};
