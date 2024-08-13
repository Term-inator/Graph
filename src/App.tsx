// App.tsx
import React, { useEffect, useState } from 'react';
import { Drawer, ToggleButtonGroup, ToggleButton } from '@mui/material';
import styled from '@emotion/styled';
import { debounce } from 'lodash';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


import { Graph } from './graph';
import { GraphCanvas } from './components/graphCanvas';
import { DynamicForm } from './components/dynamicForm';
import { ToolTypes } from './tools';
import { GraphProvider, useGraph } from './useGraph';

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


interface PropertyDrawerProps {
  drawerVisible: boolean;
  changeHandler: (value: any) => void;
}


const PropertyDrawer = ({ drawerVisible, changeHandler }: PropertyDrawerProps) => {
  const { selectedItems } = useGraph();

  const PropertyHeader = styled('div')`
    padding: 10px;
    font-size: 20px;
    font-weight:
  `;

  return (
    <Drawer
      anchor={"right"}
      open={drawerVisible}
      ModalProps={{ hideBackdrop: true }}
      sx={{ width: 0 }}
    >
      <PropertyHeader>Properties</PropertyHeader>
      <DynamicForm 
        properties={selectedItems.length === 1 ? selectedItems[0].properties : {}}
        propertiesValue={selectedItems.length === 1 ? selectedItems[0].propertiesValue : {}}
        onChange={changeHandler}
      />
    </Drawer>
  );
}


const GraphEditor = () => {
  const [graph, setGraph] = useState<Graph>(new Graph())
  const { selectedItems, setSelectedItems } = useGraph();
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleToolSelect = (tool: string) => {
    // if the selected tool is active, deactivate it; otherwise, activate it and deactivate the others
    setActiveTool(activeTool === tool ? null : tool);
  };

  const changeHandler = (value: any) => {
    const selectedNode = graph.getNodeById(selectedItems[0].id);
    selectedNode?.setPropertiesValue(value);
    selectedItems[0].setPropertiesValue(value);
    setSelectedItems([selectedItems[0]]);
  };

  const debouncedChangeHandler = debounce(changeHandler, 300);

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
      <PropertyDrawer
        drawerVisible={drawerVisible}
        changeHandler={debouncedChangeHandler}
      />
    </div>
  );
};


export const App: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <GraphProvider>
          <GraphEditor />
        </GraphProvider>
      </div>
    </DndProvider>
  );
};
