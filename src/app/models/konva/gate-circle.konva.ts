import Konva from "konva";
import CircleConfig = Konva.CircleConfig;
import {KonvaEventObject} from "konva/lib/Node";

export interface GateCircleConfig extends CircleConfig {
  isBulbCircle?: boolean;
  handleClick?: (event: KonvaEventObject<MouseEvent>) => void;
  [key: string]: any;
}

export class GateCircle extends Konva.Circle {
  isBulbCircle: boolean;
  constructor(config: GateCircleConfig) {

    const { x, y, isBulbCircle = false, handleClick, ...rest } = config;

    // Determine properties based on 'type' and 'isBulbCircle'
    const radius = config['cycleType'] === 'outputDot' ? 3 : 4;
    const strokeWidth = config['cycleType'] === 'outputDot' ? 1.5 : 2;
    const fill = config['cycleType'] === 'outputDot' ? 'black' : 'white';

    // Call the parent constructor with calculated properties
    super({
      x,
      y,
      radius,
      stroke: 'black',
      strokeWidth,
      fill,
      ...rest
    });

    this.className = 'GateCircle';
    this.isBulbCircle = isBulbCircle;


    if (config.handleClick) {
      this.on('click', config.handleClick);
    }
  }
}
