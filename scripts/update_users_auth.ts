import { db } from "../lib/db";
import bcrypt from "bcryptjs";

async function run() {
  const hashLinda = bcrypt.hashSync("manilla2026", 10);
  const hashIeva = bcrypt.hashSync("ieva2026", 10);
  const hashMarta = bcrypt.hashSync("marta2026", 10);

  await db.user.upsert({
    where: { email: "linda@manilla.lv" },
    update: { passwordHash: hashLinda, quickPin: "1111", role: "ADMIN", fullName: "Linda Lukstiņa" },
    create: { email: "linda@manilla.lv", passwordHash: hashLinda, quickPin: "1111", role: "ADMIN", fullName: "Linda Lukstiņa", storeBranch: "Tērbatas iela 55" }
  });

  await db.user.upsert({
    where: { email: "ieva@manilla.lv" },
    update: { passwordHash: hashIeva, quickPin: "2222", role: "MEISTARS", fullName: "Ieva Kalniņa" },
    create: { email: "ieva@manilla.lv", passwordHash: hashIeva, quickPin: "2222", role: "MEISTARS", fullName: "Ieva Kalniņa", storeBranch: "Tērbatas iela 55" }
  });

  await db.user.upsert({
    where: { email: "marta@manilla.lv" },
    update: { passwordHash: hashMarta, quickPin: "3333", role: "KASIERIS", fullName: "Marta Liepiņa" },
    create: { email: "marta@manilla.lv", passwordHash: hashMarta, quickPin: "3333", role: "KASIERIS", fullName: "Marta Liepiņa", storeBranch: "T/C Galerija Centrs" }
  });

  console.log("Users successfully updated with hashed passwords and PINs!");
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
