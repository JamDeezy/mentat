/// <reference path="../f-mentat.ts"/>
/// <reference path="f-graph.ts"/>

module flipp.mentat {
  export class Tooltip {
    private _el        : HTMLElement;
    private _html      : (d: any) => string;
    private _offset    : Array<number> = [0, 0];
    private _direction : string = 'n';
    private _parent    : d3.Selection<any>;

    constructor(parent: d3.Selection<any>) {
      this._parent = parent;
      this._appendTooltip();
      return this;
    }

    public show(v, d): Tooltip {
      this._el.innerHTML = this._html(d);
      this._el.style.left = (v[0] + this._offset[0]) + 'px'
      this._el.style.top = (v[1] + this._offset[1]) + 'px';
      this._el.style.opacity = '1';
      return this;
    }

    public hide(): Tooltip {
      this._el.style.opacity = '0';
      return this;
    }

    public offset(v): Tooltip {
      this._offset = v;
      return this;
    }

    public style(a, v): Tooltip {
      this._el.style[a] = v;
      return this;
    }

    public attr(a, v): Tooltip {
      this._el.setAttribute(a, v);
      return this;
    }

    public html(v: (d: any) => string): Tooltip {
      this._html = v;
      return this;
    }

    public remove() {
      this._el.parentElement.removeChild(this._el);
      return this;
    }

    // TODO
    public direction(v): Tooltip {
      this._direction = v;
      return this;
    }

    private _appendTooltip(): void {
      this._el = document.createElement('div');
      this._el.className = 'tooltip';
      this._el.style.opacity = '0';

      this._el.appendChild
      document.body.appendChild(this._el);
    }
  }
}
