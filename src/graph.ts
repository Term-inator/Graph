import { Node, Link } from './types';
import { ToolTypes } from './tools';

export class Graph {
  nodes: Node[] = [];
  links: Link[] = [];
  nodeId: number = 0;

  constructor(nodes: Node[] = [], links: Link[] = []) {
    this.nodes = nodes;
    this.links = links;
    this.nodeId = Math.max(...nodes.map(node => {
      return parseInt(node.id.replace('node-', ''))
    }), 0) + 1;
  }

  getNodeId() {
    return this.nodeId++;
  }

  addNode(node: Node) {
    this.nodes.push(node);
  }

  removeNode(nodeId: string) {
    this.nodes = this.nodes.filter(node => node.id !== nodeId);
    this.links = this.links.filter(link => link.sourceId !== nodeId && link.targetId !== nodeId);
  }

  getNodeById(nodeId: string): Node | undefined {
    return this.nodes.find(node => node.id === nodeId);
  }

  addLink(link: Link) {
    // check if a link between these nodes already exists
    if (!this.links.some(l => (l.sourceId === link.sourceId && l.targetId === link.targetId) ||
      (l.sourceId === link.targetId && l.targetId === link.sourceId))) {
      this.links.push(link);
    } else {
      console.log("A link between these nodes already exists.");
    }
  }

  removeLink(sourceId: string, targetId: string) {
    this.links = this.links.filter(link => link.sourceId !== sourceId && link.targetId !== targetId);
  }

  fromJSON(json: any) {
    this.nodes = [];
    this.links = [];
    this.nodeId = 0;
    for (const tool of Object.values(ToolTypes)) {
      if (tool.ClassComponent === Node) {
        const nodes = json[`${tool.value.toLowerCase()}s`];
        console.log(nodes);
        if (nodes) {
          for (const node of nodes) {
            const newNode = new Node(node.id, tool.value.toLowerCase(), node.x, node.y);
            newNode.propertiesValue = { ...node };
            delete newNode.propertiesValue.x;
            delete newNode.propertiesValue.y;
            delete newNode.propertiesValue.childrenIds;
            this.addNode(newNode);

            for (const childId of node.childrenIds) {
              this.addLink(new Link(node.id, childId));
            }
          }
        }
      }
    }
  }

  toJSON() {
    const result: { [key: string]: any } = {};
    for (const tool of Object.values(ToolTypes)) {
      if (tool.ClassComponent === Node) {
        result[`${tool.value.toLowerCase()}s`] = this.nodes.map(node => {
          const properties: { [key: string]: any } = {
            id: node.id,
            x: node.x,
            y: node.y,
            childrenIds: [],
            ...node.propertiesValue
          };
          
          this.links.forEach(link => {
            if (link.sourceId === node.id) {
              properties.childrenIds.push(link.targetId);
            }
          });
          return properties;
        });
      }
    }
    console.log(result);
    return result;
  }
}
