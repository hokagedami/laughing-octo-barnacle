import {GateNode} from "./gate-node";
import {Gate} from "../konva/gate.konva";
import {Connection} from "../connection.model";

export class CircuitGraph {
  nodes: Map<string, GateNode>;

  constructor() {
    this.nodes = new Map();
  }

  addNode(gate: Gate): void {
    const id = gate.id();
    if (!this.nodes.has(id)) {
      this.nodes.set(id, new GateNode(gate));
    }
  }

  addConnection(startGate: Gate, endGate: Gate): void {
    const startId = startGate.id();
    const endId = endGate.id();

    this.addNode(startGate);
    this.addNode(endGate);

    const startNode = this.nodes.get(startId)!;
    const endNode = this.nodes.get(endId)!;

    startNode.output = endNode;
    endNode.inputs.push(startNode);
  }

  buildGraph(connections: Connection[]): void {
    connections.forEach(conn => {
      if (conn.start && conn.end) {
        this.addConnection(conn.start, conn.end);
      }
    });
  }

  evaluateCircuit(): void {
    const inputStack: GateNode[] = [];
    const outputStack: GateNode[] = [];

    // Reset all node output values and find input nodes
    this.nodes.forEach(node => {
      node.outputValue = null;
      const gateType = node.gate.getAttr('name');
      if (node.inputs.length === 0 || gateType === 'One' || gateType === 'Zero') {
        inputStack.push(node);
      }
    });

    while (inputStack.length > 0) {
      const node = inputStack.pop()!;

      if (this.evaluateGate(node)) {
        // If the node's value changed or was initially set, propagate to outputs
        if (node.output && node.output.outputValue === null) {
          outputStack.push(node.output);
        }
      }
    }

    while (outputStack.length > 0) {
      const node = outputStack.pop()!;

      if (this.evaluateGate(node)) {
        // If the node's value changed or was initially set, propagate to outputs
        if (node.output && node.output.outputValue === null) {
          outputStack.push(node.output);
        }
      }
    }

    // Check for unevaluated nodes
    this.nodes.forEach((node, id) => {
      if (node.outputValue === null) {
        console.warn(`Node ${id} (${node.gate.getAttr('name')}) could not be evaluated. Possible circular dependency.`);
      }
    });
  }

  private evaluateGate(node: GateNode): boolean {
    const gate = node.gate;
    const gateType = gate.getAttr('name');
    let newOutputValue: boolean | null = null;

    switch (gateType) {
      case 'One':
        newOutputValue = true;
        break;
      case 'Zero':
        newOutputValue = false;
        break;
      case 'AND':
      case 'OR':
      case 'NOT':
      case 'LightBulb':
        const inputValues = node.inputs.map(input => input.outputValue);
        if (inputValues.includes(null)) {
          // Not all inputs are ready
          return false;
        }
        if (gateType === 'AND') {
          newOutputValue = inputValues.every(v => v === true);
        } else if (gateType === 'OR') {
          newOutputValue = inputValues.some(v => v === true);
        } else if (gateType === 'NOT') {
          newOutputValue = !inputValues[0];
        } else if (gateType === 'LightBulb') {
          newOutputValue = inputValues[0] as boolean;
        }
        break;
      default:
        console.error(`Unknown gate type: ${gateType}`);
        return false;
    }

    if (newOutputValue !== node.outputValue) {
      node.outputValue = newOutputValue;
      gate.setAttr('outputValue', newOutputValue);
      return true; // Value changed
    }

    return false; // Value didn't change
  }
}
