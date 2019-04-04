import * as React from 'react';

import DataFlowConfigurationView from './DataConfiguration/DataConfigurationView';
import GraphNode from './Model/DataModel/GraphNode';
import MainView from './ToolkitView/MainView';

import './App.css';

interface State {
  datasets: GraphNode[];
}

export default class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.onDatasetsChanged = this.onDatasetsChanged.bind(this);

    this.state = {
      datasets: [],
    };
  }

  private onDatasetsChanged() {
    this.setState({
      datasets: this.state.datasets
    });
  }

  public render() {
    return (
      <div className="App">
        <MainView>
          <DataFlowConfigurationView
            datasets={ this.state.datasets }
            onDatasetsChanged={ this.onDatasetsChanged }
          />
        </MainView>
      </div>
    );
  }
}
