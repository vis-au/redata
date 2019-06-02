import * as React from 'react';
import { GraphNode, SpecCompiler, Template, TransformNode } from 'toolkitmodel';
import { Spec } from 'vega';
import VegaRenderer from '../../Widgets/Renderer/VegaRenderer';

import './VegaPreview.css'

interface Props {
  focusedNode: GraphNode;
  focusedNodeTemplate: Template;
}
interface State {
  jsonVisible: boolean;
}

export default class VegaPreview extends React.Component<Props, State> {
  private specCompiler: SpecCompiler;

  constructor(props: Props) {
    super(props);

    this.specCompiler = new SpecCompiler();

    this.toggleJSON = this.toggleJSON.bind(this);

    this.state = {
      jsonVisible: false
    };
  }

  private getSchemaForFocusedNode() {
    if (!this.props.focusedNodeTemplate) {
      return {};
    }

    const template = this.props.focusedNodeTemplate;
    const dummySchema = this.specCompiler.getVegaSpecification(template);

    return dummySchema;
  }

  private toggleJSON() {
    this.setState({ jsonVisible: !this.state.jsonVisible });
  }

  private renderToggle() {
    const message = `${this.state.jsonVisible ? 'hide Vega-Lite' : 'show Vega-Lite'}`;

    return (
      <button
        className="jsonOrPreviewToggle"
        onClick={ this.toggleJSON }>

        { message }
      </button>
    );
  }

  private renderJSONSchema() {
    if (!this.state.jsonVisible) {
      return null;
    }

    const schema = this.getSchemaForFocusedNode();

    return (
      <textarea
        className="vegaLitePreview"
        onChange={ () => null }
        value={ JSON.stringify(schema, null, 2) } />
    );
  }

  public render() {
    if (this.props.focusedNode === null) {
      return null;
    }

    return (
      <div className="vegaPreview">
        { this.renderToggle() }
        { this.renderJSONSchema() }
      </div>
    );
  }
}