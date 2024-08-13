import React, { createContext, useContext, useState } from "react";
import { Node } from "./types";

interface GraphContextType {
  selectedItems: Node[];
  setSelectedItems: (nodes: Node[]) => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}


export const GraphProvider: React.FC<Props> = ({ children }: Props) => {
  const [selectedItems, setSelectedItems] = useState<Node[]>([]);

  return (
    <GraphContext.Provider value={{ selectedItems, setSelectedItems }}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error("useGraph must be used within a GraphProvider");
  }
  return context;
};