import Konva from "konva";
import {GateCircle} from "../classes/gate-circle.konva";
import {Gate} from "../classes/gate.konva";

export interface Connection {
  start: Gate | null;
  end: Gate | null;
  inputCircle: GateCircle | null;
  outputCircle: GateCircle | null;
}
