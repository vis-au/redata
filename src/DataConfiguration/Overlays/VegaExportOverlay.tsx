import * as React from 'react';
import { DatasetNode, GraphNode, InlineDatasetNode, PlotTemplate, SpecCompiler } from 'toolkitmodel';
import { Datasets } from 'vega-lite/build/src/spec/toplevel';

import './VegaExportOverlay.css';

interface Props {
  datasets: GraphNode[],
  visible: boolean
}
interface State {
  selectedDatasets: DatasetNode[]
}

export default class VegaExportOverlay extends React.Component<Props, State> {
  private specCompiler: SpecCompiler;

  constructor(props: Props) {
    super(props);

    this.specCompiler = new SpecCompiler();

    this.renderDatasetOption = this.renderDatasetOption.bind(this);

    this.state = {
      selectedDatasets: []
    };
  }

  private onChangeSelectedDataset(dataset: DatasetNode) {
    const selectedDatasets = this.state.selectedDatasets;
    const indexInSelectedDatasets = selectedDatasets.indexOf(dataset);

    if (indexInSelectedDatasets === -1) {
      selectedDatasets.push(dataset);
    } else {
      selectedDatasets.splice(indexInSelectedDatasets, 1);
    }

    this.setState({
      selectedDatasets
    });
  }

  private getSelectedDatasetsDict(): Datasets {
    const selectedDatasets: Datasets = {};

    this.state.selectedDatasets
      .filter(d => d instanceof InlineDatasetNode)
      .forEach(node => {
        const inlineSchema = node.getSchema();
        if ('values' in inlineSchema) {
          selectedDatasets[node.id] = inlineSchema.values;
        }
      });

    return selectedDatasets;
  }

  private exportDataToVega() {
    const datasets = this.getSelectedDatasetsDict();
    const dummyTemplate = new PlotTemplate();
    dummyTemplate.mark = 'area';
    dummyTemplate.datasets = datasets;

    const dummySchema = this.specCompiler.getVegaSpecification(dummyTemplate);

    return dummySchema;
  }

  private renderDatasetOption(dataset: DatasetNode) {
    return (
      <div key={ `option${dataset.id}` } className="datasetOption">
        <input
          id={ `option${dataset.id}` }
          className="datasetOption"
          value={ dataset.id }
          type="checkbox"
          onChange={ () => this.onChangeSelectedDataset(dataset)}/>
        <label htmlFor={ `option${dataset.id}` }>{ dataset.name }</label>
      </div>
    );
  }

  private renderNoDatasetMessage() {
    if (this.props.datasets.length > 0) {
      return null;
    }

    return (
      <p className="noDataMessage">Import some datasets first</p>
    );
  }

  private renderDatasetSelection() {
    const availableDatasetNodes = this.props.datasets.filter(d => d instanceof DatasetNode);

    return (
      <div className="datasetSelection">
        { this.renderNoDatasetMessage() }
        { availableDatasetNodes.map(this.renderDatasetOption) }
      </div>
    );
  }

  public render() {
    const isPreviewHidden = this.props.visible ? '' :  'hidden';

    return (
      <div className={ `vegaExport ${isPreviewHidden}` }>
        <h2 className="message">Select Datasets to export as Vega-lite schema:</h2>
        { this.renderDatasetSelection()}
        <textarea
          className="vegaLitePreview"
          onChange={ () => null }
          value={ JSON.stringify(this.exportDataToVega(), null, 2) } />
      </div>
    );
  }
}