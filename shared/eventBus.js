const amqp = require("amqplib");

let channel;

async function connectRabbit() {
  while (true) {
    try {

      const connection = await amqp.connect("amqp://rabbitmq");

      channel = await connection.createChannel();

      console.log("Connected to RabbitMQ");

      break;

    } catch (err) {

      console.log("Waiting for RabbitMQ...");

      await new Promise(res => setTimeout(res, 3000));

    }
  }
}

async function publish(queue, message) {

  await channel.assertQueue(queue);

  channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(message))
  );
}

async function subscribe(queue, handler) {

  await channel.assertQueue(queue);

  channel.consume(queue, msg => {

    const data = JSON.parse(msg.content.toString());

    handler(data);

    channel.ack(msg);

  });
}

module.exports = { connectRabbit, publish, subscribe };