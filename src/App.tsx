// App.tsx
import React, { useEffect, useState } from 'react';
import { Drawer, ToggleButtonGroup, ToggleButton } from '@mui/material';
import styled from '@emotion/styled';
import { debounce, set, get } from 'lodash';
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
  changeHandler: (key: string, value: any) => void;
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

  const changeHandler = (path: string, value: any) => {
    const selecteNode = selectedItems[0];
    if (!selecteNode) {
      return;
    }

    const pathParts = path.split('.');

    if (selecteNode.properties[pathParts[0]].type === 'property') {
      // insert 'properties' at the second position in the path
      pathParts.splice(1, 0, 'properties');
    }
  
    // 构建新的 value 路径
    const valuePath = `${pathParts.join('.')}.value`;

    // 检查给定路径下是否已有 value 字段
    const currentValue = get(selecteNode.properties, valuePath);

    // 如果 currentValue 未定义，则说明需要新增字段
    if (currentValue === undefined) {
      // 在指定路径创建新的 value 字段并设置其值
      set(selecteNode.properties, valuePath, value);
    } else {
      // 更新已存在的 value 字段
      set(selecteNode.properties, valuePath, value);
    }
    console.log(selecteNode.properties);
    const updatedNodes = graph.nodes.map(node => {
      if (node.id === selecteNode.id) {
        return selecteNode;
      }
      return node;
    });
    console.log("set")
    setGraph(new Graph(updatedNodes, graph.links));
  }

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
