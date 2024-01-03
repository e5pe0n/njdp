import zeromq from "zeromq";
import { ZmqMiddlewareManager } from "./zmq-middleware-manager.js";
import { jsonMiddleware } from "./json-middleware.js";
import { zlibMiddleware } from "./zlib-middleware.js";

async function main() {
  const socket = new zeromq.Request();
  socket.connect("tcp://127.0.0.1:5000");
  const zmqm = new ZmqMiddlewareManager(socket);
  zmqm.use(zlibMiddleware());
  zmqm.use(jsonMiddleware());
  zmqm.use({
    async inbound(this: ZmqMiddlewareManager, message) {
      console.log("Echoed back", message);
      return message;
    },
  });
  setInterval(() => {
    zmqm
      .send({ action: "ping", echo: Date.now() })
      .catch((err) => console.error(err));
  }, 1000);
  console.log("Client connected");
}

main();
