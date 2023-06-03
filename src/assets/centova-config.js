(function () {
  var centovacast = window.centovacast || (window.centovacast = {});
  (centovacast.streaminfo || (centovacast.streaminfo = {})).config = {
    poll_limit: 28800,
    poll_frequency: 30000,
  };
})();