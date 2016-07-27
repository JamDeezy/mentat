/**
 * http://codereview.stackexchange.com/questions/83717
 */
Array.prototype.unique = function() {
  var seen = {}
  return this.filter(function(x) {
    if (seen[x])
      return
    seen[x] = true
    return x
  })
}

/**
 * http://stackoverflow.com/questions/27266550
 */
Array.prototype.flatten = function() {
  var toString = Object.prototype.toString;
  var arrayTypeStr = '[object Array]';

  var result = [];
  var nodes = this.slice();
  var node;

  if (!this.length) {
    return result;
  }

  node = nodes.pop();

  do {
    if (toString.call(node) === arrayTypeStr) {
      nodes.push.apply(nodes, node);
    } else {
      result.push(node);
    }
  } while (nodes.length && (node = nodes.pop()) !== undefined);

  result.reverse();
  return result;
}