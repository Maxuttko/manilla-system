const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanOrders() {
  const orders = await prisma.order.findMany({
    include: { customer: true, gifts: true }
  });

  console.log("Total orders found:", orders.length);

  let counter = 1;
  for (const o of orders) {
    if (/[а-яА-ЯёЁ]/.test(o.customer.fullName) || /цук|йцу|asdf|test|ыва/i.test(o.customer.fullName) || /цук|йцу|ыва/i.test(o.customer.phone)) {
      console.log(`  -> Cleaning gibberish order ${o.orderNumber}...`);
      const phone = `+371 28${counter.toString().padStart(2, "0")}7788`;
      counter++;
      await prisma.customer.update({
        where: { id: o.customer.id },
        data: {
          fullName: `Dace Kalniņa ${counter}`,
          phone: phone,
          email: `dace${counter}@inbox.lv`
        }
      });
      if (o.gifts.length > 0) {
        await prisma.giftItem.update({
          where: { id: o.gifts[0].id },
          data: {
            title: "Dizaina porcelāna trauks",
            conditionNotes: ""
          }
        });
      }
    }
  }

  console.log("Done checking and cleaning orders.");
}

cleanOrders().finally(() => prisma.$disconnect());
