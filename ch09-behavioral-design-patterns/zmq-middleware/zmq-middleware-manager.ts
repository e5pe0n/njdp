import { Reply } from "zeromq";

type Middleware = {
  inbound: ((message: any) => any) | ((message: any) => Promise<any>);
  outbound: ((message: any) => any) | ((Message: any) => Promise<any>);
};

export class ZmqMiddlewareManager {
  private socket: Reply;
  private inboundMiddlewares: Middleware["inbound"][];
  private outboundMiddlewares: Middleware["outbound"][];

  constructor(socket: Reply) {
    this.socket = socket;
    this.inboundMiddlewares = [];
    this.outboundMiddlewares = [];
    this.handleImcominMessages().catch((err) => console.error(err));
  }

  async handleImcominMessages() {
    for await (const [message] of this.socket) {
      await this.executeMiddleware(this.inboundMiddlewares, message).catch(
        (err) => {
          console.error("Error while processing the message", err);
        }
      );
    }
  }

  async send(message: any) {
    const finalMessage = await this.executeMiddleware(
      this.outboundMiddlewares,
      message
    );
    return this.socket.send(finalMessage);
  }

  use(middleware: Partial<Middleware>) {
    if (middleware.inbound) {
      this.inboundMiddlewares.push(middleware.inbound);
    }
    if (middleware.outbound) {
      this.outboundMiddlewares.unshift(middleware.outbound);
    }
  }

  async executeMiddleware(
    middlewares: Middleware["inbound"][] | Middleware["outbound"][],
    initialMessage: any
  ) {
    let message = initialMessage;
    for await (const m of middlewares) {
      message = await m.call(this, message);
    }
    return message;
  }
}
