import Konva from "konva";


export class Gate extends Konva.Group {
  constructor(config: Konva.GroupConfig) {
    super(config);
    this.className = 'Gate';
  }
}
