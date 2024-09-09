import {Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import Konva from "konva";
import {KonvaEventObject} from "konva/lib/Node";
import {Connection} from "../../../models/connection.model";
import {NgxToastAlertsService} from "ngx-toast-alerts";
import {ClaudeService} from "../../../services/claude/claude.service";
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-simulator-canvas',
  standalone: true,
  imports: [
    NgIf,
    NgClass
  ],
  templateUrl: './simulator-canvas.component.html',
  styleUrl: './simulator-canvas.component.css'
})
export class SimulatorCanvasComponent implements OnInit {
  @ViewChild('stageContainer', { static: true }) stageContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('toolbarContainer', { static: true }) toolbarContainer!: ElementRef<HTMLDivElement>;

  constructor(private claudeService: ClaudeService) {}

  @Input() canvasWidth!: number | null;
  @Input() canvasHeight!: number | null;

  canvasStage!: Konva.Stage;
  canvasLayer!: Konva.Layer;

  toolbarStage!: Konva.Stage;
  toolbarLayer!: Konva.Layer;

  draggedGate: Konva.Group | null = null;

  selectedTool: 'select' | 'connect' = 'select';
  isDrawingConnection: boolean = false;

  @Output() connectionsEvent: EventEmitter<Connection[]> = new EventEmitter<Connection[]>();
  connections: Connection [] = [];
  currentConnection: Connection | null = null;

  private toast = inject(NgxToastAlertsService);

  isLoading: boolean = false;


  ngOnInit(): void {
    this.initializeKonva();
    this.createGridBackground();
    this.createToolbar();
    this.setupCanvasDragListeners();
    this.setupLayerWatchers();
  }

  initializeKonva(): void {
    const containerWidth = this.canvasWidth ? this.canvasWidth : this.stageContainer.nativeElement.offsetWidth;
    const containerHeight = this.canvasHeight ? this.canvasHeight : this.stageContainer.nativeElement.offsetHeight;

    this.canvasStage = new Konva.Stage({
      container: this.stageContainer.nativeElement,
      width: containerWidth,
      height: containerHeight,
    });

    // this.canvasStage.container().style.backgroundColor = '#f0f0f0';
    this.canvasLayer = new Konva.Layer();
    this.canvasLayer.setAttr('type', 'canvasLayer');
    this.canvasStage.add(this.canvasLayer);
    this.stageContainer.nativeElement.style.height = `${containerHeight}px`;
    this.stageContainer.nativeElement.style.width = `${containerWidth}px`;
  }

  createGridBackground(): void {
    const gridLayer = new Konva.Layer();
    const gridSize = 20;
    const stageWidth = this.canvasStage.width();
    const stageHeight = this.canvasStage.height();

    // Add a white background
    const background = new Konva.Rect({
      x: 0,
      y: 0,
      width: stageWidth,
      height: stageHeight,
      fill: '#f0f0f0'
    });
    gridLayer.add(background);

    const buffer = 1;
    for (let x = 0; x <= stageWidth + buffer; x += gridSize) {
      const line = new Konva.Line({
        points: [x, 0, x, stageHeight],
        stroke: '#ddd',
        strokeWidth: 0.5
      });
      gridLayer.add(line);
    }

    for (let y = 0; y <= stageHeight + buffer; y += gridSize) {
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
    const toolbarWidth = this.canvasWidth ? this.canvasWidth : this.toolbarContainer.nativeElement.offsetWidth;
    const toolbarHeight = 100;

    this.toolbarContainer.nativeElement.style.height = `${toolbarHeight}px`;
    this.toolbarContainer.nativeElement.style.width = `${toolbarWidth}px`;

    this.toolbarStage = new Konva.Stage({
      container: this.toolbarContainer.nativeElement,
      width: toolbarWidth,
      height: toolbarHeight,
    });

    this.toolbarLayer = new Konva.Layer();
    this.toolbarStage.add(this.toolbarLayer);

    const toolbarItems = ['AND', 'OR', 'NOT', 'LightBulb', 'One', 'Zero', 'Connector', 'Reset'];
    const itemWidth = toolbarWidth / toolbarItems.length;
    const itemHeight = toolbarHeight;

    toolbarItems.forEach((item, index) => {
      const x = index * itemWidth;
      const y = 0;
      this.createToolbarItem(item, x, y, itemWidth, itemHeight);
    });

    this.toolbarLayer.draw();
  }

  createToolbarItem(type: string, x: number, y: number, width: number, height: number): void {
    switch (type) {
      case 'Connector':
        this.createConnectorTool(x, y, width, height);
        break;
      case 'Reset':
        this.createResetButton(x, y, width, height);
        break;
      default:
        this.createGateIcon(type, x, y, width, height);
    }
  }

  createGateIcon(type: string, x: number, y: number, width: number, height: number): void {
    const iconSize = Math.min(width, height) * 0.6;
    const iconX = x + (width - iconSize) / 2;
    const iconY = y + (height - iconSize) / 2;

    const properties = {
      draggable: false,
      id: `gate-${Date.now()}-${Math.random()}`,
      isToolbarIcon: true,
      name: type
    };

    let gate = this.createIconByType(type, iconX, iconY, properties);
    gate.scale({ x: iconSize / 50, y: iconSize / 50 }); // Assuming original icon size is 50x50


    gate.on('click', () => {
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
          this.toast.error('The center of the canvas is not free. Please move the elements currently at the center to make space for a new one.');
          return;
        }
      }

      const clonedProperties = {
        draggable: true,
        id: `cloned-${gate.id()}-${Date.now()}-${Math.random()}`,
        isToolbarIcon: false,
        name: type,
        original: gate.id()
      };
      const cloned = this.createIconByType(gate.getAttr('name'), posX, posY, clonedProperties);

      this.canvasLayer.add(cloned);
      this.handleCanvasGate(cloned);
      this.canvasStage.batchDraw();
      this.canvasLayer.fire('add', { target: cloned });
    });

    this.toolbarLayer.add(gate);
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

  createConnectorTool(x: number, y: number, width: number, height: number): void {
    const iconSize = Math.min(width, height) * 0.6;
    const iconX = x + (width - iconSize) / 2;
    const iconY = y + (height - iconSize) / 2;

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

    this.toolbarLayer.add(connectorGroup);
  }

  createResetButton(x: number, y: number, width: number, height: number): void {
    const iconSize = Math.min(width, height) * 0.6;
    const iconX = x + (width - iconSize) / 2;
    const iconY = y + (height - iconSize) / 2;

    Konva.Image.fromURL("public/images/reset.png", (imageNode) => {
      imageNode.setAttrs({
        x: iconX,
        y: iconY,
        width: iconSize,
        height: iconSize,
        draggable: false,
      });

      imageNode.on('click', () => {
        this.canvasLayer.destroyChildren();
        this.canvasLayer.draw();
        this.connections = [];
        this.connectionsEvent.emit(this.connections);
      });

      this.toolbarLayer.add(imageNode);
    });
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

    circle.on('click', () => {
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
            this.connectionsEvent.emit(this.connections);

            this.drawConnectionLine(this.currentConnection.inputCircle, this.currentConnection.outputCircle);
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
    this.isLoading = true;
    const image = this.getCanvasSnapshotImageData();

    if (this.isCompleteCircuit()) {
      this.claudeService.verifyLogicGateCircuit(image)
        .then((response) => {
          const confidence = response[0].text;
          const responseTextArray = response[0].text.split(' ');
          const percentage = responseTextArray.filter((word: string) => word.includes('%'))[0];
          const confidenceNumber = parseFloat(percentage.replace('%', ''));
          if (confidenceNumber < 50) {
            this.toast.error(`The circuit is incomplete. Confidence: ${confidence}`);
          }
          else {
            this.toast.success(`The circuit is complete. Confidence: ${confidence}`);
          }
        })
        .catch((error) => {
          this.toast.error('Failed to verify circuit: ' + error.message);
        })
        .finally(() => {
          this.isLoading = false;
        });
    } else {
      this.toast.error('The circuit is incomplete. Please connect all gates.');
    }
  }

  createAndSampleCircuit(): void {
    // Clear existing canvas
    this.canvasLayer.destroyChildren();
    this.connections = [];

    // Function to create a gate by simulating a click on the toolbar icon
    const createGate = (gateType: string, x: number, y: number): Konva.Group | null => {
      const toolbarIcon = this.toolbarLayer.findOne(`.${gateType}`) as Konva.Group;
      if (toolbarIcon) {
        // Simulate a click on the toolbar icon
        toolbarIcon.fire('click');

        // Find the newly created gate on the canvas
        const newGate = this.canvasLayer.findOne((node: Konva.Node) => {
          const canvasCenterX = this.canvasStage.width() / 2;
          const canvasCenterY = this.canvasStage.height() / 2;
          return node.id().startsWith(`cloned-${toolbarIcon.id()}`) && node.getAttr("original") === toolbarIcon.id() && node.x() === canvasCenterX && node.y() === canvasCenterY;
        }) as Konva.Group;
        if (newGate) {
          // Position the gate
          newGate.position({ x, y });
          this.canvasLayer.batchDraw();
          return newGate;
        }
      }
      this.toast.error(`Failed to create ${gateType} gate`);
      return null;
    };

    // Create gates
    const andGate = createGate('AND', 200, 200);
    const oneGate1 = createGate('One', 100, 150);
    const oneGate2 = createGate('One', 100, 250);
    const lightBulb = createGate('LightBulb', 300, 200);

    // Ensure all gates were created successfully
    if (andGate && oneGate1 && oneGate2 && lightBulb) {
      // Connect gates
      // find the output circle of the oneGate1 and trigger a click event
      const one1OutputCircle = oneGate1.findOne((node: Konva.Node) => {
        return node.getAttr('circleType') === 'output';
      }) as Konva.Circle;
      const one2OutputCircle = oneGate2.findOne((node: Konva.Node) => {
        return node.getAttr('circleType') === 'output';
      }) as Konva.Circle;
      const andInputCircles = andGate.find((node: Konva.Node) => {
        return node.getAttr('circleType') === 'input';
      });
      const andOutputCircle = andGate.findOne((node: Konva.Node) => {
        return node.getAttr('circleType') === 'output';
      }) as Konva.Circle;
      const bulbInputCircle = lightBulb.findOne((node: Konva.Node) => {
        return node.getAttr('circleType') === 'input';
      }) as Konva.Circle;

      if (one1OutputCircle && one2OutputCircle && andInputCircles && andInputCircles.length == 2 && bulbInputCircle) {
         this.drawConnectionLine(one1OutputCircle, andInputCircles[0] as Konva.Circle);
         const connection1 = {
           start: oneGate1,
            end: andGate,
            inputCircle: one1OutputCircle,
            outputCircle: andInputCircles[0] as Konva.Circle
         }

         this.drawConnectionLine(one2OutputCircle, andInputCircles[1] as Konva.Circle);
         const connection2 = {
            start: oneGate2,
            end: andGate,
            inputCircle: one2OutputCircle,
            outputCircle: andInputCircles[1] as Konva.Circle
         }

         this.drawConnectionLine(andOutputCircle, bulbInputCircle);
         const connection3 = {
            start: andGate,
            end: lightBulb,
            inputCircle: andOutputCircle,
            outputCircle: bulbInputCircle
         };

         this.connections.push(connection1, connection2, connection3);
         this.connectionsEvent.emit(this.connections);

        // prevent dragging of the gates
        andGate.setAttr('draggable', false);
        oneGate1.setAttr('draggable', false);
        oneGate2.setAttr('draggable', false);
        lightBulb.setAttr('draggable', false);
      }
    } else {
      this.toast.error('Failed to create all gates');
    }
    this.canvasLayer.draw();
  }

  drawConnectionLine(start: Konva.Circle, end: Konva.Circle): void {
    const lineStartPosition = start.getAbsolutePosition();
    const lineEndPosition = end.getAbsolutePosition();

    const sShape = new Konva.Shape({
      sceneFunc: (context, shape) => {
        context.beginPath();
        context.moveTo(lineStartPosition.x, lineStartPosition.y);
        context.bezierCurveTo(
          lineStartPosition.x + 50, lineStartPosition.y,
          lineEndPosition.x - 50, lineEndPosition.y,
          lineEndPosition.x, lineEndPosition.y
        );
        context.strokeShape(shape);
      },
      stroke: 'green',
      strokeWidth: 2,
      name: 's-shape',
      draggable: false
    });

    this.canvasLayer.add(sShape);
    this.canvasLayer.batchDraw();
  }

  takeCanvasSnapshot(): void {
    const dataUrl = this.canvasStage.toDataURL({pixelRatio: 5});
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'circuit.png';
    link.click();
  }

  getCanvasSnapshotImageData(): string {
    return this.canvasStage.toDataURL({pixelRatio: 5});
  }
}
