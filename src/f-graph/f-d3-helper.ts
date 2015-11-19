/// <reference path="../f-mentat.ts"/>

declare module d3 {
  export module time {
    export function daysTotal(start: Date, stop: Date, step?: number): Date[];
  }
}

module flipp.mentat {
  function d3_time_range_greedy(floor, step, number) {
    return function(t0, t1, dt) {
      var time = floor(t0), times = [];
      if (dt > 1) {
        while (time < t1) {
          var date = new Date(+time);
          times.push(date);
          for (var i = dt; i > 0; step(time), i--);
        }
      } else {
        while (time < t1) times.push(new Date(+time)), step(time);
      }
      return times;
    };
  }

  d3.time.daysTotal = d3_time_range_greedy(
    d3.time.day,
    function(date) {
      date.setDate(date.getDate() + 1);
    },
    function(date) {
      return ~~(date / 86400000);
    });
}