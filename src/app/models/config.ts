import exp from "node:constants";


export interface Config {
  id: number;
  name: string;
  value: string;
  type: 'number' | 'text' | 'boolean' | 'password' ;
}
