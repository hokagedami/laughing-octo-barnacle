import Konva from "konva";
import {GateCircle} from "./gate-circle.konva";
import {Gate, GateConfig} from "./gate.konva";


export interface AndGateConfig extends GateConfig {
  handleCircleClick?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
  [key: string]: any;
}

export class AndGate extends Gate {
  private readonly handleCircleClick?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
  constructor(config: AndGateConfig) {
    super(config);
    this.className = 'AndGate';
    this.handleCircleClick = config.handleCircleClick;
    this._buildAndGate();
  }

  _buildAndGate() {
    const body = new Konva.Shape({
      sceneFunc: (context, shape) => {
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(16, 0);
        context.quadraticCurveTo(29, 0, 29, 12);
        context.quadraticCurveTo(29, 24, 16, 24);
        context.lineTo(0, 24);
        context.closePath();
        context.fillStrokeShape(shape);
      },
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2
    });

    const inputLine1 = new Konva.Line({
      points: [-18, 6, 0, 6],
      stroke: 'black',
      strokeWidth: 2
    });
    const inputLine2 = new Konva.Line({
      points: [-18, 18, 0, 18],
      stroke: 'black',
      strokeWidth: 2
    });
    const outputLine = new Konva.Line({
      points: [29, 12, 47, 12],
      stroke: 'black',
      strokeWidth: 2
    });

    const inputCircleOne = new GateCircle({x: -18, y: 6, handleClick: this.handleCircleClick, circleType: 'input'});
    const inputCircleTwo = new GateCircle({x: -18, y: 18, handleClick: this.handleCircleClick, circleType: 'input',});
    const outputCircleOne = new GateCircle({x: 47, y: 12, handleClick: this.handleCircleClick, circleType: 'output',});

    this.add(body, inputLine1, inputLine2, inputCircleOne, inputCircleTwo, outputLine, outputCircleOne);
  }
}
