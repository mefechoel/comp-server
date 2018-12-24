# comp-server

comp-server is a static file server.
It will serve compressed (gzip and brotli) js, css and html files, if they are present in static directory and if the requesting agent supports compressed files.

# usage

`comp-server <path> [--port | -p]`

Starts the static server in the specified path (default: `'.'`) and port (default: `3000`).
