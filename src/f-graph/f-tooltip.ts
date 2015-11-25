/// <reference path="../f-mentat.ts"/>
/// <reference path="f-graph.ts"/>

module flipp.mentat {
  export class Tooltip {
    private _node      : HTMLDivElement;
    private _html      : (d: any) => string;
    private _offset    : Array<number> = [0, 0];
    private _direction : string = 'n';
    private _parent    : d3.Selection<any>;

    constructor(parent: d3.Selection<any>) {
      this._parent = parent;
      this._appendTooltipNode();
      return this;
    }

    public show(v, d): Tooltip {
      this._node.innerHTML = this._html(d);
      this._node.style.left = (v[0] + this._offset[0]) + 'px'
      this._node.style.top = (v[1] + this._offset[1]) + 'px';
      this._node.style.opacity = '1';
      return this;
    }

    public hide(): Tooltip {
      this._node.style.opacity = '0';
      return this;
    }

    public offset(v): Tooltip {
      this._offset = v;
      return this;
    }

    public html(v: (d: any) => string): Tooltip {
      this._html = v;
      return this;
    }

    public remove() {
      this._node.parentElement.removeChild(this._node);
      return this;
    }

    // TODO
    public direction(v): Tooltip {
      this._direction = v;
      return this;
    }

    private _appendTooltipNode(): void {
      this._node = document.createElement('div');
      this._node.className = 'tooltip';
      this._node.style.opacity = '0';

      this._node.appendChild
      document.body.appendChild(this._node);
    }
  }
}
