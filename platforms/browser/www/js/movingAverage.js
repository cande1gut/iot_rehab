function sma(arr, range, format) {
  if (!Array.isArray(arr)) {
    throw TypeError('expected first argument to be an array');
  }

  var fn = typeof format === 'function' ? format : toFixed;
  var num = range || arr.length;
  var res = [];
  var len = arr.length + 1;
  var idx = num - 1;
  while (++idx < len) {
    res.push(fn(avg(arr, idx, num)));
  }
  return res;
}

function avg(arr, idx, range) {
  return sum(arr.slice(idx - range, idx)) / range;
}

function sum(arr) {
  var len = arr.length;
  var num = 0;
  while (len--) num += Number(arr[len]);
  return num;
}

function toFixed(n) {
  return n.toFixed(2);
}
