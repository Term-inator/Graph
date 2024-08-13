import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { Button, TextField, Switch, FormGroup, Box } from '@mui/material';
import { useDrag, useDrop } from 'react-dnd';
import { Property } from '../types';

interface DraggableItemProps {
  index: number;
  type: string; // 增加了类型参数
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ index, type, moveItem, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [, drop] = useDrop({
    accept: type, // use a unique type
    hover(item: { type: string; index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [, drag] = useDrag({
    type: type, // use a unique type
    item: () => {
      return { index };
    },
  });

  drag(drop(ref));

  return <div ref={ref}>{children}</div>;
};

const useUniqueKeys = (items: any[], idFn: (item: any) => string | number) => {
  const keysRef = useRef(new Map());
  const keys = items.map(item => {
    const id = idFn(item);
    if (keysRef.current.has(id)) {
      return keysRef.current.get(id);
    }
    const newKey = `${id}-${Math.random()}`;
    keysRef.current.set(id, newKey);
    return newKey;
  });
  return keys;
};

const Label = styled('label')`
  display: block;
  margin: 0 10% 0 0;
  line-height: 40px;
`;

const FormItem: React.FC<{ property: Property, label: string, onChange: (value: any) => void }> = ({ property, label, onChange }) => {
  switch (property.type) {
    case 'string':
    case 'number':
      return (
        <Box display="flex" alignItems="center" marginBottom={2}>
          <Label>{label}</Label>
          <TextField
            type={property.type === 'number' ? 'number' : 'text'}
            variant="outlined"
            fullWidth
            onChange={(e) => onChange(property.type === 'number' ? Number(e.target.value) : e.target.value)}
          />
        </Box>
      );
    case 'boolean':
      return (
        <Box display="flex" alignItems="center" marginBottom={2}>
          <Label>{label}</Label>
          <Switch onChange={(e) => onChange(e.target.checked)} />
        </Box>
      );
      case 'property':
        return (
          <Box>
            <Label>{label}</Label>
            <Box marginLeft={2}>
              {property.properties && Object.keys(property.properties).map((key) => (
                <FormItem
                  key={key}
                  label={key}
                  property={property.properties![key]}
                  onChange={(value) => {
                    const newProp = {...property, properties: {...property.properties}};
                    newProp.properties[key] = {...newProp.properties[key], value};
                    onChange(newProp);
                  }}
                />
              ))}
            </Box>
          </Box>
        );
      
      case 'array':
        const arrayType = `array-${label}`;
        const [items, setItems] = useState<any[]>(property.value || []);
        const handleAdd = () => {
          const newItem = {
            type: 'property',
            properties: {
              ...property.properties // Assuming default values or structures
            }
          };
          setItems([...items, newItem]);
          onChange([...items, newItem]);
        };
        const handleRemove = (index: number) => {
          const newItems = items.filter((_, i) => i !== index);
          setItems(newItems);
          onChange(newItems);
        };
        const keys = useUniqueKeys(items, (item) => item);
        return (
          <Box>
            <Label>{label}</Label>
            {items.map((item, index) => (
              <DraggableItem key={keys[index]} index={index} type={arrayType} moveItem={(dragIndex, hoverIndex) => {
                const newItems = [...items];
                const draggedItem = newItems[dragIndex];
                newItems.splice(dragIndex, 1);
                newItems.splice(hoverIndex, 0, draggedItem);
                setItems(newItems);
                onChange(newItems);
              }}>
                <Box key={keys[index]} marginLeft={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Label>Item {index + 1}</Label>
                    <Button onClick={() => handleRemove(index)}>Remove</Button>
                  </Box>
                  <Box marginLeft={2}>
                  {item.properties && Object.keys(item.properties).map((key) => (
                    <FormItem
                      key={key}
                      label={key}
                      property={item.properties[key]}
                      onChange={(value) => {
                        const newItems = [...items];
                        if (value.type === 'property') {
                          newItems[index].properties[key] = value;
                        }
                        else {
                          newItems[index].properties[key].value = value;
                        }
                        setItems(newItems);
                        onChange(newItems);
                      }}
                    />
                  ))}
                  </Box>
                </Box>
              </DraggableItem>
            ))}
            <Button onClick={handleAdd}>Add</Button>
          </Box>
        );
    default:
      return null;
  }
};

interface DynamicFormProps {
  properties: { [key: string]: Property };
  onChange: (value: any) => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ properties, onChange }) => {
  const [formData, setFormData] = useState<{ [key: string]: any }>({});

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
    console.log(formData);
  };

  return (
    <FormGroup sx={{ width: '500px', padding: '0 30px' }}>
      {Object.keys(properties).map((key) => (
        <FormItem
          key={key}
          label={key}
          property={properties[key]}
          onChange={(value) => handleChange(key, value)}
        />
      ))}
    </FormGroup>
  );
};