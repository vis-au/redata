import {Connection, jsPlumb, jsPlumbInstance} from 'jsplumb';
import * as React from 'react';
import { DatasetNode, GraphNode, TransformNode } from 'toolkitmodel';

import DiagramEditor from '../../Widgets/DiagramEditor';
import DatasetBlock from './Blocks/DatasetBlock';
import TransformBlock from './Blocks/TransformBlock';

import './DataFlowDiagram.css';


const dataflowDiagramPlumbingConfig = {
  Anchor: ['Left'],
  Connector: [ 'Flowchart', { stub: 25, cornerRadius: 1 } ],
  Endpoint: [ 'Dot', {'fill': 'steelblue', radius: 5} ],
  EndpointStyle: { fill: 'steelblue' },
  PaintStyle: {
    stroke: 'steelblue',
    strokeWidth: 2,
  },
};

interface Props {
  datasets: GraphNode[];
  focusedNode: GraphNode;
  selectFocusedNode: (newNode: GraphNode) => void;
  deselectFocusedNode: () => void;
  updateGraph: () => void;
}

export default class DataFlowDiagram extends React.Component<Props, {}> {
  private dragPlumbing: jsPlumbInstance;
  private graphNodeConnectionMap: Map<string, Connection[]>;
  private connectionGraphNodeMap: Map<string, GraphNode[]>;

  constructor(props: Props) {
    super(props);

    this.graphNodeConnectionMap = new Map();
    this.connectionGraphNodeMap = new Map();

    this.renderLinksForGraphNode = this.renderLinksForGraphNode.bind(this);

    this.dragPlumbing = jsPlumb.getInstance();
  }

  private onNewConnection(info: any, originalEvent?: any) {
    const connection = info.connection;

    // source can either be a dataset or transform node, so id is stored in different elements
    const sourceNode = this.props.datasets.find(node => {
      return node.id === info.source.parentNode.id || node.id === info.source.id;
    });
    const targetNode = this.props.datasets
      .find(node => {
        return node.id === info.target.parentNode.id || node.id === info.target.id;
      });

    if (sourceNode.children.indexOf(targetNode as TransformNode) === -1) {
      sourceNode.children.push(targetNode as TransformNode);
    }

    targetNode.parent = sourceNode;

    this.connectionGraphNodeMap.set(connection.id, [sourceNode, targetNode]);

    if (this.graphNodeConnectionMap.get(sourceNode.id) === undefined) {
      this.graphNodeConnectionMap.set(sourceNode.id, []);
    }
    if (this.graphNodeConnectionMap.get(targetNode.id) === undefined) {
      this.graphNodeConnectionMap.set(targetNode.id, []);
    }

    const sourceNodeConnections = this.graphNodeConnectionMap.get(sourceNode.id);
    sourceNodeConnections.push(connection);
    const targetNodeConnections = this.graphNodeConnectionMap.get(targetNode.id);
    targetNodeConnections.push(connection);

    // jsplumb original event undefined --> conenctions was created programmatically and not by the
    // user, which means that a preset was added, therefore the state must not be updated
    if (originalEvent !== undefined) {
      this.props.updateGraph();
    }
  }

  private onConnectionMoved(event: any) {
    this.props.updateGraph();
  }

  private onDetachedConnection(event: any) {
    this.props.updateGraph();
  }

  private onNodeChanged() {
    // flowsplumging is not set up on element creation, therefore check if undefined here
    if (this.dragPlumbing !== undefined) {
      this.dragPlumbing.repaintEverything();
    }

    this.props.updateGraph();
  }

  private deleteNode(node: GraphNode) {
    const datasets = this.props.datasets;
    const indexInDatasets = datasets.indexOf(node);

    const connections = this.graphNodeConnectionMap.get(node.id);

    connections.forEach(connection => {
      this.connectionGraphNodeMap.delete(connection.id);
    });

    this.graphNodeConnectionMap.delete(node.id);

    if (indexInDatasets === -1) {
      return;
    }

    node.children.forEach(childNode => childNode.parent = null);

    datasets.splice(indexInDatasets, 1);
    this.props.updateGraph();
  }

  private renderTransformBlock(node: TransformNode) {
    return (
      <TransformBlock
        node={ node }
        key={ node.id }
        dragPlumbing={ this.dragPlumbing }
        focusedNode={ this.props.focusedNode }
        updateGraph={ this.props.updateGraph }
        onClick={ this.props.selectFocusedNode.bind(this) }
        onNodeChanged={ this.onNodeChanged.bind(this) }
        onDelete={ () => this.deleteNode(node)} />
    );
  }

  private renderDatasetBlock(node: DatasetNode) {
    return (
      <DatasetBlock
        node={ node }
        key={ node.id }
        dragPlumbing={ this.dragPlumbing }
        focusedNode={ this.props.focusedNode }
        updateGraph={ this.props.updateGraph }
        onClick={ this.props.selectFocusedNode.bind(this) }
        onDelete={ () => this.deleteNode(node)} />
    );
  }

  private renderNodesAsBlocks() {
    return this.props.datasets.map(node => {
      if (node instanceof TransformNode) {
        return this.renderTransformBlock(node);
      } else if (node instanceof DatasetNode) {
        return this.renderDatasetBlock(node);
      }
    });
  }

  private renderLinksForGraphNode(node: GraphNode) {
    node.children.forEach(childNode => {
      const sourceSelector = document.querySelector(`#${node.id}`);
      const targetSelector = document.querySelector(`#${childNode.id} .body`);

      (this.dragPlumbing as any).connect({
        source: sourceSelector,
        target: targetSelector,
        endpointStyle: dataflowDiagramPlumbingConfig
      });
    });
  }

  public render() {
    return (
      <DiagramEditor
        id="data_flow"
        dragPlumbing={ this.dragPlumbing }
        plumbingConfig={ dataflowDiagramPlumbingConfig }
        onNewConnection={ this.onNewConnection.bind(this) }
        onConnectionMoved={ this.onConnectionMoved.bind(this) }
        onDetachedConnection={ this.onDetachedConnection.bind(this) }
        onDiagramClicked={ this.props.deselectFocusedNode.bind(this) }
        renderBlocks={ this.renderNodesAsBlocks.bind(this) }
      />
    );
  }

  public componentDidUpdate() {
    this.props.datasets
      .filter(node => {
        const noOfConnectionsInData = node.children.length;

        const mapEntry = this.graphNodeConnectionMap.get(node.id);

        if (mapEntry === undefined) {
          return true;
        }

        const noOfConnectionsInView = mapEntry.length;
        return noOfConnectionsInData > noOfConnectionsInView;
      })
      .forEach(this.renderLinksForGraphNode);

    this.dragPlumbing.repaintEverything();
  }
}
