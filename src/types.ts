export interface Property {
  type: 'string' | 'boolean' | 'number' | 'struct' | 'array';
  properties?: { [key: string]: Property };
}


class Base {
  id: string;
  properties: { [key: string]: Property };
  propertiesValue: { [key: string]: any } = {};

  constructor(id: string) {
    this.id = id;
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

  constructor(id: string, type: string, x: number, y: number) {
    super(id);
    this.type = type;
    this.x = x;
    this.y = y;
    this.r = 20;
    this.properties = {
      // test: {
      //   type: 'string',
      // },
      // bool: {
      //   type: 'boolean',
      // },
      // props: {
      //   type: 'struct',
      //   properties: {
      //     field1: {
      //       type: 'string',
      //     },
      //     field2: {
      //       type: 'number',
      //     }
      //   }
      // },
      arr: {
        type: 'array',
        properties: {
          first: { 
            type: 'struct',
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
      // arr2: {
      //   type: 'array',
      //   properties: {
      //     first: {
      //       type: 'string'
      //     }
      //   }
      // }
    };
    console.log(this.properties);

    this.propertiesValue = {
      // test: 'test',
      // bool: true,
      // props: {
      //   field1: '',
      //   field2: ''
      // },
    }
  }
}

export class Link extends Base {
  sourceId: string;
  targetId: string;

  constructor(sourceId: string, targetId: string) {
    super(`${sourceId}-${targetId}`);
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.properties = {
      priority: {
        type: 'number'
      }
    };
  }
}
