import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SAMPLE_SIGNATURE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArwAAACgCAYAAADuMb+KAAAO/0lEQVR4AezdT28cZx0H8JmNG5JCQELikoRC7HXkTYQ4cOHPS0gr4IyoVI7QG5QDIC4IONBygR6pVMQLgBIQLwAkkDggDrtJvJs4QA8VKn8qtUhJvMNs/trJevexd2dnnmc+lTf27vzmmd/z+fnw1agadzL/ESBAgAABAgQIEEhYQOBNeLi2RoDAYQTUEiBAgECqAgJvqpO1LwIECBAgQIDAUQQSPEfgTXCotkSAAAECBAgQIPBIQOB9ZOEnAgTCBVQSIECAAIFoBATeaEalUQIECBAgQKB5AjqKQUDgjWFKeiRAgAABAgQIEDiygMB7ZDonEggXUEmAAAECBAjUJyDw1mfvygQIECBAoG0C9kugFgGBtxZ2FyVAgAABAgQIEFiVgMC7KmnXCRdQSYAAAQIECBBYooDAu0RMSxEgQIAAgWUKWIsAgeUICLzLcbQKAQIECBAgQIBAQwUE3oYOJrwtlQQIECBAgAABArMEBN5ZOo4RIECAQDwCOiVAgMABAgLvATA+JkCAAAECBAgQSEOgbYE3janZBQECBAgQIECAQLCAwBtMpZAAAQIpCdgLAQIE2iMg8LZn1nZKgAABAgQIEGilwMzA20oRmyZAgAABAgQIEEhKQOBNapw2Q4BARQKWJUCAAIGIBQTeiIendQIECBAgQIDAagXivJrAG+fcdE2AAAECBAgQIBAoIPAGQikjQCBcQCUBAgQIEGiSgMDbpGnohQABAgQIEEhJwF4aIiDwNmQQ2iBAgAABAgQIEKhGQOCtxtWqBMIFVBIgQIAAAQKVCgi8lfJanAABAgQIEAgVUEegKgGBtypZ6xIgQIAAAQIECDRCQOBtxBg0ES6gkgABAgQIECBwOAGB93BeqgkQIECAQDMEdEGAQLCAwBtMpZAAAQIECBAgQCBGAYE3xqmF96ySAAECBAgQINB6AYG39b8CAAgQINAGAXskQKDNAgJvm6dv7wQIECBAgACBFggIvHuG7EcCBAgQIECAAIH0BATe9GZqRwQIEFhUwPkECBBISkDgTWqcNkOAAAECBAgQIPC4wNED7+MreU+gJoHe5vqlC5vdX/TOd98pv/e73e4Ha2rFZQkQIECAAIEGCgi8DRyKluYL9PaE3DzvXM7y7Et5lp0qv/fKsz9SvnwRWJmACxEgQIBAswUE3mbPR3d7BLa6557rnd94fXInN98bcsuaosjeHBfFy9k4uzgcDkflR74IECBAgACB1Qo09moCb2NHo7FS4KmtzfVny5D7897mxn86nWNv5Fn+fD65k1seLLLiZjYuXsmKO58ebA/PXtkevdQfDvvlIV8ECBAgQIAAgYcCAu9DCj80RGBvyP1nJ+/8Os/yL+d5/qFJf/tC7rXRx/vD0Tf62zt/mhzzikRAmwQIECBAYMUCAu+KwV1uqoCQO5XFhwQIECCQ";

async function main() {
  console.log("Notīrām iepriekšējos testa datus...");

  await prisma.smsLog.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.orderItemMaterial.deleteMany({});
  await prisma.giftItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Izveidojam oficiālos Manilla darbiniekus ar bcrypt parolēm...");

  const hashLinda = await bcrypt.hash("manilla2026", 10);
  const hashIeva = await bcrypt.hash("ieva2026", 10);
  const hashMarta = await bcrypt.hash("marta2026", 10);

  const linda = await prisma.user.create({
    data: {
      email: "linda@manilla.lv",
      passwordHash: hashLinda,
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
      passwordHash: hashIeva,
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
      passwordHash: hashMarta,
      quickPin: "3333",
      fullName: "Marta Liepiņa",
      role: "KASIERIS",
      storeBranch: "T/C Galerija Centrs",
      isActive: true,
    },
  });

  console.log("Lietotāji izveidoti (Linda, Ieva, Marta).");

  console.log("Izveidojam Manilla Japandi materiālu katalogu...");

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

  console.log("Izveidojam reālistiskus klientus...");

  const laura = await prisma.customer.create({
    data: {
      fullName: "Laura Krūmiņa",
      phone: "+371 28844112",
      email: "laura.krumina@gmail.com",
    },
  });

  const gustavs = await prisma.customer.create({
    data: {
      fullName: "Gustavs Kalniņš",
      phone: "+371 29334455",
      email: "gustavs.k@inbox.lv",
    },
  });

  const dace = await prisma.customer.create({
    data: {
      fullName: "Dace Ozoliņa",
      phone: "+371 26112233",
      email: "dace.ozolina@latvija.lv",
    },
  });

  const martins = await prisma.customer.create({
    data: {
      fullName: "Mārtiņš Bērziņš",
      phone: "+371 29123456",
      email: "martins.berzins@gmail.com",
    },
  });

  const elina = await prisma.customer.create({
    data: {
      fullName: "Elīna Zariņa",
      phone: "+371 27443322",
      email: "elina.zarina@outlook.com",
    },
  });

  const anna = await prisma.customer.create({
    data: {
      fullName: "Anna Liepiņa",
      phone: "+371 28998877",
      email: "anna.liepina@inbox.lv",
    },
  });

  const janis = await prisma.customer.create({
    data: {
      fullName: "Jānis Dombrovskis",
      phone: "+371 29221100",
      email: "j.dombrovskis@apollo.lv",
    },
  });

  const kristaps = await prisma.customer.create({
    data: {
      fullName: "Kristaps Vītols",
      phone: "+371 29445566",
      email: "kristaps.vitols@tvnet.lv",
    },
  });

  const sanita = await prisma.customer.create({
    data: {
      fullName: "Sanita Briede",
      phone: "+371 26889900",
      email: "sanita.briede@gmail.com",
    },
  });

  console.log("Izveidojam paraugpasūtījumus 4 statusu kolonnās...");

  const now = new Date();
  
  const todayIn1Hour = new Date(now.getTime() + 65 * 60 * 1000);
  const todayIn3Hours = new Date(now.getTime() + 190 * 60 * 1000);
  const tomorrowNoon = new Date(now.getTime() + 24 * 3600 * 1000);
  tomorrowNoon.setHours(12, 30, 0, 0);

  const yesterdayMorning = new Date(now.getTime() - 26 * 3600 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 52 * 3600 * 1000);

  // =========================================================================
  // KOLONNA 1: PIEŅEMTS (3 pasūtījumi rindā)
  // =========================================================================

  // 1. #MNL-1051 - Multi-dāvana ar fotogrāfijām un defekta atzīmi
  await prisma.order.create({
    data: {
      orderNumber: "#MNL-1051",
      status: "PIENEMTS",
      storeBranch: "Tērbatas iela 55",
      agreedPickupTime: todayIn1Hour,
      notes: "Klients lūdza tējkannas vāciņu un osiņu nofiksēt ar dubultu zīdpapīru.",
      laborCost: 7.0, // 2 dāvanas ārpus veikala (€3.50 x 2)
      materialsCost: 14.9,
      provisionalLimit: 25.0,
      totalPrice: 21.9,
      paymentStatus: "NEAPMAKSATS",
      customerId: laura.id,
      assignedUserId: ieva.id,
      gifts: {
        create: [
          {
            title: "Porcelāna vintage tējkanna ar zelta maliņu",
            isThirdParty: true,
            conditionNotes: "Klienta personīgā relikvija. Neliels emaljas noberzums pie osiņas (klients informēts).",
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
                  quantity: 2.0,
                  unitPrice: 1.8,
                  subtotal: 3.6,
                },
              ],
            },
          },
          {
            title: "Porcelāna tasīšu un apakštasīšu komplekts (2 gab.)",
            isThirdParty: true,
            photoUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80",
            isCompleted: false,
            materials: {
              create: [
                {
                  materialId: zidpapirs.id,
                  quantity: 1,
                  unitPrice: 0.8,
                  subtotal: 0.8,
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
        create: {
          action: "IZVEIDOTS",
          details: "Pasūtījumu pieņēma Ieva Kalniņa veikalā Tērbatas iela 55.",
          signatureDataUrl: SAMPLE_SIGNATURE,
          ipAddress: "192.168.88.5 (POS Planšete 1)",
          userId: ieva.id,
        },
      },
    },
  });

  // 2. #MNL-1052 - Galerija Centrs, apmaksāts kasē
  await prisma.order.create({
    data: {
      orderNumber: "#MNL-1052",
      status: "PIENEMTS",
      storeBranch: "T/C Galerija Centrs",
      agreedPickupTime: todayIn3Hours,
      notes: "Kāzu dāvana draugam. Iesaiņot tumšā, vīrišķīgā un lakoniskā stilā.",
      laborCost: 3.5,
      materialsCost: 9.6,
      totalPrice: 13.1,
      paymentStatus: "APMAKSATS",
      cashReceiptNumber: "Čeks #89420",
      customerId: gustavs.id,
      assignedUserId: marta.id,
      gifts: {
        create: [
          {
            title: "Šveices rokas pulkstenis un sudraba aproču pogas",
            isThirdParty: true,
            photoUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80",
            isCompleted: false,
            materials: {
              create: [
                {
                  materialId: boxM.id,
                  quantity: 1,
                  unitPrice: 4.8,
                  subtotal: 4.8,
                },
                {
                  materialId: samtsLente.id,
                  quantity: 2.0,
                  unitPrice: 2.4,
                  subtotal: 4.8,
                },
              ],
            },
          },
        ],
      },
      auditLogs: {
        create: {
          action: "IZVEIDOTS",
          details: "Pasūtījums pieņemts no Gustavs Kalniņš veikalā T/C Galerija Centrs.",
          signatureDataUrl: SAMPLE_SIGNATURE,
          userId: marta.id,
        },
      },
    },
  });

  // 3. #MNL-1053 - Manilla veikala prece ar termiņu rīt
  await prisma.order.create({
    data: {
      orderNumber: "#MNL-1053",
      status: "PIENEMTS",
      storeBranch: "Tērbatas iela 55",
      agreedPickupTime: tomorrowNoon,
      notes: "Dzimšanas dienas dāvana kolēģei ar Manilla vaska zīmogu.",
      laborCost: 2.5,
      materialsCost: 6.9,
      totalPrice: 9.4,
      paymentStatus: "NEAPMAKSATS",
      customerId: dace.id,
      assignedUserId: ieva.id,
      gifts: {
        create: [
          {
            title: "Manilla 2027 Dizaina Plānotājs & Lodīšu pildspalva",
            isThirdParty: false,
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
                  quantity: 1.0,
                  unitPrice: 1.6,
                  subtotal: 1.6,
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
        create: {
          action: "IZVEIDOTS",
          details: "Pasūtījumu pieņēma Ieva Kalniņa.",
          signatureDataUrl: SAMPLE_SIGNATURE,
          userId: ieva.id,
        },
      },
    },
  });

  // =========================================================================
  // KOLONNA 2: IESAIŅOŠANĀ (2 pasūtījumi procesā)
  // =========================================================================

  // 4. #MNL-1048 - Multi-dāvana: 1 jau pabeigta, 1 procesā! (Per-gift showcase)
  await prisma.order.create({
    data: {
      orderNumber: "#MNL-1048",
      status: "IESAINOSANA",
      storeBranch: "Tērbatas iela 55",
      agreedPickupTime: todayIn1Hour,
      notes: "Dāvana ģimenei. Lūdza pieskaņot salvijas zaļos toņus.",
      laborCost: 5.0, // 2 x €2.50
      materialsCost: 11.8,
      totalPrice: 16.8,
      paymentStatus: "APMAKSATS",
      cashReceiptNumber: "Čeks #89388",
      customerId: martins.id,
      assignedUserId: ieva.id,
      gifts: {
        create: [
          {
            title: "Mājas aromāta difuzors & Sojas vaska svece",
            isThirdParty: false,
            photoUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80",
            isCompleted: true, // PABEIGTA!
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
                  quantity: 1.5,
                  unitPrice: 2.4,
                  subtotal: 3.6,
                },
              ],
            },
          },
          {
            title: "Zīda šalle Manilla dāvanu aploksnē",
            isThirdParty: false,
            photoUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=400&q=80",
            isCompleted: false, // VĒL PROCESĀ
            materials: {
              create: [
                {
                  materialId: kraft.id,
                  quantity: 1,
                  unitPrice: 2.5,
                  subtotal: 2.5,
                },
                {
                  materialId: linaLente.id,
                  quantity: 1.4,
                  unitPrice: 1.8,
                  subtotal: 2.5,
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
            details: "Pasūtījums pieņemts no Mārtiņš Bērziņš",
            userId: ieva.id,
            signatureDataUrl: SAMPLE_SIGNATURE,
          },
          {
            action: "STATUS_MAINA",
            details: "Meistars Ieva Kalniņa sāka iesaiņošanas darbus",
            userId: ieva.id,
          },
        ],
      },
    },
  });

  // 5. #MNL-1049 - Galerija Centrs meistara galds
  await prisma.order.create({
    data: {
      orderNumber: "#MNL-1049",
      status: "IESAINOSANA",
      storeBranch: "T/C Galerija Centrs",
      agreedPickupTime: todayIn3Hours,
      notes: "Pievienot personisku apsveikuma kartīti zem lentes.",
      laborCost: 2.5,
      materialsCost: 5.7,
      totalPrice: 8.2,
      paymentStatus: "NEAPMAKSATS",
      customerId: elina.id,
      assignedUserId: marta.id,
      gifts: {
        create: [
          {
            title: "Dabīgās ādas skiču klade ar zelta apmalojumu",
            isThirdParty: false,
            photoUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
            isCompleted: false,
            materials: {
              create: [
                {
                  materialId: kraft.id,
                  quantity: 1,
                  unitPrice: 2.5,
                  subtotal: 2.5,
                },
                {
                  materialId: samtsLente.id,
                  quantity: 1.0,
                  unitPrice: 2.4,
                  subtotal: 2.4,
                },
                {
                  materialId: zidpapirs.id,
                  quantity: 1,
                  unitPrice: 0.8,
                  subtotal: 0.8,
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
            details: "Pasūtījums pieņemts no Elīna Zariņa",
            userId: marta.id,
            signatureDataUrl: SAMPLE_SIGNATURE,
          },
          {
            action: "STATUS_MAINA",
            details: "Kasieris/Meistars Marta Liepiņa sāka iesaiņošanu",
            userId: marta.id,
          },
        ],
      },
    },
  });

  // =========================================================================
  // KOLONNA 3: GATAVS SAŅEMŠANAI (2 pasūtījumi, SMS nosūtīti)
  // =========================================================================

  // 6. #MNL-1045 - Tērbatas 55, Apmaksāts, gaida klientu
  await prisma.order.create({
    data: {
      orderNumber: "#MNL-1045",
      status: "GATAVS",
      storeBranch: "Tērbatas iela 55",
      agreedPickupTime: new Date(now.getTime() - 25 * 60 * 1000), // Tikko sasniegts termiņš
      notes: "Kliente lūdza nosūtīt SMS tūlīt pēc pabeigšanas.",
      laborCost: 3.5,
      materialsCost: 7.7,
      totalPrice: 11.2,
      paymentStatus: "APMAKSATS",
      cashReceiptNumber: "Čeks #89304",
      customerId: anna.id,
      assignedUserId: ieva.id,
      gifts: {
        create: [
          {
            title: "Keramikas dizaina vāze 'Rīts pie jūras'",
            isThirdParty: true,
            photoUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=400&q=80",
            isCompleted: true,
            materials: {
              create: [
                {
                  materialId: chiyogami.id,
                  quantity: 1,
                  unitPrice: 4.5,
                  subtotal: 4.5,
                },
                {
                  materialId: satinsLente.id,
                  quantity: 2.0,
                  unitPrice: 1.6,
                  subtotal: 3.2,
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
            userId: ieva.id,
            signatureDataUrl: SAMPLE_SIGNATURE,
          },
          {
            action: "STATUS_MAINA",
            details: "Iesaiņošana pabeigta, statuss 'Gatavs saņemšanai'",
            userId: ieva.id,
          },
        ],
      },
      smsLogs: {
        create: {
          recipientPhone: "+371 28998877",
          messageText:
            "Labdien! Jūsu MANILLA dāvanu iesaiņojums (#MNL-1045) ir gatavs saņemšanai veikalā Tērbatas iela 55. Gaidīsim Jūs!",
          status: "DELIVERED",
          providerId: "LMT-891234",
        },
      },
    },
  });

  // 7. #MNL-1046 - Galerija Centrs, Neapmaksāts (klients maksās pie kases!)
  await prisma.order.create({
    data: {
      orderNumber: "#MNL-1046",
      status: "GATAVS",
      storeBranch: "T/C Galerija Centrs",
      agreedPickupTime: new Date(now.getTime() - 15 * 60 * 1000),
      notes: "Klients apmaksās uz vietas pie saņemšanas.",
      laborCost: 2.5,
      materialsCost: 8.7,
      totalPrice: 11.2,
      paymentStatus: "NEAPMAKSATS",
      customerId: janis.id,
      assignedUserId: marta.id,
      gifts: {
        create: [
          {
            title: "Ekskluzīvs tintes pildspalvu komplekts koka kastītē",
            isThirdParty: false,
            photoUrl: "https://images.unsplash.com/photo-1585336261026-778841a5472f?auto=format&fit=crop&w=400&q=80",
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
                  quantity: 2.3,
                  unitPrice: 2.4,
                  subtotal: 5.5,
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
            details: "Pasūtījums pieņemts no Jānis Dombrovskis",
            userId: marta.id,
            signatureDataUrl: SAMPLE_SIGNATURE,
          },
          {
            action: "STATUS_MAINA",
            details: "Pasūtījums pabeigts un sagatavots izsniegšanai",
            userId: marta.id,
          },
        ],
      },
      smsLogs: {
        create: {
          recipientPhone: "+371 29221100",
          messageText:
            "Labdien! Jūsu MANILLA dāvanu iesaiņojums (#MNL-1046) ir gatavs saņemšanai veikalā T/C Galerija Centrs. Gaidīsim Jūs!",
          status: "DELIVERED",
          providerId: "LMT-891235",
        },
      },
    },
  });

  // =========================================================================
  // KOLONNA 4: IZSNIEGTS & ARHĪVS (2 pabeigti un auditēti pasūtījumi)
  // =========================================================================

  // 8. #MNL-1039 - Tērbatas 55
  await prisma.order.create({
    data: {
      orderNumber: "#MNL-1039",
      status: "IZSNIEGTS",
      storeBranch: "Tērbatas iela 55",
      agreedPickupTime: yesterdayMorning,
      laborCost: 2.5,
      materialsCost: 7.3,
      totalPrice: 9.8,
      paymentStatus: "APMAKSATS",
      cashReceiptNumber: "Čeks #89240",
      customerId: kristaps.id,
      assignedUserId: ieva.id,
      gifts: {
        create: [
          {
            title: "Dizaina kafijas tasīšu pāris un apakštasītes",
            isThirdParty: false,
            isCompleted: true,
            photoUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80",
          },
        ],
      },
      auditLogs: {
        create: [
          {
            action: "IZVEIDOTS",
            details: "Pieņemts pasūtījums no Kristaps Vītols",
            userId: ieva.id,
            signatureDataUrl: SAMPLE_SIGNATURE,
          },
          {
            action: "IZSNIEGTS",
            details: "Dāvana veiksmīgi izsniegta klientam. Kases čeks: #89240",
            userId: ieva.id,
          },
        ],
      },
      smsLogs: {
        create: {
          recipientPhone: "+371 29445566",
          messageText: "Labdien! Jūsu MANILLA dāvanu iesaiņojums (#MNL-1039) ir gatavs saņemšanai veikalā Tērbatas iela 55. Gaidīsim Jūs!",
          status: "DELIVERED",
          providerId: "LMT-884102",
        },
      },
    },
  });

  // 9. #MNL-1038 - Tērbatas 55
  await prisma.order.create({
    data: {
      orderNumber: "#MNL-1038",
      status: "IZSNIEGTS",
      storeBranch: "Tērbatas iela 55",
      agreedPickupTime: twoDaysAgo,
      laborCost: 3.5,
      materialsCost: 8.5,
      totalPrice: 12.0,
      paymentStatus: "APMAKSATS",
      cashReceiptNumber: "Čeks #89211",
      customerId: sanita.id,
      assignedUserId: ieva.id,
      gifts: {
        create: [
          {
            title: "Aromātiskā kristāla eļļas lampa",
            isThirdParty: true,
            isCompleted: true,
            photoUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80",
          },
        ],
      },
      auditLogs: {
        create: [
          {
            action: "IZSNIEGTS",
            details: "Dāvana izsniegta Sanitai Briedei. Čeks #89211",
            userId: ieva.id,
            signatureDataUrl: SAMPLE_SIGNATURE,
          },
        ],
      },
    },
  });

  console.log("Datubāze sekmīgi uzpildīta ar 8 reprezentatīviem paraugpasūtījumiem!");
}

main()
  .catch((e) => {
    console.error("Kļūda aizpildot datubāzi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
