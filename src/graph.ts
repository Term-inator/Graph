import { Node, Link } from './types';

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
}
