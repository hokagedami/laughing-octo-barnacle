import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Konva from 'konva';  // Import Konva

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
  clonesIds: string[] = [];

  constructor() {}

  ngOnInit(): void {
    this.initializeKonva();
    this.createToolbarContainer();
  }

  initializeKonva(): void {
    // Initializes the Konva stage and the layer
    this.stage = new Konva.Stage({
      container: this.stageContainer.nativeElement,
      width: 800,
      height: 600,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  createToolbarContainer(): void {
    // Creates the toolbar container at the bottom of the stage
    const toolbarLayer = new Konva.Layer();

    const containerWidth = 400;
    const containerHeight = 80;
    const stageWidth = this.stage.width();
    const stageHeight = this.stage.height();

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

    // Call createToolbar with correct arguments
    this.createToolbar(toolbarRect.x(), toolbarRect.y(), toolbarLayer);
  }


  createToolbar(containerX: number, containerY: number, toolbarLayer: Konva.Layer): void {
    // Adds the gate icons to the toolbar
    const gates = [
      { type: 'AND', x: containerX + 30, y: containerY + 15, imageUrl: '/public/images/and_gate.png' },
      { type: 'OR', x: containerX + 130, y: containerY + 15, imageUrl: '/public/images/or_gate.png' },
      { type: 'NOT', x: containerX + 230, y: containerY + 15, imageUrl: '/public/images/not_gate.png' },
    ];

    gates.forEach(gate => {
      this.createGateIcon(gate.x, gate.y, gate.type, gate.imageUrl, toolbarLayer);
    });

    this.createResetButton(containerX + 330, containerY + 15, '/public/images/reset.png', toolbarLayer);
    toolbarLayer.draw();
  }


  createGateIcon(x: number, y: number, type: string,  imageUrl: string, toolbarLayer: Konva.Layer): void {
    Konva.Image.fromURL(imageUrl, (imageNode) => {
      imageNode.setAttrs({
        x: x,
        y: y,
        width: 50,
        height: 50,
        draggable: false,
        id: `gate-${Date.now()}-${Math.random()}`, // Assign a unique ID to each image
        isToolbarIcon: true, // Custom attribute to distinguish between toolbar and canvas gates
        gateType: type
      });

      // Handle the click event for toolbar icons
      imageNode.on('click', () => {
        if (imageNode.getAttr('isToolbarIcon')) {
          this.cloneAndDragGate(imageNode, toolbarLayer);
        }
      });

      toolbarLayer.add(imageNode);
    });
  }

  cloneAndDragGate(imageNode: Konva.Image, toolbarLayer: Konva.Layer): void {
    // Clone the gate from the toolbar and add it to the canvas
    const clonedImage = imageNode.clone({
      x: imageNode.x(),
      y: imageNode.y(),
      draggable: true,
      id: `cloned-${Date.now()}-${Math.random()}`, // Ensure the cloned gate has a unique ID
    });

    clonedImage.setAttr('isToolbarIcon', false); // Update the attribute to indicate it's a canvas gate
    clonedImage.off('click'); // Remove the click event listener from the cloned image

    // Move the cloned image to the main layer and bring it to the top
    this.layer.add(clonedImage);
    clonedImage.moveToTop(); // Ensure the cloned image is on top
    this.stage.draw();

    // clonedImage.on('click', (event: Konva.KonvaEventObject<Event>) => {
    //   event.cancelBubble = true;
    // });

    // Start dragging the cloned image
    clonedImage.startDrag();

    // Add drag behavior specific to canvas gates
    this.handleCanvasGate(clonedImage);
  }

  handleCanvasGate(clonedImage: Konva.Image): void {
    // Handle dragging for gates on the canvas (not in the toolbar)
    clonedImage.on('dragmove', () => {
    });

    clonedImage.on('dragend', () => {
      // Optionally, implement logic to snap to grid or limit the position
      const gridSize = 20;
      const snappedX = Math.round(clonedImage.x() / gridSize) * gridSize;
      const snappedY = Math.round(clonedImage.y() / gridSize) * gridSize;

      clonedImage.position({ x: snappedX, y: snappedY });
      clonedImage.setAttr('isToolbarIcon', false); // Update the attribute to indicate it's a canvas gate
      this.stage.draw();
    });
  }

  createResetButton(x: number, y: number, imageUrl: string, toolbarLayer: Konva.Layer): void {
    Konva.Image.fromURL(imageUrl, (imageNode) => {
      imageNode.setAttrs({
        x: x,
        y: y,
        width: 50,
        height: 50,
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
