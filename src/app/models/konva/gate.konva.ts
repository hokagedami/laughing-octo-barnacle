import Konva from "konva";


export interface GateConfig extends Konva.GroupConfig {
  inputValues?: boolean[] | null;
  outputValue?: boolean | null;
  [key: string]: any;
}


export class Gate extends Konva.Group {
  constructor(config: GateConfig) {
    super(config);
    this.className = 'Gate';
  }
}
