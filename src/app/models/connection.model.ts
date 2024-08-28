import Konva from "konva";

export interface Connection {
  start: Konva.Group | null;
  end: Konva.Group | null;
  inputCircle: Konva.Circle | null;
  outputCircle: Konva.Circle | null;
}
