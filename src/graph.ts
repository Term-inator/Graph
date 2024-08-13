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

  }

/**
 * 
 * @returns {
    "test": "111",
    "bool": true,
    "props": {
        "properties": {
            "field1": {
                "value": "123"
            },
            "field2": {
                "value": 456
            }
        }
    },
    "arr": [
        {
            "type": "property",
            "properties": {
                "first": {
                    "type": "property",
                    "properties": {
                        "field1": {
                            "type": "string"
                        },
                        "field2": {
                            "type": "number"
                        }
                    },
                    "value": {
                        "properties": {
                            "field1": {
                                "value": "1"
                            },
                            "field2": {
                                "value": 2
                            }
                        }
                    }
                }
            }
        },
        {
            "type": "property",
            "properties": {
                "first": {
                    "type": "property",
                    "properties": {
                        "field1": {
                            "type": "string"
                        },
                        "field2": {
                            "type": "number"
                        }
                    },
                    "value": {
                        "properties": {
                            "field1": {
                                "value": "3"
                            },
                            "field2": {
                                "value": 4
                            }
                        }
                    }
                }
            }
        }
    ],
    "arr2": [
        {
            "type": "property",
            "properties": {
                "first": {
                    "type": "string",
                    "value": "5"
                }
            }
        },
        {
            "type": "property",
            "properties": {
                "first": {
                    "type": "string",
                    "value": "6"
                }
            }
        }
    ]
}
 */

  parsePropertiesVaue(propertiesValue: any) {
    if (typeof propertiesValue === 'object' && propertiesValue.properties) {
      const result: { [key: string]: any } = {};
      for (const propKey of Object.keys(propertiesValue.properties)) {
        result[propKey] = this.parsePropertiesVaue(propertiesValue.properties[propKey]);
      }
      return result;
    }
    else if (Array.isArray(propertiesValue)) {
      return propertiesValue.map((item: any) => {
        return this.parsePropertiesVaue(item);
      });
    }
    else {
      if (propertiesValue.value) {
        return propertiesValue.value;
      }
      else {
        return propertiesValue;
      }
    }
  }

  toJSON() {
    const result: { [key: string]: any } = {};
    for (const tool of Object.values(ToolTypes)) {
      if (tool.ClassComponent === Node) {
        result[tool.value.toLowerCase()] = this.nodes.map(node => {
          const properties: { [key: string]: any } = {
            x: node.x,
            y: node.y,
            childrenIds: []
          };
          
          for (const propKey of Object.keys(node.propertiesValue)) {
            properties[propKey] = this.parsePropertiesVaue(node.propertiesValue[propKey]);
          }
          
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
