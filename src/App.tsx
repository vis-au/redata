import * as React from 'react';

import DataFlowConfigurationView from './DataConfiguration/DataConfigurationView';
import GraphNode from './Model/DataModel/GraphNode';
import Template from './Model/TemplateModel/Template';
import MainView from './ToolkitView/MainView';

import './App.css';

interface State {
  datasets: GraphNode[];
  templates: Template[];
}

export default class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.onDatasetsChanged = this.onDatasetsChanged.bind(this);
    this.onTemplatesChanged = this.onTemplatesChanged.bind(this);

    this.state = {
      datasets: [],
      templates: [],
    };
  }

  private onDatasetsChanged() {
    this.setState({
      datasets: this.state.datasets
    });
  }

  private onTemplatesChanged() {
    this.setState({
      templates: this.state.templates
    });
  }

  public render() {
    return (
      <div className="App">
        <MainView>
          <DataFlowConfigurationView
            datasets={ this.state.datasets }
            templates={ this.state.templates }
            onDatasetsChanged={ this.onDatasetsChanged }
            onTemplatesChanged={ this.onTemplatesChanged }
          />
        </MainView>
      </div>
    );
  }
}
