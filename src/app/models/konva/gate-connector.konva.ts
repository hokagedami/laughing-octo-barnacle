import Konva from "konva";
import {Gate} from "./gate.konva";

export interface GateConnectorConfig extends Konva.GroupConfig {
  _width: number;
  _height: number;
  handleClick?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
  [key: string]: any;
}

export class GateConnector extends Gate {
  private readonly _width: number;
  private readonly _height: number;
  private readonly handleClick?: (event: Konva.KonvaEventObject<MouseEvent>) => void;

  constructor(config: GateConnectorConfig) {
    const { x = 0, y = 0, _width, _height, ...rest } = config;
    super(config);
    this.className = 'GateConnector';
    this._width = _width;
    this._height = _height;
    this.handleClick = config.handleClick;
    this._buildGateConnector();
  }

  _buildGateConnector() {
    const iconSize = Math.min(this._width, this._height) * 0.6;
    const iconX = (this._width - iconSize) / 2;
    const iconY = (this._height - iconSize) / 2;

    const connectorIcon = new Konva.Rect({
      x: iconX,
      y: iconY,
      width: iconSize,
      height: iconSize,
      fill: 'lightgray',
      stroke: 'black',
      strokeWidth: 2
    });

    const connectorLine = new Konva.Line({
      points: [iconX + iconSize * 0.1, iconY + iconSize / 2, iconX + iconSize * 0.9, iconY + iconSize / 2],
      stroke: 'black',
      strokeWidth: 2
    });

    this.add(connectorIcon, connectorLine);

    if (this.handleClick) {
      this.on('click', this.handleClick);
    }
  }
}
