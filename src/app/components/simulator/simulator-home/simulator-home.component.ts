import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Konva from 'konva';

@Component({
  selector: 'app-simulator-home',
  templateUrl: './simulator-home.component.html',
  styleUrls: ['./simulator-home.component.css'],
  standalone: true,  // Mark this component as standalone
  imports: [CommonModule]  // Import necessary modules
})
export class SimulatorHomeComponent implements OnInit {
  @ViewChild('stageContainer', { static: true }) stageContainer!: ElementRef<HTMLDivElement>;

  stage!: Konva.Stage;
  layer!: Konva.Layer;

  constructor() {}

  ngOnInit(): void {
    this.initializeKonva();
    this.createGridBackground(); // Add this line
    this.createToolbarContainer();
  }

  initializeKonva(): void {
    this.stage = new Konva.Stage({
      container: this.stageContainer.nativeElement,
      width: 800,
      height: 600,
    });

    // Add this line to set the background color
    this.stage.container().style.backgroundColor = '#f0f0f0';

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  createGridBackground(): void {
    const gridLayer = new Konva.Layer();
    const gridSize = 20; // Size of each grid cell
    const stageWidth = this.stage.width();
    const stageHeight = this.stage.height();

    // Create vertical lines
    for (let x = 0; x <= stageWidth; x += gridSize) {
      const line = new Konva.Line({
        points: [x, 0, x, stageHeight],
        stroke: '#ddd',
        strokeWidth: 0.5
      });
      gridLayer.add(line);
    }

    // Create horizontal lines
    for (let y = 0; y <= stageHeight; y += gridSize) {
      const line = new Konva.Line({
        points: [0, y, stageWidth, y],
        stroke: '#ddd',
        strokeWidth: 0.5
      });
      gridLayer.add(line);
    }

    // Add the grid layer to the stage
    this.stage.add(gridLayer);

    // Move the grid layer to the bottom
    gridLayer.moveToBottom();
  }

  createToolbarContainer(): void {
    // Creates the toolbar container at the bottom of the stage
    const toolbarLayer = new Konva.Layer();

    const containerWidth = 400;
    const containerHeight = 70;
    const stageWidth = this.stage.width();
    const stageHeight = this.stage.height();

    const toolbarRect = new Konva.Rect({
      x: (stageWidth - containerWidth) / 2,
      y: stageHeight - containerHeight - 10,
      width: containerWidth,
      height: containerHeight,
      fill: 'white',
      strokeWidth: 2,
      cornerRadius: 10,
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffset: { x: 5, y: 5 },
      shadowOpacity: 0.2,
    });

    toolbarLayer.add(toolbarRect);
    this.stage.add(toolbarLayer);

    this.createToolbar(toolbarRect.x(), toolbarRect.y(), toolbarLayer);
  }

  createToolbar(containerX: number, containerY: number, toolbarLayer: Konva.Layer): void {
    const containerWidth = 400; // Width of the toolbar container
    const containerHeight = 80; // Height of the toolbar container
    const gateY = containerY + containerHeight / 2; // Vertical center of the toolbar
    const resetButtonSize = 50; // Size of the reset button
    const leftPadding = 50; // Padding from the left edge for the AND gate
    const rightPadding = 70; // Padding from the right edge for the RESET button

    // Calculate the available width for gates
    const availableWidth = containerWidth - leftPadding - rightPadding;

    // Calculate spacing between gates (for 3 gates, we need 2 spaces)
    const gateSpacing = availableWidth / 3;

    // Create gate icons
    this.createGateIcon('AND', containerX + leftPadding, gateY, toolbarLayer);
    this.createGateIcon('OR', containerX + leftPadding + gateSpacing, gateY, toolbarLayer);
    this.createGateIcon('NOT', containerX + leftPadding + 2 * gateSpacing, gateY, toolbarLayer);

    // Position the reset button on the right side of the toolbar
    const resetX = containerX + containerWidth - resetButtonSize - 10; // 10px padding from right
    const resetY = containerY + (containerHeight - resetButtonSize) / 2; // Center vertically

    this.createResetButton(resetX, resetY, "public/images/reset.png", toolbarLayer);
    toolbarLayer.draw();
  }

  createGateIcon(type: string, x: number, y: number, toolbarLayer: Konva.Layer): void {
    let gate: Konva.Group;

    if (type === 'AND') {
      gate = this.createAndGate(0, 0);
    } else if (type === 'OR') {
      gate = this.createOrGate(0, 0);
    } else if (type === 'NOT') {
      gate = this.createNotGate(0, 0);
    } else {
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
      strokeWidth: 1.5
    });

    // Input lines
    const inputLine1 = new Konva.Line({
      points: [-18, 6, 0, 6],  // Y adjusted to separate inputs
      stroke: 'black',
      strokeWidth: 1.5
    });

    const inputLine2 = new Konva.Line({
      points: [-18, 18, 0, 18],  // Y adjusted to separate inputs
      stroke: 'black',
      strokeWidth: 1.5
    });

    // Input circles (separated vertically)
    const inputCircle1 = new Konva.Circle({
      x: -18,
      y: 6,  // Adjusted to separate from the other input
      radius: 4,
      stroke: 'black',
      strokeWidth: 1.5,
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
      strokeWidth: 1.5
    });

    // Output circle
    const outputCircle = new Konva.Circle({
      x: 47,  // X adjusted for reduced body length
      y: 12,
      radius: 4,
      stroke: 'black',
      strokeWidth: 1.5,
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

  cloneAndDragGate(gate: Konva.Group): void {
    // Clone the gate from the toolbar and add it to the canvas
    const clonedGate = gate.clone({
      x: gate.x(),
      y: gate.y(),
      draggable: true,
      id: `cloned-${Date.now()}-${Math.random()}`, // Ensure the cloned gate has a unique ID
    });

    // Mark this image as no longer a toolbar icon
    clonedGate.setAttr('isToolbarIcon', false);

    // Remove any existing click handlers that might have been copied over during cloning
    clonedGate.off('click');

    // Move the cloned image to the main layer and bring it to the top
    this.layer.add(clonedGate);
    clonedGate.moveToTop(); // Ensure the cloned image is on top
    this.stage.draw();

    // Stop event propagation for the cloned image
    clonedGate.on('click', (event: Konva.KonvaEventObject<Event>) => {
      event.cancelBubble = true;
      console.log(`Clicked cloned imageNode at position: (${clonedGate.x()}, ${clonedGate.y()})`);
    });

    // Start dragging the cloned image
    clonedGate.startDrag();

    // Add drag behavior specific to canvas gates
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
