// App.tsx
import React, { useState } from 'react';
import { Drawer, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Graph } from './graph';
import { GraphCanvas } from './graphCanvas';
import { ToolType, ToolTypes } from './tools';

interface ToolbarProps {
  activeTool: string | null;
  setActiveTool: (tool: string) => void;
}

const Toolbar = ({ activeTool, setActiveTool }: ToolbarProps) => {
  const handleToolChange = (event: React.MouseEvent<HTMLElement>, newTool: string | null) => {
    if (newTool !== null) {
      setActiveTool(newTool);
    }
  };

  return (
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
      <Toolbar activeTool={activeTool} setActiveTool={handleToolSelect} />
      <GraphCanvas
        graph={graph}
        activeTool={activeTool}
        setGraph={setGraph}
        setActiveTool={setActiveTool}
      />
      <Drawer
        title="Node Properties"
        size="large"
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {/* Node properties form goes here */}
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
