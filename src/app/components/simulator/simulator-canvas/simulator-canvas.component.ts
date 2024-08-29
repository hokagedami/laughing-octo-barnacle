import {Component, ElementRef, inject, ViewChild} from '@angular/core';
import Konva from "konva";
import {KonvaEventObject} from "konva/lib/Node";
import {Connection} from "../../../models/connection.model";
import {NgxToastAlertsService} from "ngx-toast-alerts";

@Component({
  selector: 'app-simulator-canvas',
  standalone: true,
  imports: [],
  templateUrl: './simulator-canvas.component.html',
  styleUrl: './simulator-canvas.component.css'
})
export class SimulatorCanvasComponent {
  @ViewChild('stageContainer', { static: true }) stageContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('toolbarContainer', { static: true }) toolbarContainer!: ElementRef<HTMLDivElement>;

  canvasStage!: Konva.Stage;
  canvasLayer!: Konva.Layer;

  toolbarStage!: Konva.Stage;
  toolbarLayer!: Konva.Layer;

  draggedGate: Konva.Group | null = null;

  selectedTool: 'select' | 'connect' = 'select';
  isDrawingConnection: boolean = false;

  connections: Connection [] = [];
  currentConnection: Connection | null = null;

  private toast = inject(NgxToastAlertsService);

  constructor() {}

  ngOnInit(): void {
    this.initializeKonva();
    this.createGridBackground();
    this.createToolbar();
    this.setupCanvasDragListeners();
    this.setupLayerWatchers();
  }

  initializeKonva(): void {
    const containerWidth = this.stageContainer.nativeElement.offsetWidth;
    const containerHeight = this.stageContainer.nativeElement.offsetHeight;

    this.canvasStage = new Konva.Stage({
      container: this.stageContainer.nativeElement,
      width: containerWidth,
      height: containerHeight,
    });

    this.canvasStage.container().style.backgroundColor = '#f0f0f0';
    this.canvasLayer = new Konva.Layer();
    this.canvasLayer.setAttr('type', 'canvasLayer');
    this.canvasStage.add(this.canvasLayer);
  }

  createGridBackground(): void {
    const gridLayer = new Konva.Layer();
    const gridSize = 20;
    const stageWidth = this.canvasStage.width();
    const stageHeight = this.canvasStage.height();

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

    gridLayer.setAttr('type', 'gridLayer');

    this.canvasStage.add(gridLayer);
    gridLayer.moveToBottom();
  }

  createToolbar(): void {
    const toolbarWidth = 800;
    const toolbarHeight = 100;
    const elementPadding = 30;
    const gateY = toolbarHeight / 2;

    this.toolbarStage = new Konva.Stage({
      container: this.toolbarContainer.nativeElement,
      width: toolbarWidth,
      height: toolbarHeight,
    });

    this.toolbarLayer = new Konva.Layer();
    this.toolbarStage.add(this.toolbarLayer);

    const elementSizes = {
      AND: 50,
      OR: 50,
      NOT: 50,
      LightBulb: 50,
      One: 50,
      Zero: 50,
      Reset: 50,
      Connector: 50
    };

    const totalElementWidth = Object.values(elementSizes).reduce((a, b) => a + b, 0);
    const availableWidth = toolbarWidth - 2 * elementPadding - totalElementWidth;
    const elementSpacing = availableWidth / (Object.keys(elementSizes).length - 1);

    let currentX = elementPadding;

    this.createGateIcon('AND', currentX, gateY, this.toolbarLayer);
    currentX += elementSizes.AND + elementSpacing;

    this.createGateIcon('OR', currentX, gateY, this.toolbarLayer);
    currentX += elementSizes.OR + elementSpacing;

    this.createGateIcon('NOT', currentX, gateY, this.toolbarLayer);
    currentX += elementSizes.NOT + elementSpacing;

    this.createGateIcon('LightBulb', currentX, gateY, this.toolbarLayer);
    currentX += elementSizes.LightBulb + elementSpacing;

    this.createGateIcon('One', currentX, gateY, this.toolbarLayer);
    currentX += elementSizes.One + elementSpacing;

    this.createGateIcon('Zero', currentX, gateY, this.toolbarLayer);
    currentX += elementSizes.Zero + elementSpacing;

    this.createConnectorTool(currentX, gateY, this.toolbarLayer);
    currentX += elementSizes.Connector + elementSpacing;

    this.createResetButton(currentX, gateY - elementSizes.Reset / 2, "public/images/reset.png", this.toolbarLayer);

    this.toolbarLayer.draw();
  }

  createGateIcon(type: string, x: number, y: number, toolbarLayer: Konva.Layer): void {
    const properties = {
      draggable: false,
      id: `gate-${Date.now()}-${Math.random()}`,
      isToolbarIcon: true,
      name: type
    };
    let gate = this.createIconByType(type, x, y, properties);


    gate.on('click', (e) => {
      if (this.selectedTool === 'connect' || this.isDrawingConnection) {
        return;
      }

      // Find a position close to the center that is not occupied
      const canvasCenterX = this.canvasStage.width() / 2;
      const canvasCenterY = this.canvasStage.height() / 2;
      let positionFound = false;
      let posX = canvasCenterX;
      let posY = canvasCenterY;

      while (!positionFound) {
        if (this.isPositionFree(posX, posY)) {
          positionFound = true;
        }
        else {
          // tell the user that the center is not free
          alert('The center of the canvas is not free. Please move other elements to make space.');
          return;
        }
      }

      const clonedProperties = {
        draggable: true,
        id: `cloned-${Date.now()}-${Math.random()}`,
        isToolbarIcon: false,
        name: type
      };
      const cloned = this.createIconByType(gate.getAttr('name'), posX, posY, clonedProperties);

      this.canvasLayer.add(cloned);
      this.handleCanvasGate(cloned);
      this.canvasStage.batchDraw();
      this.canvasLayer.fire('add', { target: cloned });
    });

    toolbarLayer.add(gate);
  }

  isPositionFree(x: number, y: number): boolean {
    const stageChildren = this.canvasLayer.getChildren();
    for (const child of stageChildren) {

      const gatePos = child.position();

      if (x == gatePos.x && y == gatePos.y) {
        return false;
      }
    }
    return true;
  }

  createAndGate(x: number, y: number): Konva.Group {
    const group = new Konva.Group({ x, y });

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

    const inputCircleOne = this.createCircle(-18, 6, 'input');
    const inputCircleTwo = this.createCircle(-18, 18, 'input');
    const outputCircleOne = this.createCircle(47, 12, 'output');


    group.add(body, inputLine1, inputLine2, inputCircleOne, inputCircleTwo, outputLine, outputCircleOne);
    return group;
  }

  createOrGate(x: number, y: number): Konva.Group {
    const group = new Konva.Group({ x, y });

    const body = new Konva.Path({
      data: 'M0,0 Q14,0 29,12 Q14,24 0,24 Q17,12 0,0 Z',
      fill: 'white',
      stroke: 'black',
      strokeWidth: 1.5
    });

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

    const outputLine = new Konva.Line({
      points: [29, 12, 47, 12],
      stroke: 'black',
      strokeWidth: 1.5
    });

    const inputCircle1 = this.createCircle(-18, 6, 'input');

    const inputCircle2 = this.createCircle(-18, 18, 'input');

    const outputCircle = this.createCircle(47, 12, 'output');

    group.add(body, inputLine1, inputLine2, outputLine, inputCircle1, inputCircle2, outputCircle);
    return group;
  }

  createNotGate(x: number, y: number): Konva.Group {
    const group = new Konva.Group({ x, y });

    const body = new Konva.Line({
      points: [0, 0, 29, 12, 0, 24, 0, 0],
      closed: true,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 1.5
    });

    const outputDot = this.createCircle(31, 12, 'outputDot');

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

    const inputCircle = this.createCircle(-18, 12, 'input');

    const outputCircle = this.createCircle(47, 12, 'output');

    group.add(body, outputDot, inputLine, outputLine, inputCircle, outputCircle);
    return group;
  }

  createLightBulbIcon(x: number, y: number): Konva.Group {
    const group = new Konva.Group({ x, y });

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

    const inputCircle = this.createCircle(15 * scale, (70 + offsetY) * scale, 'input');

    group.add(bulbOutline, filament, base, inputLine, inputCircle);
    return group;
  }

  createOneIcon(x: number, y: number): Konva.Group {
    const group = new Konva.Group({ x, y });

    const boxSize = 35;

    const box = new Konva.Rect({
      x: 0,
      y: 0,
      width: boxSize,
      height: boxSize,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2
    });

    const text = new Konva.Text({
      x: boxSize / 2 - 6,
      y: boxSize / 2 - 10,
      text: '1',
      fontSize: 20,
      fontFamily: 'Calibri',
      fontStyle: 'bold',
      fill: 'black'
    });

    const outputLine = new Konva.Line({
      points: [boxSize, boxSize / 2, boxSize + 20, boxSize / 2],
      stroke: 'black',
      strokeWidth: 1.5
    });

    const outputCircle = this.createCircle(boxSize + 20, boxSize / 2, 'output');

    group.add(box, text, outputLine, outputCircle);
    return group;
  }

  createZeroIcon(x: number, y: number): Konva.Group {
    const group = new Konva.Group({ x, y });

    const boxSize = 35;

    const box = new Konva.Rect({
      x: 0,
      y: 0,
      width: boxSize,
      height: boxSize,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2
    });

    const text = new Konva.Text({
      x: boxSize / 2 - 6,
      y: boxSize / 2 - 10,
      text: '0',
      fontSize: 20,
      fontFamily: 'Calibri',
      fontStyle: 'bold',
      fill: 'black'
    });

    const outputLine = new Konva.Line({
      points: [boxSize, boxSize / 2, boxSize + 20, boxSize / 2],
      stroke: 'black',
      strokeWidth: 1.5
    });

    const outputCircle = this.createCircle(boxSize + 20, boxSize / 2, 'output');

    group.add(box, text, outputLine, outputCircle);
    return group;
  }

  createConnectorTool(x: number, y: number, toolbarLayer: Konva.Layer): void {
    const connectorIcon = new Konva.Rect({
      x: x,
      y: y - 20,
      width: 40,
      height: 40,
      fill: 'lightgray',
      stroke: 'black',
      strokeWidth: 2
    });

    const connectorLine = new Konva.Line({
      points: [x + 5, y, x + 35, y],
      stroke: 'black',
      strokeWidth: 2
    });

    const connectorGroup = new Konva.Group();
    connectorGroup.add(connectorIcon, connectorLine);

    connectorGroup.on('click', () => {
      this.selectedTool = this.selectedTool === 'connect' ? 'select' : 'connect';
      connectorIcon.fill(this.selectedTool === 'connect' ? 'yellow' : 'lightgray');
      if (this.selectedTool === 'select') {
        this.isDrawingConnection = false;
        this.currentConnection = null;
      }
      this.toolbarLayer.draw();
    });

    toolbarLayer.add(connectorGroup);
  }

  handleCanvasGate(gate: Konva.Group): void {
    gate.off('click');

    gate.on('dragstart', (e: KonvaEventObject<DragEvent>) => {
      if (this.selectedTool === 'connect' || this.isDrawingConnection) {
        return;
      }
      e.cancelBubble = true;
      this.draggedGate = gate;
    });

    gate.on('dragend', () => {
      if (this.selectedTool === 'connect' || this.isDrawingConnection) {
        return;
      }
      const gridSize = 20;
      const snappedX = Math.round(gate.x() / gridSize) * gridSize;
      const snappedY = Math.round(gate.y() / gridSize) * gridSize;

      gate.position({ x: snappedX, y: snappedY });
      this.canvasStage.batchDraw();
    });

    // Check if the gate is inside the canvas bounds
    const updateDraggable = () => {
      if (this.selectedTool === 'connect' || this.isDrawingConnection) {
        return;
      }
      const pos = gate.absolutePosition();
      const isInside = pos.x >= 0 && pos.y >= 0 &&
        pos.x <= this.canvasStage.width() &&
        pos.y <= this.canvasStage.height();
      gate.draggable(isInside);
    };

    // Update draggable state on drag and dragend
    gate.on('dragmove', updateDraggable);
    gate.on('dragend', updateDraggable);

    // Initial check
    updateDraggable();
  }

  setupCanvasDragListeners(): void {
    this.canvasStage.on('dragover', (e) => {
      e.evt.preventDefault();
    });

    this.canvasStage.on('drop', (e) => {
      e.evt.preventDefault();
      const pointerPos = this.canvasStage.getPointerPosition();
      if (this.draggedGate && pointerPos) {
        this.draggedGate.position({
          x: pointerPos.x,
          y: pointerPos.y
        });
        this.handleCanvasGate(this.draggedGate);
        this.draggedGate = null;
        this.canvasStage.batchDraw();
      }
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
        this.canvasLayer.destroyChildren();
        this.canvasLayer.draw();
      });

      toolbarLayer.add(imageNode);
    });
  }

  createCircle(x: number, y: number, type: string): Konva.Circle {
    const circle = new Konva.Circle({
      x,
      y,
      radius: type === 'outputDot' ? 3 : 4,
      stroke: 'black',
      strokeWidth: type === 'outputDot' ? 1.5 : 2,
      fill: type === 'outputDot' ? 'black' : 'white'
    });

    circle.setAttr('circleType', type);

    circle.on('click', (e) => {
      this.processCircleClick(circle);
    });

    return circle;
  }

  isCircleInsideCanvas(circle: Konva.Circle): boolean {
    const circleParent = circle.getParent();
    return !circleParent?.getAttr('isToolbarIcon');
  }

  private setupLayerWatchers() {
    this.canvasLayer.on('add', (e) => {
      const shape = e.target;
      if (shape instanceof Konva.Group) {
        shape.setAttr('isToolbarIcon', false);
      }
    });
  }

  private createIconByType(type: string, x: number, y: number, attributes: object): Konva.Group {
    let gate: Konva.Group;

    switch (type) {
      case 'AND':
        gate = this.createAndGate(x, y);
        break;
      case 'OR':
        gate = this.createOrGate(x, y);
        break;
      case 'NOT':
        gate = this.createNotGate(x, y);
        break;
      case 'LightBulb':
        gate = this.createLightBulbIcon(x, y);
        break;
      case 'One':
        gate = this.createOneIcon(x, y);
        break;
      case 'Zero':
        gate = this.createZeroIcon(x, y);
        break;
      default:
        throw new Error(`Unknown gate type: ${type}`);
    }

    gate.setAttrs(attributes);
    return gate;
  }

  processCircleClick(circle: Konva.Circle): void {
    if (this.selectedTool === 'connect' && this.isCircleInsideCanvas(circle)) {
      const parent = circle.getParent() as Konva.Group;
      const circleType = circle.getAttr('circleType');

      if (!this.currentConnection) {
        // Start a new connection
        if(circle.getAttr('HasConnection')) {
          alert('Please start a fresh connection');
          return;
        }
        this.currentConnection = {
          start: parent,
          end: null,
          inputCircle: circleType === 'input' ? circle : null,
          outputCircle: circleType === 'output' ? circle : null
        };
        this.isDrawingConnection = true;
        circle.setAttr('HasConnection', true);
      } else {
        // Attempt to close the connection
        if (
          parent !== this.currentConnection.start &&
          circleType !== this.currentConnection.inputCircle?.getAttr('circleType') &&
          circleType !== this.currentConnection.outputCircle?.getAttr('circleType') &&
          !circle.getAttr('HasConnection')
        ) {
          // Valid connection
          if (circleType === 'input') {
            this.currentConnection.inputCircle = circle;
            this.currentConnection.end = parent;
          } else if (circleType === 'output') {
            this.currentConnection.outputCircle = circle;
            this.currentConnection.end = parent;
          }

          // Ensure we have both input and output circles
          if (this.currentConnection.inputCircle && this.currentConnection.outputCircle
            && this.currentConnection.start && this.currentConnection.end
            && this.currentConnection.start !== this.currentConnection.end
            && this.currentConnection.inputCircle.getAttr('circleType') !== this.currentConnection.outputCircle.getAttr('circleType')) {
            this.connections.push(this.currentConnection);


            const lineStartPosition = this.currentConnection.inputCircle.getAbsolutePosition();
            const lineEndPosition = this.currentConnection.outputCircle.getAbsolutePosition();

            // Calculate control points for S shape
            const width = lineEndPosition.x - lineStartPosition.x;
            const height = lineEndPosition.y - lineStartPosition.y;
            const ctrlPoint1 = { x: lineStartPosition.x + width * 0.25, y: lineStartPosition.y + height * 0.75 };
            const ctrlPoint2 = { x: lineStartPosition.x + width * 0.75, y: lineStartPosition.y + height * 0.25 };

            // Create S shape
            const sShape = new Konva.Shape({
              sceneFunc: (context, shape) => {
                context.beginPath();
                context.moveTo(lineStartPosition.x, lineStartPosition.y);
                context.bezierCurveTo(
                  ctrlPoint1.x, ctrlPoint1.y,
                  ctrlPoint2.x, ctrlPoint2.y,
                  lineEndPosition.x, lineEndPosition.y
                );
                context.strokeShape(shape);
              },
              stroke: 'green',
              strokeWidth: 5,
              name: 's-shape',
              draggable: true
            });

            this.canvasLayer.add(sShape);
            this.canvasLayer.batchDraw();

            this.currentConnection.start.setAttr('draggable', false);
            this.currentConnection.end.setAttr('draggable', false);
            // set the color of the circles to green
            this.currentConnection.inputCircle.fill('green');
            this.currentConnection.outputCircle.fill('green');
            this.currentConnection = null;
            this.isDrawingConnection = false;
          }
        } else {

          alert('Invalid connection attempt');
          this.currentConnection = null;
        }
      }
    }
  }

  isCompleteCircuit(): boolean {
    const visited = new Set<Konva.Group>();
    const stack = [];

    // Find all input gates
    const inputGates = this.connections
      .filter(conn => conn.inputCircle)
      .map(conn => conn.start);

    // Initialize stack with input gates
    stack.push(...inputGates);

    while (stack.length > 0) {
      const currentGate = stack.pop();
      if (!currentGate || visited.has(currentGate)) {
        continue;
      }

      visited.add(currentGate);

      // Check if current gate is an output gate
      const isOutputGate = this.connections.some(conn => conn.end === currentGate && conn.outputCircle);
      if (isOutputGate) {
        return true;
      }

      // Add connected gates to stack
      const connectedGates = this.connections
        .filter(conn => conn.start === currentGate)
        .map(conn => conn.end);

      stack.push(...connectedGates);
    }

    return false;
  }

  checkCircuit(): void {
    if (this.connections.length === 0) {
      this.toast.error('Please connect some gates first');
      return;
    }
    if (this.isCompleteCircuit()) {
      this.toast.success('The circuit is complete. Well done!');
    } else {
      this.toast.error('The circuit is incomplete. Please connect all gates.');
    }
  }
}
