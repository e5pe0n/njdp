import { Readable } from "stream";

{
  type Mountain = {
    name: string;
    height: number;
  };
  const mountains: Mountain[] = [
    {
      name: "Everest",
      height: 8848,
    },
    {
      name: "K2",
      height: 8611,
    },
    {
      name: "Kangchenjunga",
      height: 8586,
    },
    {
      name: "Lhotse",
      height: 8516,
    },
    {
      name: "Makalu",
      height: 8481,
    },
  ];
  const ms = Readable.from(mountains);
  ms.on("data", (mountain: Mountain) => {
    console.log(`${mountain.name.padStart(14)}\t${mountain.height}m`);
  });
}
