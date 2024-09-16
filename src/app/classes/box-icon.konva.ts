import Konva from "konva";
import {GateCircle} from "./gate-circle.konva";
import {GroupConfig} from "konva/lib/Group";
import {Gate} from "./gate.konva";

export interface BoxIconConfig extends GroupConfig{
  textValue: string;
  handleCircleClick?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
}

export class BoxIcon extends Gate {
  private readonly textValue: string;
  private readonly handleCircleClick?: (event: Konva.KonvaEventObject<MouseEvent>) => void;
  constructor(config: BoxIconConfig) {
    super(config);
    this.className = 'BoxIcon';
    this.textValue = config.textValue || '';
    this.handleCircleClick = config.handleCircleClick;
    this._buildIcon();
  }

  _buildIcon() {
    const boxSize = 35;

    // Create the rectangle (box)
    const box = new Konva.Rect({
      x: 0,
      y: 0,
      width: boxSize,
      height: boxSize,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2
    });

    // Create the text
    const text = new Konva.Text({
      x: boxSize / 2 - 6,
      y: boxSize / 2 - 10,
      text: this.textValue,
      fontSize: 20,
      fontFamily: 'Calibri',
      fontStyle: 'bold',
      fill: 'black'
    });

    // Create the output line
    const outputLine = new Konva.Line({
      points: [boxSize, boxSize / 2, boxSize + 20, boxSize / 2],
      stroke: 'black',
      strokeWidth: 1.5
    });

    // Create the output circle
    const outputCircle = new GateCircle({
      x: boxSize + 20,
      y: boxSize / 2,
      handleClick: this.handleCircleClick,
      circleType: 'output'
    });

    // Add all shapes to the group
    this.add(box, text, outputLine, outputCircle);
  }

}
