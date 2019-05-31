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

    this.toggleJSONOrPreview = this.toggleJSONOrPreview.bind(this);

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

  private toggleJSONOrPreview() {
    this.setState({ jsonVisible: !this.state.jsonVisible });
  }

  private renderToggle() {
    const message = `show ${this.state.jsonVisible ? 'Preview' : 'JSON'}`;

    return (
      <button
        className="jsonOrPreviewToggle"
        onClick={ this.toggleJSONOrPreview }>

        { message }
      </button>
    );
  }

  private renderJSONSchema(schema: Spec) {
    if (!this.state.jsonVisible) {
      return null;
    }

    return (
      <textarea
        className="vegaLitePreview"
        onChange={ () => null }
        value={ JSON.stringify(schema, null, 2) } />
    );
  }

  private renderPreview(schema: Spec) {
    if (this.state.jsonVisible) {
      return null;
    }

    return (
      <VegaRenderer schema={schema} />
    );
  }

  public render() {
    if (this.props.focusedNode === null) {
      return null;
    }

    const schema = this.getSchemaForFocusedNode();

    return (
      <div className="vegaPreview">
        { this.renderToggle() }
        { this.renderJSONSchema(schema) }
        { this.renderPreview(schema) }
      </div>
    );
  }
}