import {Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import Konva from "konva";
import {KonvaEventObject} from "konva/lib/Node";
import {Connection} from "../../../models/connection.model";
import {NgxToastAlertsService} from "ngx-toast-alerts";
import {ClaudeService} from "../../../services/claude/claude.service";
import {NgClass, NgIf} from "@angular/common";
import {GateCircle} from "../../../models/konva/gate-circle.konva";
import {BoxIcon} from "../../../models/konva/box-icon.konva";
import {AndGate} from "../../../models/konva/gate-and.konva";
import {OrGate} from "../../../models/konva/gate-or.konva";
import {NotGate} from "../../../models/konva/gate-not.konva";
import {GateBulb} from "../../../models/konva/gate-bulb.konva";
import {GateConnector} from "../../../models/konva/gate-connector.konva";
import {Gate} from "../../../models/konva/gate.konva";
import {Router} from "@angular/router";
import {CircuitGraph} from "../../../models/specials/gate-circuit-graph";

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

  constructor(private claudeService: ClaudeService, private router: Router) {
    this.processCircleClick = this.processCircleClick.bind(this);
    this.handleConnectorClick = this.handleConnectorClick.bind(this);
    this.circuitGraph = new CircuitGraph();
  }

  @Input() canvasWidth!: number | null;
  @Input() canvasHeight!: number | null;

  @Output() connectionsEvent: EventEmitter<Connection[]> = new EventEmitter<Connection[]>();
  @Output() sampleCircuitBtnActiveEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  canvasStage!: Konva.Stage;
  canvasLayer!: Konva.Layer;
  toolbarStage!: Konva.Stage;
  toolbarLayer!: Konva.Layer;

  draggedGate: Konva.Group | null = null;
  selectedTool: 'select' | 'connect'  = 'select';

  isDrawingConnection: boolean = false;

  connections: Connection [] = [];
  currentConnection: Connection | null = null;

  circuitGraph!: CircuitGraph;

  toast = inject(NgxToastAlertsService);
  isLoading: boolean = false;


  ngOnInit(): void {
    this.initializeKonva();
    this.createGridBackground();
    this.createToolbar();
    this.setupCanvasDragListeners();
    this.setupLayerWatchers();
  }

  private initializeKonva(): void {
    const containerWidth = this.canvasWidth ? this.canvasWidth : this.stageContainer.nativeElement.offsetWidth;
    const containerHeight = this.canvasHeight ? this.canvasHeight : this.stageContainer.nativeElement.offsetHeight;

    this.canvasStage = new Konva.Stage({
      container: this.stageContainer.nativeElement,
      width: containerWidth,
      height: containerHeight,
    });

    this.canvasLayer = new Konva.Layer();
    this.canvasLayer.setAttr('type', 'canvasLayer');
    this.canvasStage.add(this.canvasLayer);
    this.stageContainer.nativeElement.style.height = `${containerHeight}px`;
    this.stageContainer.nativeElement.style.width = `${containerWidth}px`;
  }

  private createGridBackground(): void {
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

  private createToolbar(): void {
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

  private createToolbarItem(type: string, x: number, y: number, width: number, height: number): void {
    switch (type) {
      case 'Connector':
        const connector = new GateConnector({x, y, _width: width, _height: height, handleClick: this.handleConnectorClick});
        this.toolbarLayer.add(connector);
        this.selectedTool = 'select';
        break;
      case 'Reset':
        this.createResetButton(x, y, width, height);
        break;
      default:
        this.createGateIcon(type, x, y, width, height);
    }
  }

  private createGateIcon(type: string, x: number, y: number, width: number, height: number): void {
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
    gate.scale({ x: iconSize / 50, y: iconSize / 50 });


    gate.on('click', () => {
      if (this.selectedTool === 'connect' || this.isDrawingConnection) {
        this.toast.error('Ensure the connector tool is inactive before adding a new gate');
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
      this.sampleCircuitBtnActiveEvent.emit(false);
    });


    this.toolbarLayer.add(gate);

  }

  private isPositionFree(x: number, y: number): boolean {
    const stageChildren = this.canvasLayer.getChildren();
    for (const child of stageChildren) {

      const gatePos = child.position();

      if (x == gatePos.x && y == gatePos.y) {
        return false;
      }
    }
    return true;
  }

  handleConnectorClick(event: KonvaEventObject<MouseEvent>): void {
    const connectorGate = event.target as Konva.Rect;
    this.selectedTool = this.selectedTool === 'connect' ? 'select' : 'connect';
    connectorGate.fill(this.selectedTool === 'connect' ? 'yellow' : 'lightgray');
    if (this.selectedTool === 'select') {
      this.isDrawingConnection = false;
      this.currentConnection = null;
      this.connections = [];
    }
  }

  private createResetButton(x: number, y: number, width: number, height: number): void {
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
        this.sampleCircuitBtnActiveEvent.emit(false);
      });

      this.toolbarLayer.add(imageNode);
    });
  }

  private handleCanvasGate(gate: Gate): void {
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

    gate.on('contextmenu', (e: KonvaEventObject<MouseEvent>) => {
      e.evt.preventDefault();
      const hasConnection = this.connections.some(conn => conn.start === gate || conn.end === gate);
      if (!hasConnection) {
        gate.destroy();
        this.canvasLayer.batchDraw();
      } else {
        this.toast.error('Cannot delete gate with existing connections');
      }
    });
  }

  private setupCanvasDragListeners(): void {
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

  private isCircleInsideCanvas(circle: Konva.Circle): boolean {
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

  private createIconByType(type: string, x: number, y: number, attributes: object): Gate {
    let gate: Gate;

    switch (type) {
      case 'AND':
        gate = new AndGate({x, y, handleCircleClick: this.processCircleClick});
        break;
      case 'OR':
        gate = new OrGate({x, y, handleCircleClick: this.processCircleClick});
        break;
      case 'NOT':
        gate = new NotGate({x, y, handleCircleClick: this.processCircleClick});
        break;
      case 'LightBulb':
        gate = new GateBulb({x, y, handleCircleClick: this.processCircleClick});
        break;
      case 'One':
        gate = new BoxIcon({x, y, textValue: '1', handleCircleClick: this.processCircleClick, outputValue: true});
        break;
      case 'Zero':
        gate = new BoxIcon({x, y, textValue: '0', handleCircleClick: this.processCircleClick, outputValue: false});
        break;
      default:
        this.toast.error(`Error Setting Up Simulator Environment: Contact Support`);
        this.router.navigate(['/']);
        throw new Error('Error Setting Up Simulator Environment: Contact Support');
    }

    gate.setAttrs(attributes);
    return gate;
  }

  private processCircleClick(event: KonvaEventObject<MouseEvent>): void {
    const circle = event.target as GateCircle;
    if (this.selectedTool === 'connect' && this.isCircleInsideCanvas(circle)) {
      const parent = circle.getParent() as Konva.Group;
      const circleType = circle.getAttr('circleType');

      if (!this.currentConnection) {
        this.startNewConnection(circle, parent, circleType);
      } else {
        this.attemptToCloseConnection(circle, parent, circleType);
      }
    }
  }

  private startNewConnection(circle: GateCircle, parent: Konva.Group, circleType: string): void {
    if (circle.getAttr('HasConnection')) {
      this.toast.error('Please start a fresh connection. The selected gate already has a connection');
      return;
    }
    this.currentConnection = {
      start: null,
      end: null,
      endCircle: circleType === 'input' ? circle : null,
      startCircle: circleType === 'output' ? circle : null,
    };
    if (circleType === 'input') {
      this.currentConnection.end = parent;
    }
    else if (circleType === 'output') {
      this.currentConnection.start = parent;
    }

    this.isDrawingConnection = true;
    circle.setAttr('HasConnection', true);
  }

  private attemptToCloseConnection(circle: GateCircle, parent: Gate, circleType: string): void {
    if (this.isValidConnectionAttempt(circle, parent, circleType)) {
      this.completeConnection(circle, parent, circleType);
    } else {
      this.toast.error('Invalid connection attempt');
      this.currentConnection = null;
    }
  }

  private isValidConnectionAttempt(circle: GateCircle, parent: Gate, circleType: string): boolean {
    const isDifferentParent = parent !== this.currentConnection?.start;
    const isDifferentCircleTypeFromInput = circleType !== this.currentConnection?.startCircle?.getAttr('circleType');
    const isDifferentCircleTypeFromOutput = circleType !== this.currentConnection?.endCircle?.getAttr('circleType');
    const hasNoConnection = !circle.getAttr('HasConnection');

    return isDifferentParent && isDifferentCircleTypeFromInput && isDifferentCircleTypeFromOutput && hasNoConnection;
  }

  private completeConnection(circle: GateCircle, parent: Gate, circleType: string): void {
    if (this.currentConnection){
      if (circleType === 'input') {
        this.currentConnection.endCircle = circle;
        this.currentConnection.end = parent;
      } else if (circleType === 'output') {
        this.currentConnection.startCircle = circle;
        this.currentConnection.start = parent;
      }
    }

    if (this.isCompleteCurrentConnection()) {
      this.finalizeCurrentConnection();
    }
  }

  private isCompleteCurrentConnection(): boolean {
    return (
      this.currentConnection !== null &&
      this.currentConnection.startCircle !== null &&
      this.currentConnection.endCircle !== null &&
      this.currentConnection.start !== null &&
      this.currentConnection.end !== null &&
      this.currentConnection.start !== this.currentConnection.end &&
      this.currentConnection.startCircle.getAttr('circleType') !== this.currentConnection.endCircle.getAttr('circleType')
    );
  }

  private finalizeCurrentConnection(): void {

    if (this.currentConnection) {
      this.connections.push(this.currentConnection);
      this.connectionsEvent.emit(this.connections);

      if (this.currentConnection.startCircle && this.currentConnection.endCircle) {
        this.drawConnectionLine(this.currentConnection.startCircle, this.currentConnection.endCircle);

        if (this.currentConnection.start && this.currentConnection.end) {
          this.setDraggable(this.currentConnection.start, false);
          this.setDraggable(this.currentConnection.end, false);
        }
        if (this.currentConnection.startCircle && this.currentConnection.endCircle) {
        this.setCircleFillColor(this.currentConnection.startCircle, 'green');
        this.setCircleFillColor(this.currentConnection.endCircle, 'green');
        }
        this.circuitGraph = new CircuitGraph();
        this.circuitGraph.buildGraph(this.connections);
        this.circuitGraph.evaluateCircuit();
        this.updateVisuals();
      }
      this.resetCurrentConnection();
    }
  }


  private setDraggable(node: Konva.Node, draggable: boolean): void {
    node.setAttr('draggable', draggable);
  }

  private setCircleFillColor(circle: GateCircle, color: string): void {
    circle.fill(color);
  }

  private resetCurrentConnection(): void {
    this.currentConnection = null;
    this.isDrawingConnection = false;
  }

  private isCompleteCircuit(): boolean {
    const visited = new Set<Konva.Group>();
    const stack = [];

    // Find all input gates
    const inputGates = this.connections
      .filter(conn => conn.startCircle)
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
      const isOutputGate = this.connections.some(conn => conn.end === currentGate && conn.endCircle);
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

  private getCanvasSnapshotImageData(): string {
    return this.canvasStage.toDataURL({pixelRatio: 5});
  }

  drawConnectionLine(start: GateCircle, end: GateCircle): void {
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

  private updateVisuals(): void {
    this.connections.forEach(conn => {
      if (conn.startCircle && conn.endCircle) {
        this.setCircleFillColor(conn.startCircle, conn.outputValue ? 'green' : 'red');
        this.setCircleFillColor(conn.endCircle, conn.outputValue ? 'green' : 'red');
      }

      if (conn.end){
        // find the bulb gate
        const gate = conn.end;
        if (gate instanceof GateBulb) {
          const bulbFilament = gate.findOne((node: Konva.Line) => node.stroke() === 'red'
            || node.stroke() === 'green') as Konva.Line;
          if (bulbFilament) {
            bulbFilament.stroke(gate.getAttr('outputValue') ? 'green' : 'red');
          }
        }
      }
    });
    this.canvasLayer.batchDraw();
  }

  createAndSampleCircuit(): void {
    if (this.selectedTool === 'connect' || this.isDrawingConnection) {
      this.toast.error('Please switch to the select tool before creating a sample circuit');
      return;
    }
    // Clear existing canvas
    this.canvasLayer.destroyChildren();
    this.connections = [];

    // Function to create a gate by simulating a click on the toolbar icon
    const createGate = (gateType: string, x: number, y: number): Gate | null => {
      const toolbarIcon = this.toolbarLayer.findOne(`.${gateType}`) as Gate;
      if (toolbarIcon) {
        // Simulate a click on the toolbar icon
        toolbarIcon.fire('click');

        // Find the newly created gate on the canvas
        const newGate = this.canvasLayer.findOne((node: Gate) => {
          const canvasCenterX = this.canvasStage.width() / 2;
          const canvasCenterY = this.canvasStage.height() / 2;
          return node.id().startsWith(`cloned-${toolbarIcon.id()}`) && node.getAttr("original") === toolbarIcon.id() && node.x() === canvasCenterX && node.y() === canvasCenterY;
        }) as Gate;
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
      }) as GateCircle;
      const one2OutputCircle = oneGate2.findOne((node: Konva.Node) => {
        return node.getAttr('circleType') === 'output';
      }) as GateCircle;
      const andInputCircles = andGate.find((node: Konva.Node) => {
        return node.getAttr('circleType') === 'input';
      });
      const andOutputCircle = andGate.findOne((node: Konva.Node) => {
        return node.getAttr('circleType') === 'output';
      }) as GateCircle;
      const bulbInputCircle = lightBulb.findOne((node: Konva.Node) => {
        return node.getAttr('circleType') === 'input';
      }) as GateCircle;

      if (one1OutputCircle && one2OutputCircle && andInputCircles && andInputCircles.length == 2 && bulbInputCircle) {
         this.drawConnectionLine(one1OutputCircle, andInputCircles[0] as GateCircle);
         const connection1 = {
           start: oneGate1,
            end: andGate,
            startCircle: one1OutputCircle,
            endCircle: andInputCircles[0] as GateCircle
         }

         this.drawConnectionLine(one2OutputCircle, andInputCircles[1] as GateCircle);
         const connection2 = {
            start: oneGate2,
            end: andGate,
            startCircle: one2OutputCircle,
            endCircle: andInputCircles[1] as GateCircle
         }

         this.drawConnectionLine(andOutputCircle, bulbInputCircle);
         const connection3 = {
            start: andGate,
            end: lightBulb,
            startCircle: andOutputCircle,
            endCircle: bulbInputCircle
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

  takeCanvasSnapshot(): void {
    const dataUrl = this.canvasStage.toDataURL({pixelRatio: 5});
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'circuit.png';
    link.click();
  }
}
