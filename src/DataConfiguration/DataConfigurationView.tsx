import * as React from 'react';
import { DataImporter, DatasetNode, GraphNode, PlotTemplate, SpecCompiler, Template } from 'toolkitmodel';

import ViewContainer from '../ToolkitView/ViewContainer';
import DataFlowDiagram from './Diagram/DataFlowDiagram';
import DataImportPanel from './Overlays/DataImportPanel';
import VegaExportOverlay from './Overlays/VegaExportOverlay';
import VegaInputOverlay from './Overlays/VegaInputOverlay';
import DataFlowSidebar from './Sidebar/DataFlowSidebar';
import DataFlowToolbar from './Toolbar/DataFlowToolbar';

import './DataConfigurationView.css';

interface Props {
  datasets: GraphNode[];
  templates: Template[];
  onDatasetsChanged: () => void;
  onTemplatesChanged: () => void;
}
interface State {
  focusedNode: GraphNode;
  dataImportVisible: boolean;
  vegaPreviewVisible: boolean;
  customVegaInputVisible: boolean;
}

export default class DataConfigurationView extends React.Component<Props, State> {
  private dataImporter: DataImporter;

  constructor(props: Props) {
    super(props);

    this.addTemplates = this.addTemplates.bind(this);
    this.addDatasetNode = this.addDatasetNode.bind(this);

    this.dataImporter = new DataImporter();
    this.dataImporter.onNewDataset = this.addDatasetNode.bind(this);

    this.state = {
      dataImportVisible: false,
      vegaPreviewVisible: false,
      customVegaInputVisible: false,
      focusedNode: null
    };
  }

  private addDatasetNode(node: DatasetNode) {
    const nodes = this.props.datasets;
    const nodesWithEqualName = nodes.find(n => n.name === node.name);

    if (nodesWithEqualName !== undefined) {
      return;
    }

    this.props.datasets.push(node);

    this.props.onDatasetsChanged();
  }

  private addTemplates(templates: Template[]) {

    const datasets = templates
      .map(template => template.dataTransformationNode)
      .map(graphNode => {
        this.dataImporter.loadFieldsAndValuesToNode(graphNode);
        return graphNode;
      });

    this.props.datasets.push(...datasets);
    this.props.templates.push(...templates);
    this.props.onTemplatesChanged();
    this.props.onDatasetsChanged();
  }

  private toggleVegaPreviewVisible(visible?: boolean) {
    if (visible !== undefined) {
      this.setState({
        vegaPreviewVisible: visible
      });
    } else {
      this.setState({
        vegaPreviewVisible: !this.state.vegaPreviewVisible
      });
    }
  }

  private toggleCustomVegaInput(visible?: boolean) {
    if (visible !== undefined) {
      this.setState({
        customVegaInputVisible: visible
      });
    } else {
      this.setState({
        customVegaInputVisible: !this.state.customVegaInputVisible
      });
    }
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

  private renderButtons() {
    return (
      <div className="buttons">
        <div className="left">
          <button
            className="floatingAddButton"
            id="addNewDataset"
            onClick={ () => { this.setState({ dataImportVisible: true }); } }>

            +
          </button>
        </div>
        <div className="right">
          <button
            className="floatingAddButton"
            id="vegaInput"
            onClick={ () => this.toggleCustomVegaInput() }>

            <i className="material-icons icon">attach_file</i>
          </button>
          <button
            className="floatingAddButton"
            id="exportData"
            onClick={ () => this.toggleVegaPreviewVisible() }>

            <i className="material-icons icon">code</i>
          </button>
        </div>
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
        { this.renderButtons() }
      </div>
    );
  }

  private renderOverlays() {
    return (
      <div className="overlays">
        <DataImportPanel
          visible={ this.state.dataImportVisible }
          hidePanel={ () => { this.setState({ dataImportVisible: false });}}
          addDatasetNodeToGraph={ this.addDatasetNode } />
        <VegaInputOverlay
          hidden={ !this.state.customVegaInputVisible }
          hide={ () => this.toggleCustomVegaInput(false) }
          addTemplates={ this.addTemplates } />
        <VegaExportOverlay
          datasets={ this.props.datasets }
          visible={ !this.state.vegaPreviewVisible }/>
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
