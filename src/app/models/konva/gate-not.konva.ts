import Konva from "konva";
import {GateCircle} from "./gate-circle.konva";
import {Gate, GateConfig} from "./gate.konva";

export interface NotGateConfig extends GateConfig {
  [key: string]: any;
  handleCircleClick?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
}

export class NotGate extends Gate {
  private readonly handleCircleClick?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
  constructor(config: NotGateConfig) {
    super(config);
    this.className = 'NotGate';
    this.handleCircleClick = config.handleCircleClick;
    this._buildNotGate();
  }

  _buildNotGate() {
    const body = new Konva.Line({
      points: [0, 0, 29, 12, 0, 24, 0, 0],
      closed: true,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 1.5
    });

    const outputDot = new GateCircle({x: 31, y: 12, handleClick: this.handleCircleClick, circleType: 'outputDot',});

    const inputLine = new Konva.Line({
      points: [-18, 12, 0, 12],
      stroke: 'black',
      strokeWidth: 1.5
    });

    const outputLine = new Konva.Line({
      points: [33, 12, 47, 12],
      stroke: 'black',
      strokeWidth: 1.5
    });

    const inputCircle = new GateCircle({x: -18, y: 12, handleClick: this.handleCircleClick, circleType: 'input'});

    const outputCircle = new GateCircle({x: 47, y: 12, handleClick: this.handleCircleClick, circleType: 'output'});

    this.add(body, outputDot, inputLine, inputCircle, outputLine, outputCircle);
  }
}
