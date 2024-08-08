import { Node, Link } from './types';

export interface ToolType {
  value: string;
  description: string;
  Icon: any;
  ClassComponent?: any;
}

export const ToolTypes: { [key: string]: ToolType } = {
  SELECT: {
    value: "Select",
    description: "Select elements",
    Icon: null
  },
  NODE: {
    value: "Node",
    description: "Add nodes",
    Icon: null,
    ClassComponent: Node
  },
  LINK: {
    value: "Link",
    description: "Add links",
    Icon: null,
    ClassComponent: Link
  }
};