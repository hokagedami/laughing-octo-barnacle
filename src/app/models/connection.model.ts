import {GateCircle} from "./konva/gate-circle.konva";
import {Gate} from "./konva/gate.konva";

export interface Connection {
  isComplete?: boolean | false;
  start: Gate | null;
  end: Gate | null;
  startCircle: GateCircle | null;
  endCircle: GateCircle | null;
  inputValue?: boolean;
  outputValue?: boolean;
}



