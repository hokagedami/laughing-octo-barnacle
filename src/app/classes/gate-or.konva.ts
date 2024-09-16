import {GroupConfig} from "konva/lib/Group";
import Konva from "konva";
import {GateCircle} from "./gate-circle.konva";
import {Gate} from "./gate.konva";


export interface OrGateConfig extends GroupConfig {
  [key: string]: any;
  handleCircleClick?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
}

export class OrGate extends Gate {
  private readonly handleCircleClick?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
  constructor(config: OrGateConfig) {
    super(config);
    this.className = 'OrGate';
    this.handleCircleClick = config.handleCircleClick;
    this._buildOrGate();
  }

  _buildOrGate() {
    const body = new Konva.Path({
      data: 'M0,0 Q14,0 29,12 Q14,24 0,24 Q17,12 0,0 Z',
      fill: 'white',
      stroke: 'black',
      strokeWidth: 1.5
    });

    const inputLine1 = new Konva.Line({
      points: [-18, 6, 6, 6],
      stroke: 'black',
      strokeWidth: 1.5
    });

    const inputLine2 = new Konva.Line({
      points: [-18, 18, 6, 18],
      stroke: 'black',
      strokeWidth: 1.5
    });

    const outputLine = new Konva.Line({
      points: [29, 12, 47, 12],
      stroke: 'black',
      strokeWidth: 1.5
    });

    const inputCircleOne = new GateCircle({x: -18, y: 6, handleClick: this.handleCircleClick, circleType: 'input'});
    const inputCircleTwo = new GateCircle({x: -18, y: 18, handleClick: this.handleCircleClick, circleType: 'input',});
    const outputCircleOne = new GateCircle({x: 47, y: 12, handleClick: this.handleCircleClick, circleType: 'output',});

    this.add(body, inputLine1, inputLine2, inputCircleOne, inputCircleTwo, outputLine, outputCircleOne);

  }
}
