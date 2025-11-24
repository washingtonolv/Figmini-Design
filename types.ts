export enum Tool {
  SELECT = 'SELECT',
  HAND = 'HAND',
  RECTANGLE = 'RECTANGLE',
  CIRCLE = 'CIRCLE',
  TEXT = 'TEXT',
}

export interface Point {
  x: number;
  y: number;
}

export interface DesignElement {
  id: string;
  type: 'rectangle' | 'circle' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
  text?: string;
  fontSize?: number;
  borderRadius?: number;
}

export type DesignAction = 
  | { type: 'ADD_ELEMENT'; payload: DesignElement }
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; changes: Partial<DesignElement> } }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'SET_SELECTION'; payload: string | null };
