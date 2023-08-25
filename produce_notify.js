const amqplib = require('amqplib');

const exchangeName = "notify";
const args = process.argv.slice(2);
const notifyRequestFollowing = {
    typeNotify: "RequestFollowing",
    from: {
      userId: "xxx",
      userName: "khoa"
    },
    to: {
      userId: "yyy",
      userName: "hung"
    }
};

const notifyAcceptFollowing = {
  typeNotify: "AcceptFollowing",
  from: {
    userId: "yyy",
    userName: "hung"
  },
  to: {
    userId: "xxx",
    userName: "khoa"
  }
};

const notifyWrong = {
  typeNotify: "test",
  from: "VIETHUNG",
  to: "ANHKHOA"
};

const arrayNotify = [notifyRequestFollowing, notifyAcceptFollowing, notifyWrong]
const index = process.argv.slice(2)[0]
if(index >= arrayNotify.length)
{
  console.log("Out of Test")
  setTimeout(() => {
    process.exit(0);
  }, 1)
}
const stringNotify = JSON.stringify(arrayNotify[index])


const sendMsg = async () => {
  const connection = await amqplib.connect('amqps://zqcehuuu:msuTc5EmDZFLzQwQ2xW9sxh6dZF4C17U@octopus.rmq3.cloudamqp.com/zqcehuuu');
  const channel = await connection.createChannel();
  await channel.assertExchange(exchangeName, 'direct', {durable: false});
  channel.publish(exchangeName, "VIETHUNG", Buffer.from(stringNotify));
  console.log('Sent: ', stringNotify);
  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500)
}

sendMsg();