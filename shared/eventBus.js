const amqp = require("amqplib");

let channel;

async function connect() {

  const connection = await amqp.connect("amqp://rabbitmq");
  channel = await connection.createChannel();

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

module.exports = { connect, publish, subscribe };