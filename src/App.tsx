// App.tsx
import React, { useRef, useState } from 'react';
import { Drawer, ToggleButtonGroup, ToggleButton, Button, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions } from '@mui/material';
import styled from '@emotion/styled';
import { debounce, set } from 'lodash';
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

  console.log(selectedItems);

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


const GraphEditor = ({ graph, setGraph }) => {
  const { selectedItems, setSelectedItems } = useGraph();
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleToolSelect = (tool: string) => {
    // if the selected tool is active, deactivate it; otherwise, activate it and deactivate the others
    setActiveTool(activeTool === tool ? null : tool);
  };

  const changeHandler = (value: any) => {
    console.log(111111,value);
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
  const [graph, setGraph] = useState<Graph>(new Graph());
  const [openDialog, setOpenDialog] = useState(false);
  const [fileName, setFileName] = useState('graph.json');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    if (files && files[0]) {
      fileReader.readAsText(files[0], 'UTF-8');
      fileReader.onload = e => {
        const json = e.target?.result;
        if (typeof json === 'string') {
          graph.fromJSON(json);
        }
      };
    }
  };

  const handleExport = () => {
    if (!fileName) {
      alert('Please enter a file name.');
      return;
    }

    const json = JSON.stringify(graph.toJSON());
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setOpenDialog(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Button onClick={() => fileInputRef.current?.click()}>Import Graph</Button>
      <input
        type="file"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleImport}
      />
      <Button onClick={() => setOpenDialog(true)}>Export Graph</Button>
      <div className="app">
        <GraphProvider>
          <GraphEditor graph={graph} setGraph={setGraph}/>
        </GraphProvider>
      </div>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Export Graph</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter a file name for your graph JSON file.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="File Name"
            type="text"
            fullWidth
            variant="standard"
            value={fileName}
            onChange={e => setFileName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleExport}>Export</Button>
        </DialogActions>
      </Dialog>
    </DndProvider>
  );
};
