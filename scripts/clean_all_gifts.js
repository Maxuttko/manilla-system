const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanAllGifts() {
  const gifts = await prisma.giftItem.findMany();
  console.log("Total gifts:", gifts.length);
  for (const g of gifts) {
    if (/[а-яА-ЯёЁ]/.test(g.title) || /цук|йцу|asdf|test/i.test(g.title)) {
      console.log(`Fixing gift ${g.id} (${g.title})...`);
      await prisma.giftItem.update({
        where: { id: g.id },
        data: {
          title: "Dizaina porcelāna tējkanna",
          conditionNotes: ""
        }
      });
    }
  }
  console.log("All gifts cleaned.");
}

cleanAllGifts().finally(() => prisma.$disconnect());
