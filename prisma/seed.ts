import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Sākam datubāzes aizpildīšanu (Seeding Manilla DB)...");

  // Notīrām esošos datus (ja ir)
  await prisma.smsLog.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.orderItemMaterial.deleteMany({});
  await prisma.giftItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Darbinieki un lomas (parole: manilla2026, ieva2026, marta2026; PIN: 1111, 2222, 3333)
  const linda = await prisma.user.create({
    data: {
      email: "linda@manilla.lv",
      passwordHash: "$2b$10$Ua6bE2sZ47p5q2Yy5vVq0eP1Qyv5p0fXq1T1z2Y3X4W5V6U7t8s9a", // manilla2026
      quickPin: "1111",
      fullName: "Linda Lukstiņa",
      role: "ADMIN",
      storeBranch: "Tērbatas iela 55",
      isActive: true,
    },
  });

  const ieva = await prisma.user.create({
    data: {
      email: "ieva@manilla.lv",
      passwordHash: "$2b$10$Ua6bE2sZ47p5q2Yy5vVq0eP1Qyv5p0fXq1T1z2Y3X4W5V6U7t8s9b", // ieva2026
      quickPin: "2222",
      fullName: "Ieva Kalniņa",
      role: "MEISTARS",
      storeBranch: "Tērbatas iela 55",
      isActive: true,
    },
  });

  const marta = await prisma.user.create({
    data: {
      email: "marta@manilla.lv",
      passwordHash: "$2b$10$2UhRW1OL50gk9XTYnZIs/.dkwPvUdrj.52IrCOglLUPnCabUkvxCu", // marta2026
      quickPin: "3333",
      fullName: "Marta Liepiņa",
      role: "KASIERIS",
      storeBranch: "T/C Galerija Centrs",
      isActive: true,
    },
  });

  console.log("Izveidoti 3 lietotāji (Admin, Meistars, Kasieris)");

  // 2. Materiālu katalogs
  const chiyogami = await prisma.material.create({
    data: {
      barcode: "475001000101",
      code: "MNL-PAP-01",
      name: "Japāņu Chiyogami Zelta Ziedi (50x70 cm)",
      category: "PAPIRS",
      unit: "LOKSNE",
      pricePerUnit: 4.5,
      inStock: 45,
      swatchColor: "#C5A059",
      imageUrl: "/materials/chiyogami.jpg",
    },
  });

  const botanica = await prisma.material.create({
    data: {
      barcode: "475001000102",
      code: "MNL-PAP-02",
      name: "Eikalipta Lapu Botanica (50x70 cm)",
      category: "PAPIRS",
      unit: "LOKSNE",
      pricePerUnit: 3.2,
      inStock: 60,
      swatchColor: "#606C5A",
      imageUrl: "/materials/botanica.jpg",
    },
  });

  const kraft = await prisma.material.create({
    data: {
      barcode: "475001000103",
      code: "MNL-PAP-03",
      name: "Dabīgais Ribotais Kraftpapīrs (50x70 cm)",
      category: "PAPIRS",
      unit: "LOKSNE",
      pricePerUnit: 2.5,
      inStock: 120,
      swatchColor: "#C2A68D",
      imageUrl: "/materials/kraft.jpg",
    },
  });

  const terakotaPaper = await prisma.material.create({
    data: {
      barcode: "475001000104",
      code: "MNL-PAP-04",
      name: "Marmora Vēsais Terakota (50x70 cm)",
      category: "PAPIRS",
      unit: "LOKSNE",
      pricePerUnit: 3.8,
      inStock: 35,
      swatchColor: "#B85D3E",
      imageUrl: "/materials/terakota_paper.jpg",
    },
  });

  const linaLente = await prisma.material.create({
    data: {
      barcode: "475002000201",
      code: "MNL-RIB-01",
      name: "Dabīgā Lina Lente Terakota (25mm)",
      category: "LENTE",
      unit: "METRS",
      pricePerUnit: 1.8,
      inStock: 85.5,
      swatchColor: "#B85D3E",
      imageUrl: "/materials/lina_lente.jpg",
    },
  });

  const samtsLente = await prisma.material.create({
    data: {
      barcode: "475002000202",
      code: "MNL-RIB-02",
      name: "Salvijas Zaļais Samts (15mm)",
      category: "LENTE",
      unit: "METRS",
      pricePerUnit: 2.4,
      inStock: 42.0,
      swatchColor: "#606C5A",
      imageUrl: "/materials/samts_lente.jpg",
    },
  });

  const satinsLente = await prisma.material.create({
    data: {
      barcode: "475002000203",
      code: "MNL-RIB-03",
      name: "Zīdains Satīns Ziloņkauls (38mm)",
      category: "LENTE",
      unit: "METRS",
      pricePerUnit: 1.6,
      inStock: 110.0,
      swatchColor: "#FAF8F5",
      imageUrl: "/materials/satins_lente.jpg",
    },
  });

  const boxM = await prisma.material.create({
    data: {
      barcode: "475003000302",
      code: "MNL-BOX-M",
      name: "Manilla Amatnieku Kaste M (22x16x10 cm)",
      category: "KASTE",
      unit: "GAB",
      pricePerUnit: 4.8,
      inStock: 25,
      swatchColor: "#ECE6DC",
      imageUrl: "/materials/box_m.jpg",
    },
  });

  const zidpapirs = await prisma.material.create({
    data: {
      barcode: "475004000401",
      code: "MNL-TIS-01",
      name: "Zīdpapīrs Maigi Krēmkrāsas (50x70 cm)",
      category: "ZIDPAPIRS",
      unit: "LOKSNE",
      pricePerUnit: 0.8,
      inStock: 200,
      swatchColor: "#F9F6F0",
      imageUrl: "/materials/zidpapirs.jpg",
    },
  });

  const vaskaZimogs = await prisma.material.create({
    data: {
      barcode: "475005000502",
      code: "MNL-DEC-02",
      name: "Manilla Vaska Zīmogs ar Monogrammu 'M'",
      category: "DEKORS",
      unit: "GAB",
      pricePerUnit: 1.5,
      inStock: 75,
      swatchColor: "#A24E32",
      imageUrl: "/materials/vaska_zimogs.jpg",
    },
  });

  console.log("Izveidots materiālu katalogs (papīri, lentes, kastes, zīdpapīrs, dekori)");

  // 3. Klienti
  const martins = await prisma.customer.create({
    data: {
      fullName: "Mārtiņš Bērziņš",
      phone: "+371 29123456",
      email: "martins.berzins@gmail.com",
    },
  });

  const anna = await prisma.customer.create({
    data: {
      fullName: "Anna Liepiņa",
      phone: "+371 28998877",
      email: "anna.liepina@inbox.lv",
    },
  });

  const elina = await prisma.customer.create({
    data: {
      fullName: "Elīna Ozoliņa",
      phone: "+371 26554433",
      email: "elina.ozolina@epasts.lv",
    },
  });

  const kristaps = await prisma.customer.create({
    data: {
      fullName: "Kristaps Vītols",
      phone: "+371 29445566",
    },
  });

  // 4. Pasūtījumi 4 statusos

  // Pasūtījums 1: PIEŅEMTS (#MNL-1042) - Steidzams šodien!
  const today1730 = new Date();
  today1730.setHours(17, 30, 0, 0);

  const order1 = await prisma.order.create({
    data: {
      orderNumber: "#MNL-1042",
      status: "PIENEMTS",
      storeBranch: "Tērbatas iela 55",
      agreedPickupTime: today1730,
      notes: "Klients lūdza īpaši rūpīgi nofiksēt tējkannas vāciņu ar zīdpapīru.",
      laborCost: 7.0, // 2 dāvanas ārpus Manilla (€3.50 x 2)
      materialsCost: 13.5,
      provisionalLimit: 25.0,
      totalPrice: 20.5,
      paymentStatus: "NEAPMAKSATS",
      customerId: martins.id,
      assignedUserId: ieva.id,
      gifts: {
        create: [
          {
            title: "Porcelāna vintage tējkanna",
            isThirdParty: true,
            conditionNotes: "Sīks mikro-skrāpējums uz vāciņa pamatnes (fiksēts foto).",
            photoUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80",
            isCompleted: false,
            materials: {
              create: [
                {
                  materialId: chiyogami.id,
                  quantity: 2,
                  unitPrice: 4.5,
                  subtotal: 9.0,
                },
                {
                  materialId: linaLente.id,
                  quantity: 2.5,
                  unitPrice: 1.8,
                  subtotal: 4.5,
                },
              ],
            },
          },
          {
            title: "Porcelāna tasīšu komplekts (2 gab.)",
            isThirdParty: true,
            conditionNotes: "Trausls! Ideālā stāvoklī.",
            photoUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80",
            isCompleted: false,
          },
        ],
      },
      auditLogs: {
        create: {
          action: "IZVEIDOTS",
          details: "Pasūtījums pieņemts no klienta Mārtiņš Bērziņš",
          ipAddress: "192.168.1.45 (POS iPad 1)",
          userId: ieva.id,
        },
      },
    },
  });

  // Pasūtījums 2: IESAIŅOŠANĀ (#MNL-1045) - Šodien 18:30
  const today1830 = new Date();
  today1830.setHours(18, 30, 0, 0);

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "#MNL-1045",
      status: "IESAINOSANA",
      storeBranch: "T/C Galerija Centrs",
      agreedPickupTime: today1830,
      notes: "Dāvana kolēģei dzimšanas dienā. Elegants, mierīgs stils.",
      laborCost: 2.5, // Manilla prece
      materialsCost: 7.7,
      provisionalLimit: 12.0,
      totalPrice: 10.2,
      paymentStatus: "APMAKSATS",
      cashReceiptNumber: "Čeks #89405",
      customerId: anna.id,
      assignedUserId: ieva.id,
      gifts: {
        create: [
          {
            title: "Manilla 2027 Plānotājs & Lodīšu Pildspalva",
            isThirdParty: false,
            conditionNotes: "Jauns, iegādāts Manilla veikalā.",
            photoUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
            isCompleted: false,
            materials: {
              create: [
                {
                  materialId: terakotaPaper.id,
                  quantity: 1,
                  unitPrice: 3.8,
                  subtotal: 3.8,
                },
                {
                  materialId: satinsLente.id,
                  quantity: 1.5,
                  unitPrice: 1.6,
                  subtotal: 2.4,
                },
                {
                  materialId: vaskaZimogs.id,
                  quantity: 1,
                  unitPrice: 1.5,
                  subtotal: 1.5,
                },
              ],
            },
          },
        ],
      },
      auditLogs: {
        create: [
          {
            action: "IZVEIDOTS",
            details: "Pasūtījums pieņemts no Anna Liepiņa",
            userId: marta.id,
          },
          {
            action: "STATUS_MAINA",
            details: "Meistars Ieva Kalniņa sāka iesaiņošanu",
            userId: ieva.id,
          },
        ],
      },
    },
  });

  // Pasūtījums 3: GATAVS SAŅEMŠANAI (#MNL-1048) - SMS nosūtīts!
  const tomorrow1200 = new Date();
  tomorrow1200.setDate(tomorrow1200.getDate() + 1);
  tomorrow1200.setHours(12, 0, 0, 0);

  const order3 = await prisma.order.create({
    data: {
      orderNumber: "#MNL-1048",
      status: "GATAVS",
      storeBranch: "Tērbatas iela 55",
      agreedPickupTime: tomorrow1200,
      notes: "Kliente lūdza nosūtīt SMS tūlīt pēc pabeigšanas.",
      laborCost: 2.5,
      materialsCost: 8.7,
      provisionalLimit: 15.0,
      totalPrice: 11.2,
      paymentStatus: "APMAKSATS",
      cashReceiptNumber: "Čeks #89390",
      customerId: elina.id,
      assignedUserId: ieva.id,
      gifts: {
        create: [
          {
            title: "Mājas aromāta difuzors un svece",
            isThirdParty: false,
            conditionNotes: "Stikla pudelīte iepakota oriģinālajā kastītē.",
            photoUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80",
            isCompleted: true,
            materials: {
              create: [
                {
                  materialId: botanica.id,
                  quantity: 1,
                  unitPrice: 3.2,
                  subtotal: 3.2,
                },
                {
                  materialId: samtsLente.id,
                  quantity: 2.0,
                  unitPrice: 2.4,
                  subtotal: 4.8,
                },
                {
                  materialId: zidpapirs.id,
                  quantity: 1,
                  unitPrice: 0.7,
                  subtotal: 0.7,
                },
              ],
            },
          },
        ],
      },
      auditLogs: {
        create: [
          {
            action: "IZVEIDOTS",
            details: "Pasūtījums pieņemts no Elīna Ozoliņa",
            userId: ieva.id,
          },
          {
            action: "STATUS_MAINA",
            details: "Pasūtījums gatavs saņemšanai",
            userId: ieva.id,
          },
        ],
      },
      smsLogs: {
        create: {
          recipientPhone: "+371 26554433",
          messageText:
            "Labdien! Jūsu MANILLA iesaiņošanas pasūtījums Nr. MNL-1048 ir gatavs. Gaidīsim jūs Tērbatas iela 55, Rīga. MANILLA",
          status: "DELIVERED",
          providerId: "LMT-SMS-984123",
        },
      },
    },
  });

  // Pasūtījums 4: IZSNIEGTS (#MNL-1039)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const order4 = await prisma.order.create({
    data: {
      orderNumber: "#MNL-1039",
      status: "IZSNIEGTS",
      storeBranch: "Tērbatas iela 55",
      agreedPickupTime: yesterday,
      laborCost: 3.5,
      materialsCost: 7.3,
      totalPrice: 10.8,
      paymentStatus: "APMAKSATS",
      cashReceiptNumber: "Čeks #89312",
      customerId: kristaps.id,
      assignedUserId: ieva.id,
      gifts: {
        create: [
          {
            title: "Ādas maks un vizītkaršu etvija",
            isThirdParty: true,
            isCompleted: true,
            photoUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=80",
          },
        ],
      },
      auditLogs: {
        create: {
          action: "IZSNIEGTS",
          details: "Dāvana veiksmīgi izsniegta klientam Kristapam Vītolam",
          userId: marta.id,
        },
      },
    },
  });

  console.log("Datubāze sekmīgi aizpildīta ar 4 reāliem pasūtījumiem visos statusos!");
}

main()
  .catch((e) => {
    console.error("Kļūda aizpildot datubāzi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
