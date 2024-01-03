import superagent from "superagent";

{
  type SerializedCmd = {
    type: "status";
    action: "post";
    status: string;
  };

  const statusUpdates = new Map<number, SerializedCmd["status"]>();

  // Target
  const statusUpdateService = {
    postUpdate(status: SerializedCmd["status"]) {
      const id = Math.floor(Math.random() * 1_000_000);
      statusUpdates.set(id, status);
      console.log(`Status posted: ${status}`);
      return id;
    },
    destroyUpdate(id: number) {
      statusUpdates.delete(id);
      console.log(`Status removed: ${id}`);
    },
  };
  type StatusUpdateService = typeof statusUpdateService;

  type Cmd = {
    run: () => void;
    undo: () => void;
    serialize: () => SerializedCmd;
  };

  function createPostStatusCmd(
    service: StatusUpdateService,
    status: SerializedCmd["status"]
  ): Cmd {
    let postId: number | null = null;
    // Command
    return {
      run() {
        postId = service.postUpdate(status);
      },
      undo() {
        if (postId) {
          service.destroyUpdate(postId);
          postId = null;
        }
      },
      serialize() {
        return {
          type: "status",
          action: "post",
          status,
        };
      },
    };
  }

  // Invoker
  class Invoker {
    private history: Cmd[];

    constructor() {
      this.history = [];
    }

    run(cmd: Cmd) {
      this.history.push(cmd);
      cmd.run();
      console.log("Command executed", cmd.serialize());
    }

    delay(cmd: Cmd, delay: number) {
      setTimeout(() => {
        console.log("Executing delayed command", cmd.serialize());
        this.run(cmd);
      }, delay);
    }

    undo() {
      const cmd = this.history.pop();
      if (cmd) {
        cmd.undo();
        console.log("Command undone", cmd.serialize());
      }
    }

    async runRemotely(cmd: Cmd) {
      await superagent
        .post("http://localhost:3000/cmd")
        .send({ json: cmd.serialize() });
      console.log("Command executed remotely", cmd.serialize());
    }
  }

  async function main() {
    const invoker = new Invoker();
    const cmd = createPostStatusCmd(statusUpdateService, "Hi!");
    invoker.run(cmd);
    invoker.undo();
    invoker.delay(cmd, 3_000);
    await invoker.runRemotely(cmd);
  }
}
