import * as React from 'react';
import { DatasetNode, GraphNode, TransformNode } from 'remodel-vis';

import DatasetBuildingBlock from './DatasetBuildingBlock';

import './DatasetSelection.css';

interface Props {
  datasets: GraphNode[];
}

export default class DataflowNodeSelection extends React.Component<Props, {}> {
  private renderDatasetNode(node: DatasetNode) {
    const childNodes = node.getAllChildNodes();

    return (
      <div key={ node.id } className="branch">
        <DatasetBuildingBlock
          id={ `ReusableDataset${node.id}` }
          className="root"
          node={ node }
        />
        <div className="availableDatasetChildNodes">
          { childNodes.map(this.renderTransformNode.bind(this)) }
        </div>
      </div>
    );
  }

  private renderTransformNode(node: TransformNode) {
    const childNodes = node.getAllChildNodes();

    return (
      <div key={ node.id } className="branch">
        <DatasetBuildingBlock
          className="transform"
          id={ node.id }
          node={ node }
        />
        <div className="availableDatasetChildNodes">
          { childNodes.map(this.renderTransformNode.bind(this)) }
        </div>
      </div>
    );
  }

  private renderNoDatasetsNotice() {
    if (this.props.datasets.length > 0) { return false; }

    return (
      <div id="noDatasetNotice">no datasets</div>
    );
  }

  public render() {
    return (
      <div id="datasetSelectionComponent">
        <h2>Datasets</h2>
        <div id="datasetSelectionList" >
          { this.props.datasets.map(this.renderDatasetNode.bind(this)) }
        </div>
        { this.renderNoDatasetsNotice() }
      </div>
    );
  }
}