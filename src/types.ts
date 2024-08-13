export interface Property {
  type: 'string' | 'boolean' | 'number' | 'property' | 'array';
  properties?: { [key: string]: Property };
  value?: any;
}


class Base {
  id: string;
  properties: { [key: string]: Property };
  propertiesValue: { [key: string]: any } = {};

  constructor(id: string, properties: { [key: string]: Property }) {
    this.id = id;
    this.properties = properties;
  }

  getPropertiesValue() {
    return this.propertiesValue;
  }

  setPropertiesValue(value: any) {
    this.propertiesValue = value;
  }
}

export class Node extends Base {
  type: string;
  x: number;
  y: number;
  r: number

  constructor(id: string, type: string, x: number, y: number, r: number, properties: { [key: string]: Property }) {
    super(id, properties);
    this.type = type;
    this.x = x;
    this.y = y;
    this.r = r;
    this.properties = {
      test: {
        type: 'string',
      },
      bool: {
        type: 'boolean',
      },
      props: {
        type: 'property',
        properties: {
          field1: {
            type: 'string',
          },
          field2: {
            type: 'number',
          }
        }
      },
      arr: {
        type: 'array',
        properties: {
          first: {
            type: 'property',
            properties: {
              field1: {
                type: 'string',
              },
              field2: {
                type: 'number',
              }
            }
          }
        }
      },
      arr2: {
        type: 'array',
        properties: {
          first: {
            type: 'string'
          }
        }
      }
    };
    console.log(this.properties);
  }
}

export class Link extends Base {
  sourceId: string;
  targetId: string;
  properties: any;

  constructor(sourceId: string, targetId: string, properties: any) {
    super(`${sourceId}-${targetId}`, properties);
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.properties = properties;
  }
}
