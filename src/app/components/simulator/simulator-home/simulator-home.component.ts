import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Konva from 'konva';

@Component({
  selector: 'app-simulator-home',
  templateUrl: './simulator-home.component.html',
  styleUrls: ['./simulator-home.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SimulatorHomeComponent implements OnInit {
  @ViewChild('stageContainer', { static: true }) stageContainer!: ElementRef<HTMLDivElement>;

  stage!: Konva.Stage;
  layer!: Konva.Layer;

  constructor() {}

  ngOnInit(): void {
    this.initializeKonva();
    this.createGridBackground();
    this.createToolbarContainer();
  }

  initializeKonva(): void {
    this.stage = new Konva.Stage({
      container: this.stageContainer.nativeElement,
      width: 800,
      height: 600,
    });

    this.stage.container().style.backgroundColor = '#f0f0f0';
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  createGridBackground(): void {
    const gridLayer = new Konva.Layer();
    const gridSize = 20;
    const stageWidth = this.stage.width();
    const stageHeight = this.stage.height();

    for (let x = 0; x <= stageWidth; x += gridSize) {
      const line = new Konva.Line({
        points: [x, 0, x, stageHeight],
        stroke: '#ddd',
        strokeWidth: 0.5
      });
      gridLayer.add(line);
    }

    for (let y = 0; y <= stageHeight; y += gridSize) {
      const line = new Konva.Line({
        points: [0, y, stageWidth, y],
        stroke: '#ddd',
        strokeWidth: 0.5
      });
      gridLayer.add(line);
    }

    this.stage.add(gridLayer);
    gridLayer.moveToBottom();
  }

  createToolbarContainer(): void {
    const toolbarLayer = new Konva.Layer();

    const stageWidth = this.stage.width();
    const stageHeight = this.stage.height();
    const containerWidth = stageWidth * 0.7; // Set the toolbar width to 70% of the stage width
    const containerHeight = 100;

    const toolbarRect = new Konva.Rect({
      x: (stageWidth - containerWidth) / 2,
      y: stageHeight - containerHeight - 10,
      width: containerWidth,
      height: containerHeight,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      cornerRadius: 10,
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffset: { x: 5, y: 5 },
      shadowOpacity: 0.2,
    });

    toolbarLayer.add(toolbarRect);
    this.stage.add(toolbarLayer);

    this.createToolbar(toolbarRect.x(), toolbarRect.y(), toolbarLayer, containerWidth);
  }

  createToolbar(containerX: number, containerY: number, toolbarLayer: Konva.Layer, containerWidth: number): void {
    const containerHeight = 100;
    const gateY = containerY + containerHeight / 2; // Vertical center of the toolbar
    const resetButtonSize = 50; // Size of the reset button
    const elementPadding = 20; // Padding on both sides of the toolbar

    // Define the sizes of each element
    const elementSizes = {
      AND: 50,
      OR: 50,
      NOT: 50,
      LightBulb: 50,
      One: 50,
      Zero: 50,
      Reset: resetButtonSize
    };

    // Calculate the total width of all elements combined
    const totalElementWidth = elementSizes.AND + elementSizes.OR + elementSizes.NOT +
      elementSizes.LightBulb + elementSizes.One + elementSizes.Zero;

    // Calculate the available width for spacing between elements
    const availableWidth = containerWidth - 2 * elementPadding - totalElementWidth - elementSizes.Reset;

    // Calculate spacing between elements
    const elementSpacing = availableWidth / 6; // We have 6 gaps between the 7 elements

    // Starting position for the first element
    let currentX = containerX + elementPadding;

    // Create and position each gate and bulb icon
    this.createGateIcon('AND', currentX, gateY, toolbarLayer);
    currentX += elementSizes.AND + elementSpacing;

    this.createGateIcon('OR', currentX, gateY, toolbarLayer);
    currentX += elementSizes.OR + elementSpacing;

    this.createGateIcon('NOT', currentX, gateY, toolbarLayer);
    currentX += elementSizes.NOT + elementSpacing;

    this.createGateIcon('LightBulb', currentX, gateY, toolbarLayer);
    currentX += elementSizes.LightBulb + elementSpacing;

    this.createGateIcon('One', currentX, gateY, toolbarLayer);
    currentX += elementSizes.One + elementSpacing;

    this.createGateIcon('Zero', currentX, gateY, toolbarLayer);
    currentX += elementSizes.Zero + elementSpacing;

    // Position the reset button at the right end of the toolbar
    this.createResetButton(currentX, gateY - resetButtonSize / 2, "public/images/reset.png", toolbarLayer);

    toolbarLayer.draw();
  }

  createGateIcon(type: string, x: number, y: number, toolbarLayer: Konva.Layer): void {
    let gate: Konva.Group;

    switch (type) {
      case 'AND':
        gate = this.createAndGate(0, 0);
        break;
      case 'OR':
        gate = this.createOrGate(0, 0);
        break;
      case 'NOT':
        gate = this.createNotGate(0, 0);
        break;
      case 'LightBulb':
        gate = this.createLightBulbIcon(0, 0);
        break;
      case 'One':
        gate = this.createOneIcon(0, 0);
        break;
      case 'Zero':
        gate = this.createZeroIcon(0, 0);
        break;
      default:
        throw new Error(`Unknown gate type: ${type}`);
    }

    // Center the gate vertically
    const gateHeight = 24; // Assuming all gates are 24 units tall
    gate.position({
      x: x - gate.width() / 2,
      y: y - gateHeight / 2
    });

    // Set attributes for dragging
    gate.setAttrs({
      draggable: false,
      id: `gate-${Date.now()}-${Math.random()}`,
      isToolbarIcon: true
    });

    // Handle the click event for toolbar icons
    gate.on('click', (event: Konva.KonvaEventObject<Event>) => {
      event.cancelBubble = true;
      if (gate.getAttr('isToolbarIcon')) {
        this.cloneAndDragGate(gate);
      }
    });

    // gate.find('Circle').forEach(circle => this.addCircleClickEvents(circle as Konva.Circle));

    toolbarLayer.add(gate);
  }

  createAndGate(x: number, y: number): Konva.Group {
    const group = new Konva.Group({ x, y });

    // Body of the AND gate (length reduced by 20%, height unchanged)
    const body = new Konva.Shape({
      sceneFunc: (context, shape) => {
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(16, 0);  // Reduced from 20 to 16
        context.quadraticCurveTo(29, 0, 29, 12);  // Reduced from 36 to 29
        context.quadraticCurveTo(29, 24, 16, 24);  // Reduced from 36 to 29, and 20 to 16
        context.lineTo(0, 24);
        context.closePath();
        context.fillStrokeShape(shape);
      },
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2
    });

    // Input lines
    const inputLine1 = new Konva.Line({
      points: [-18, 6, 0, 6],  // Y adjusted to separate inputs
      stroke: 'black',
      strokeWidth: 2
    });

    const inputLine2 = new Konva.Line({
      points: [-18, 18, 0, 18],  // Y adjusted to separate inputs
      stroke: 'black',
      strokeWidth: 2
    });

    // Input circles (separated vertically)
    const inputCircle1 = new Konva.Circle({
      x: -18,
      y: 6,  // Adjusted to separate from the other input
      radius: 4,
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    const inputCircle2 = new Konva.Circle({
      x: -18,
      y: 18,  // Adjusted to separate from the other input
      radius: 4,
      stroke: 'black',
      strokeWidth: 1.5,
      fill: 'white'
    });

    // Output line
    const outputLine = new Konva.Line({
      points: [29, 12, 47, 12],  // X adjusted for reduced body length
      stroke: 'black',
      strokeWidth: 2
    });

    // Output circle
    const outputCircle = new Konva.Circle({
      x: 47,  // X adjusted for reduced body length
      y: 12,
      radius: 4,
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    group.add(body, inputLine1, inputLine2, inputCircle1, inputCircle2, outputLine, outputCircle);
    return group;
  }

  createOrGate(x: number, y: number): Konva.Group {
    const group = new Konva.Group({ x, y });

    // Body of the OR gate
    const body = new Konva.Path({
      data: 'M0,0 Q14,0 29,12 Q14,24 0,24 Q17,12 0,0 Z',
      fill: 'white',
      stroke: 'black',
      strokeWidth: 1.5
    });

    // Input lines (now touching the body)
    const inputLine1 = new Konva.Line({
      points: [-18, 6, 2, 6],
      stroke: 'black',
      strokeWidth: 1.5
    });

    const inputLine2 = new Konva.Line({
      points: [-18, 18, 2, 18],
      stroke: 'black',
      strokeWidth: 1.5
    });

    // Output line
    const outputLine = new Konva.Line({
      points: [29, 12, 47, 12],
      stroke: 'black',
      strokeWidth: 1.5
    });

    // Input circles
    const inputCircle1 = new Konva.Circle({
      x: -18,
      y: 6,
      radius: 4,
      stroke: 'black',
      strokeWidth: 1.5,
      fill: 'white'
    });

    const inputCircle2 = new Konva.Circle({
      x: -18,
      y: 18,
      radius: 4,
      stroke: 'black',
      strokeWidth: 1.5,
      fill: 'white'
    });

    // Output circle
    const outputCircle = new Konva.Circle({
      x: 47,
      y: 12,
      radius: 4,
      stroke: 'black',
      strokeWidth: 1.5,
      fill: 'white'
    });

    group.add(body, inputLine1, inputLine2, outputLine, inputCircle1, inputCircle2, outputCircle);

    return group;
  }

  createNotGate(x: number, y: number): Konva.Group {
    const group = new Konva.Group({ x, y });

    // Body of the NOT gate (triangle)
    const body = new Konva.Line({
      points: [0, 0, 29, 12, 0, 24, 0, 0],
      closed: true,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 1.5
    });

    // Small circle at the output
    const outputDot = new Konva.Circle({
      x: 31,
      y: 12,
      radius: 2,
      fill: 'black',
      stroke: 'black',
      strokeWidth: 1.5
    });

    // Input line
    const inputLine = new Konva.Line({
      points: [-18, 12, 0, 12],
      stroke: 'black',
      strokeWidth: 1.5
    });

    // Output line
    const outputLine = new Konva.Line({
      points: [33, 12, 47, 12],
      stroke: 'black',
      strokeWidth: 1.5
    });

    // Input circle
    const inputCircle = new Konva.Circle({
      x: -18,
      y: 12,
      radius: 4,
      stroke: 'black',
      strokeWidth: 1.5,
      fill: 'white'
    });

    // Output circle
    const outputCircle = new Konva.Circle({
      x: 47,
      y: 12,
      radius: 4,
      stroke: 'black',
      strokeWidth: 1.5,
      fill: 'white'
    });

    group.add(body, outputDot, inputLine, outputLine, inputCircle, outputCircle);

    return group;
  }

  createLightBulbIcon(x: number, y: number): Konva.Group {
    const group = new Konva.Group({ x, y });

    const offsetY = -15; // Move the bulb up slightly
    const scale = 0.7;   // Further scale down to fit the toolbar

    const bulbOutline = new Konva.Path({
      data: 'M15,0 Q30,0 30,25 Q30,35 25,45 L25,55 Q25,60 15,60 Q5,60 5,55 L5,45 Q0,35 0,25 Q0,0 15,0 Z',
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      scaleX: scale, // Scale down to fit within the toolbar
      scaleY: scale,  // Scale down to fit within the toolbar
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

    const inputCircle = new Konva.Circle({
      x: 15 * scale,
      y: (70 + offsetY) * scale,
      radius: 5 * scale,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2
    });

    group.add(bulbOutline, filament, base, inputLine, inputCircle);
    return group;
  }

  createOneIcon(x: number, y: number): Konva.Group {
    const group = new Konva.Group({ x, y });

    const boxSize = 35; // Ensure the box is a perfect square

    const box = new Konva.Rect({
      x: 0,
      y: 0,
      width: boxSize,
      height: boxSize, // Same as width for a perfect square
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2
    });

    const text = new Konva.Text({
      x: boxSize / 2 - 6, // Center the text horizontally
      y: boxSize / 2 - 10, // Center the text vertically
      text: '1',
      fontSize: 20,
      fontFamily: 'Calibri',
      fontStyle: 'bold',
      fill: 'black'
    });

    const outputLine = new Konva.Line({
      points: [boxSize, boxSize / 2, boxSize + 20, boxSize / 2], // Start from the middle of the right edge of the box
      stroke: 'black',
      strokeWidth: 3
    });

    const outputCircle = new Konva.Circle({
      x: boxSize + 20,
      y: boxSize / 2,
      radius: 6,
      stroke: 'black',
      strokeWidth: 3,
      fill: 'white'
    });

    group.add(box, text, outputLine, outputCircle);

    return group;
  }

  createZeroIcon(x: number, y: number): Konva.Group {
    const group = new Konva.Group({ x, y });

    const boxSize = 35; // Ensure the box is a perfect square

    const box = new Konva.Rect({
      x: 0,
      y: 0,
      width: boxSize,
      height: boxSize, // Same as width for a perfect square
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2
    });

    const text = new Konva.Text({
      x: boxSize / 2 - 6, // Center the text horizontally
      y: boxSize / 2 - 10, // Center the text vertically
      text: '0',
      fontSize: 20,
      fontFamily: 'Calibri',
      fontStyle: 'bold',
      fill: 'black'
    });

    const outputLine = new Konva.Line({
      points: [boxSize, boxSize / 2, boxSize + 20, boxSize / 2], // Start from the middle of the right edge of the box
      stroke: 'black',
      strokeWidth: 3
    });

    const outputCircle = new Konva.Circle({
      x: boxSize + 20,
      y: boxSize / 2,
      radius: 6,
      stroke: 'black',
      strokeWidth: 3,
      fill: 'white'
    });

    group.add(box, text, outputLine, outputCircle);

    return group;
  }

  cloneAndDragGate(gate: Konva.Group): void {
    const clonedGate = gate.clone({
      x: gate.x(),
      y: gate.y(),
      draggable: true,
      id: `cloned-${Date.now()}-${Math.random()}`,
    });

    clonedGate.setAttr('isToolbarIcon', false);
    clonedGate.off('click');

    this.layer.add(clonedGate);
    clonedGate.moveToTop();
    this.stage.draw();

    clonedGate.startDrag();

    this.handleCanvasGate(clonedGate);
  }

  handleCanvasGate(clonedGate: Konva.Group): void {
    // Handle dragging for gates on the canvas (not in the toolbar)
    clonedGate.on('dragmove', () => {
      // Handle specific behavior during dragging on the canvas, if needed
    });

    clonedGate.on('dragend', () => {
      // Optionally, implement logic to snap to grid or limit the position
      const gridSize = 20;
      const snappedX = Math.round(clonedGate.x() / gridSize) * gridSize;
      const snappedY = Math.round(clonedGate.y() / gridSize) * gridSize;

      clonedGate.position({ x: snappedX, y: snappedY });
      this.stage.draw();
    });
  }

  createResetButton(x: number, y: number, imageUrl: string, toolbarLayer: Konva.Layer): void {
    Konva.Image.fromURL(imageUrl, (imageNode) => {
      imageNode.setAttrs({
        x: x,
        y: y,
        width: 40,
        height: 40,
        draggable: false,
      });

      imageNode.on('click', () => {
        this.layer.destroyChildren();
        this.layer.draw();
      });

      toolbarLayer.add(imageNode);
    });
  }
}
