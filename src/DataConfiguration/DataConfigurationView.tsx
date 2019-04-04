import * as React from 'react';

import DatasetNode from '../Model/DataModel/Datasets/DatasetNode';
import GraphNode from '../Model/DataModel/GraphNode';
import ViewContainer from '../ToolkitView/ViewContainer';
import DataFlowDiagram from './Diagram/DataFlowDiagram';
import DataFlowSidebar from './Sidebar/DataFlowSidebar';
import DataFlowToolbar from './Toolbar/DataFlowToolbar';
import DataImportPanel from './Toolbar/DataImportPanel';

import { Data } from 'vega-lite/build/src/data';
import { Datasets } from 'vega-lite/build/src/spec/toplevel';
import PlotTemplate from '../Model/TemplateModel/PlotTemplate';
import SpecCompiler from '../Model/TemplateModel/SpecCompiler';
import './DataConfigurationView.css';

interface Props {
  datasets: GraphNode[];
  onDatasetsChanged: () => void;
}
interface State {
  focusedNode: GraphNode;
  dataImportVisible: boolean;
}

export default class DataConfigurationView extends React.Component<Props, State> {
  private specCompiler: SpecCompiler;

  constructor(props: Props) {
    super(props);

    this.exportDataToVega = this.exportDataToVega.bind(this);

    this.specCompiler = new SpecCompiler();

    this.state = {
      dataImportVisible: false,
      focusedNode: null
    };
  }

  private addDatasetNodeToGraph(node: DatasetNode) {
    const nodes = this.props.datasets;
    const nodesWithEqualName = nodes.find(n => n.name === node.name);

    if (nodesWithEqualName !== undefined) {
      return;
    }

    this.props.datasets.push(node);

    this.props.onDatasetsChanged();
  }

  private selectFocusedNode(event: any) {
    // onclick event could be triggered by any node inside block, therefore travel up to component
    // to set selected class there
    let block = event.target;
    while (!block.classList.contains('component')) {
      block = block.parentNode;
    }

    const componentNode = this.props.datasets.filter(node => node.id === block.id)[0];

    // this.state.focusedNode = componentNode;
    this.setState({ focusedNode: componentNode });

    // would cause click event to reach root --> deslects focus
    event.stopPropagation();
  }

  private deselectfocusedNode() {
    this.setState({ focusedNode: null });
  }

  private getAllDatasets(): Datasets {
    const allDatasets: Datasets = {};

    this.props.datasets
      .filter(node => node instanceof DatasetNode)
      .forEach(node => {
        allDatasets[node.id] = node.getSchema();
      });

    return allDatasets;
  }

  private exportDataToVega() {
    const datasets = this.getAllDatasets();
    const dummyTemplate = new PlotTemplate();
    dummyTemplate.mark = 'area';
    dummyTemplate.datasets = datasets;

    const dummySchema = this.specCompiler.getVegaSpecification(dummyTemplate);

    return dummySchema;
  }

  private renderHeader() {
    return (
      <div id="dataFlowHeader">
        <DataFlowToolbar
          datasets={ this.props.datasets }
          updateGraph= { this.props.onDatasetsChanged }
        />
      </div>
    );
  }

  private renderBody() {
    return (
      <div id="dataFlowBody">
        <DataFlowDiagram
          datasets={ this.props.datasets }
          updateGraph= { this.props.onDatasetsChanged }
          focusedNode={ this.state.focusedNode }
          selectFocusedNode={ this.selectFocusedNode.bind(this) }
          deselectFocusedNode={ this.deselectfocusedNode.bind(this) }
        />
        <DataFlowSidebar
          focusedNode={ this.state.focusedNode }
          updateFocusedNode={ this.props.onDatasetsChanged }
        />
        <button
          className="floatingAddButton"
          id="addNewDataset"
          onClick={ () => { this.setState({ dataImportVisible: true }); } }>

          +
        </button>
        <button
          className="floatingAddButton"
          id="exportData"
          onClick={ this.exportDataToVega }>

          <i className="material-icons icon">save_alt</i>
        </button>
        <textarea value={ JSON.stringify(this.exportDataToVega(), null, 2) }></textarea>
      </div>
    );
  }

  private renderOverlays() {
    return (
      <div className="overlays">
        <DataImportPanel
          visible={ this.state.dataImportVisible }
          hidePanel={ () => { this.setState({ dataImportVisible: false });}}
          addDatasetNodeToGraph={ this.addDatasetNodeToGraph.bind(this) } />
      </div>
    );
  }

  public render() {
    return (
      <ViewContainer id="dataFlowComponent" name="Data" activeContainerName="Data">
        { this.renderHeader() }
        { this.renderBody() }
        { this.renderOverlays() }
      </ViewContainer>
    );
  }
}
