import * as React from 'react';
import { SpecCompiler, Template } from 'toolkitmodel';
import VegaRenderer from '../../Widgets/Renderer/VegaRenderer';

import './VegaPreviewOverlay.css';

interface Props {
  focusedNodeTemplate: Template;
  hidden: boolean;
}
interface State {
}

export default class VegaPreviewOverlay extends React.Component<Props, State> {
  private specCompiler: SpecCompiler;

  constructor(props: Props) {
    super(props);

    this.specCompiler = new SpecCompiler();
  }

  public render() {
    if (!this.props.focusedNodeTemplate) {
      return null;
    }
    if (this.props.hidden) {
      return null;
    }

    const schema = this.specCompiler.getVegaSpecification(this.props.focusedNodeTemplate);

    return (
      <div className="vegaPreviewOverlay">
        <VegaRenderer id="vegaPreviewOverlay" schema={ schema } />
      </div>
    );
  }
}