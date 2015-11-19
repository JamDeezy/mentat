/// <reference path="dts/handlebars.d.ts"/>
/// <reference path="dts/webcomponents.d.ts"/>
/// <reference path="dts/d3.d.ts"/>
/// <reference path="dts/moment.d.ts"/>
/// <reference path="dts/velocity.d.ts"/>

module flipp.mentat {
  function getPropertyDesc(obj: Object, prop: string): PropertyDescriptor {
    for (var proto = obj; proto ; proto = Object.getPrototypeOf(proto)) {
      var desc = Object.getOwnPropertyDescriptor(proto, prop);
      if (desc) return desc;
    }
    return undefined;
  }

  function getProperties(obj: Object): string[] {
    var properties: string[] = [];
    for (var proto = obj; proto; proto = Object.getPrototypeOf(proto)) {
      Object.getOwnPropertyNames(proto).forEach((property) => {
        if (properties.indexOf(property) === -1)
          properties.push(property);
      });
    }
    return properties
  }

  function getFullPrototype(proto: Object): PropertyDescriptorMap {
    return getProperties(proto).reduce(
      (map: PropertyDescriptorMap, prop: string) => {
        map[prop] = getPropertyDesc(proto, prop);
        return map;
      }, <PropertyDescriptorMap>{}
    );
  }

  export function registerElement(elName: string, elBase: Function,
    el: Function, elExtend?: string): void {
    if (!registered(elName)) {
      var options: webcomponents.CustomElementInit = {
        prototype: Object.create(
          elBase.prototype,
          getFullPrototype(el.prototype)
        )
      };
      if (elExtend)
        options.extends = elExtend;
      return document.registerElement(elName, options);
    }
  }

  export function registered(elName: string): boolean {
    switch (document.createElement(elName).constructor) {
      case HTMLElement: return false;
      case HTMLUnknownElement: return undefined;
    }
    return true;
  }

  export function createDocumentFragment(html: string): DocumentFragment {
    return document.createRange().createContextualFragment(html);
  }

  /* TODO: May want to split these helpers into another module */
  export function getChild(parent: HTMLElement, selector: string): any {
    return parent.querySelector(selector);
  }
}
