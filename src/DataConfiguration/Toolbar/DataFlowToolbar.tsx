import * as React from 'react';
import { GraphNode, TransformName, transformNames, TransformNode } from 'remodel-vis';
import { Transform } from 'vega-lite/build/src/transform';

import Toolbar from '../../Widgets/Toolbar';

import './DataFlowToolbar.css';

interface Props {
  datasets: GraphNode[];
  updateGraph: () => void;
}
interface State {
  visibleGroup: string;
}

export default class DataFlowToolbar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { visibleGroup: null };
  }

  private getNewTransformForName(name: TransformName): Transform {
    let transform: any = null;
    if (name === 'aggregate') {
      transform = {
        aggregate: [],
        groupby: []
      };
    } else if (name === 'bin') {
      transform = {
        bin: true,
        field: ''
      };
    } else if (name === 'calculate') {
      transform = {
        calculate: '',
        as: ''
      };
    } else if (name === 'filter') {
      transform = {
        filter: ''
      };
    } else if (name === 'flatten') {
      transform = {
        flatten: [],
        as: []
      };
    } else if (name === 'fold') {
      transform = {
        fold: [],
        as: []
      };
    } else if (name === 'impute') {
      transform = {
        impute: '',
        key: '',
        groupby: []
      };
    } else if (name === 'join aggregate') {
      transform = {
        joinaggregate: [],
        groupby: []
      };
    } else if (name === 'lookup') {
      transform = {
        lookup: '',
        from: '',
        as: []
      };
    } else if (name === 'sample') {
      transform = {
        sample: 0
      };
    } else if (name === 'stack') {
      transform = {
        stack: '',
        groupby: [],
        offset: 'zero',
        sort: '',
        as: []
      };
    } else if (name === 'time unit') {
      transform = {
        timeUnit: '',
        field: '',
        as: ''
      };
    }

    return transform;
  }

  private addTransformNode(name: TransformName) {
    const newTransformNode = new TransformNode();

    newTransformNode.type = name;
    newTransformNode.transform = this.getNewTransformForName(name);

    this.props.datasets.push(newTransformNode);
    this.props.updateGraph();
  }

  private renderTransformGroup(key: TransformName) {
    return (
      <button
        key={ key }
        className="transform"
        onClick={ () => this.addTransformNode(key) }>

        { key }
      </button>
    );
  }

  private renderTransforms() {
    return (
      <div id="dataflowToolbarTransforms">
        { transformNames.map(this.renderTransformGroup.bind(this)) }
      </div>
    );
  }

  public render() {
    return (
      <Toolbar id="dataflowToolbar">
        <div className="logo">
          <h2>ReData</h2>
        </div>
        <div id="dataflowToolbarTools">
          { this.renderTransforms() }
        </div>
      </Toolbar>
    );
  }
}
