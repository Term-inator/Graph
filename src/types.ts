export class Node {
  id: string;
  type: string;
  x: number;
  y: number;
  r: number
  properties: any;

  constructor(id: string, type: string, x: number, y: number, r: number, properties: any) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.r = r;
    this.properties = properties;
  }
}

export class Link {
  sourceId: string;
  targetId: string;
  properties: any;

  constructor(sourceId: string, targetId: string, properties: any) {
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.properties = properties;
  }
}
