import Konva from "konva";
import {GateCircle} from "./gate-circle.konva";
import {Gate, GateConfig} from "./gate.konva";


export interface GateBulbConfig extends GateConfig {
  [key: string]: any;
  handleCircleClick?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
}

export class GateBulb extends Gate {
  private readonly handleCircleClick?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
  constructor(config: GateBulbConfig) {
    super(config);
    this.className = 'GateBulb';
    this.handleCircleClick = config.handleCircleClick;
    this._buildGateBulb();
  }

  _buildGateBulb() {
    const offsetY = -15;
    const scale = 0.7;

    const bulbOutline = new Konva.Path({
      data: 'M15,0 Q30,0 30,25 Q30,35 25,45 L25,55 Q25,60 15,60 Q5,60 5,55 L5,45 Q0,35 0,25 Q0,0 15,0 Z',
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      scaleX: scale,
      scaleY: scale,
      y: offsetY
    });

    const filament = new Konva.Line({
      points: [10, 35, 15, 30, 20, 35, 25, 30],
      stroke: 'red',
      strokeWidth: 2,
      tension: 0.5,
      scaleX: scale,
      scaleY: scale,
      y: offsetY

    });

    const base = new Konva.Rect({
      x: 10 * scale,
      y: (45 + offsetY) * scale,
      width: 10 * scale,
      height: 10 * scale,
      fill: 'black'
    });

    const inputLine = new Konva.Line({
      points: [15 * scale, (55 + offsetY) * scale, 15 * scale, (70 + offsetY) * scale],
      stroke: 'black',
      strokeWidth: 2
    });

    const inputCircle = new GateCircle({x: 15 * scale, y: (70 + offsetY) * scale, isBulbCircle: true, handleClick: this.handleCircleClick, circleType: 'input'});

    this.add(bulbOutline, filament, base, inputLine, inputCircle);
  }
}
