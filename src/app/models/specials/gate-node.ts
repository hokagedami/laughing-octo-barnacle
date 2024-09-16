import {Gate} from "../konva/gate.konva";


export class GateNode {
  gate: Gate;
  inputs: GateNode[];
  output: GateNode | null;
  outputValue?: boolean | null;

  constructor(gate: Gate) {
    this.gate = gate;
    this.inputs = [];
    this.output = null;
    this.outputValue = null;
  }
}
