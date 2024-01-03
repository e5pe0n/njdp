export const jsonMiddleware = function () {
  return {
    inbound(message: any) {
      return JSON.parse(message.toString());
    },
    outbound(message: any) {
      return Buffer.from(JSON.stringify(message));
    },
  };
};
