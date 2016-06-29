/*
 * Mentat v1.0
 * Interface defintion
 */
declare module mentat {
  module Chart {
    interface config {
      type: string,
      data: any[],
      selector: string,
      axis: {
        x: mentat.Chart.Axis.config | string,
        y: mentat.Chart.Axis.config | string
      }
    }

    module Body {
      interface config {
        width: number,
        height: number,
        margin: number
      }

      interface format {

      }
    }

    module Axis {
      interface config {
        orient: string,

        scale?: any,
        format?: mentat.Chart.Axis.format
      }

      interface format {
        innerTickSize?: any,
        outerTickSize?: any,
        ticks?: any,
        tickFormat?: any
        tickPadding?: any,
        tickSize?: any,
        tickValues?: any,
      }
    }

    module Scale {
      interface config {
        type: string,
        range: any,
        domain: any,

        format?: mentat.Chart.Scale.format
      }

      interface format {
        rangeBands?: any,
        rangeRound?: any,
      }
    }
  }

  module Map {
  }
}

/**
 * Mentat v1.0 Helper interfaces
 */

// array.js
interface Array<T> {
  unique(): any[];
  flatten(): any[];
  sum(prop): number;
}