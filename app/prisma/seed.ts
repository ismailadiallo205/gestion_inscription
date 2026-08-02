import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding de la base de données...\n");

  // Nettoyage complet (ordre inverse des dépendances)
  await prisma.rappelLog.deleteMany();
  await prisma.echeance.deleteMany();
  await prisma.inscription.deleteMany();
  await prisma.classe.deleteMany();
  await prisma.ecole.deleteMany();
  await prisma.superAdmin.deleteMany();
  console.log("🧹 Base nettoyée\n");

  // 1. Créer une école de démo
  const motDePasseHash = await hash("password123", 12);

  const ecole = await prisma.ecole.create({
    data: {
      nom: "École Amina",
      nomPublic: "École Amina",
      email: "demo@ecole-amina.sn",
      motDePasseHash,
      slug: "ecole-amina",
      ville: "Dakar",
      type: "presentiel",
      visibleRecherche: true,
    },
  });

  console.log(`✅ École créée: ${ecole.nom} (${ecole.email})`);
  console.log(`   🔑 Mot de passe: password123\n`);

  // 2. Créer des classes
  const classes = [
    {
      nom: "6ème A",
      niveauStandard: "6e",
      montantMensualite: 15000,
      nbMois: 10,
      fraisInscription: 25000,
      slugInscription: "ecole-amina-6eme-a",
    },
    {
      nom: "5ème B",
      niveauStandard: "5e",
      montantMensualite: 18000,
      nbMois: 10,
      fraisInscription: 25000,
      slugInscription: "ecole-amina-5eme-b",
    },
    {
      nom: "Terminale S",
      niveauStandard: "Tle",
      montantMensualite: 25000,
      nbMois: 10,
      fraisInscription: 35000,
      slugInscription: "ecole-amina-terminale-s",
    },
  ];

  const createdClasses = [];

  for (const c of classes) {
    const classe = await prisma.classe.create({
      data: {
        ...c,
        ecoleId: ecole.id,
        dateDebut: new Date("2026-10-01"),
        jourEcheanceMensuel: 5,
      },
    });
    createdClasses.push(classe);
    console.log(
      `📚 Classe créée: ${classe.nom} (${classe.montantMensualite} FCFA/mois)`
    );
  }

  // 3. Créer des inscriptions avec différents statuts
  const eleves = [
    // 6ème A - Confirmés avec échéances
    {
      classeIdx: 0,
      nomEleve: "Amadou Diallo",
      nomParent: "Fatou Diallo",
      telephoneParent: "+221771234567",
      statut: "confirme",
      identifiantCourt: "EA-4821",
      lienSuiviUnique: "demo-suivi-fatou",
    },
    {
      classeIdx: 0,
      nomEleve: "Aïssatou Ba",
      nomParent: "Ibrahima Ba",
      telephoneParent: "+221771234568",
      statut: "confirme",
      identifiantCourt: "EA-4822",
      lienSuiviUnique: "demo-suivi-ibrahima",
    },
    // 6ème A - En attente
    {
      classeIdx: 0,
      nomEleve: "Moussa Sow",
      nomParent: "Mariama Sow",
      telephoneParent: "+221771234569",
      statut: "en_attente_confirmation",
      identifiantCourt: null,
      lienSuiviUnique: null,
    },
    // 5ème B
    {
      classeIdx: 1,
      nomEleve: "Ousmane Ndiaye",
      nomParent: "Fatou Diallo",
      telephoneParent: "+221771234567",
      statut: "confirme",
      identifiantCourt: "EA-4823",
      lienSuiviUnique: "demo-suivi-fatou", // Même parent = même lien
    },
    {
      classeIdx: 1,
      nomEleve: "Khady Fall",
      nomParent: "Sokhna Fall",
      telephoneParent: "+221771234570",
      statut: "confirme",
      identifiantCourt: "EA-4824",
      lienSuiviUnique: "demo-suivi-sokhna",
    },
    // Terminale S - En attente
    {
      classeIdx: 2,
      nomEleve: "Pape Diop",
      nomParent: "Abdoulaye Diop",
      telephoneParent: "+221771234571",
      statut: "en_attente_confirmation",
      identifiantCourt: null,
      lienSuiviUnique: null,
    },
  ];

  for (const e of eleves) {
    const inscription = await prisma.inscription.create({
      data: {
        classeId: createdClasses[e.classeIdx].id,
        nomEleve: e.nomEleve,
        nomParent: e.nomParent,
        telephoneParent: e.telephoneParent,
        statut: e.statut,
        identifiantCourt: e.identifiantCourt,
        lienSuiviUnique: e.lienSuiviUnique,
      },
    });

    console.log(
      `👩‍🎓 Élève créé: ${e.nomEleve} (${e.statut})`
    );

    // Créer échéances pour les confirmés
    if (e.statut === "confirme") {
      const classe = createdClasses[e.classeIdx];
      const echeances = [];

      // Frais inscription
      if (classe.fraisInscription > 0) {
        echeances.push({
          inscriptionId: inscription.id,
          type: "inscription",
          numeroMois: null,
          montant: classe.fraisInscription,
          dateLimite: new Date("2026-10-01"),
          statut: "paye", // Inscription déjà payée
          lienPaiement: "https://pay.wave.com/mock/inscription",
          datePaiement: new Date("2026-09-28"),
        });
      }

      // Mensualités
      for (let i = 0; i < classe.nbMois; i++) {
        const dateLimite = new Date(2026, 9 + i, 5); // Octobre = mois 9
        const now = new Date();
        let statut = "a_venir";

        if (i < 3) {
          // 3 premiers mois payés
          statut = "paye";
        } else if (i === 3) {
          // 4ème mois en retard (pour la démo)
          if (dateLimite < now) {
            statut = "en_retard";
          } else {
            statut = "du";
          }
        }

        echeances.push({
          inscriptionId: inscription.id,
          type: "mensualite",
          numeroMois: i + 1,
          montant: classe.montantMensualite,
          dateLimite,
          statut,
          lienPaiement: `https://pay.wave.com/mock/mois-${i + 1}`,
          datePaiement: statut === "paye" ? new Date(2026, 9 + i, 3) : null,
        });
      }

      await prisma.echeance.createMany({ data: echeances });
      console.log(
        `   💰 ${echeances.length} échéances créées`
      );
    }
  }

  // 4. Créer une deuxième école
  const ecole2 = await prisma.ecole.create({
    data: {
      nom: "Cours d'Excellence Online",
      nomPublic: "Cours d'Excellence",
      email: "demo@cours-excellence.sn",
      motDePasseHash,
      slug: "cours-excellence",
      ville: null,
      type: "en_ligne",
      visibleRecherche: true,
    },
  });

  await prisma.classe.create({
    data: {
      ecoleId: ecole2.id,
      nom: "Anglais Débutant",
      niveauStandard: "Autre",
      montantMensualite: 10000,
      nbMois: 6,
      fraisInscription: 0,
      slugInscription: "cours-excellence-anglais-debutant",
      dateDebut: new Date("2026-10-01"),
      jourEcheanceMensuel: 5,
    },
  });

  await prisma.classe.create({
    data: {
      ecoleId: ecole2.id,
      nom: "Maths Avancé",
      niveauStandard: "Autre",
      montantMensualite: 12000,
      nbMois: 8,
      fraisInscription: 5000,
      slugInscription: "cours-excellence-maths-avance",
      dateDebut: new Date("2026-10-01"),
      jourEcheanceMensuel: 5,
    },
  });

  console.log(`\n✅ École créée: ${ecole2.nom}`);
  console.log(`📚 2 classes créées pour ${ecole2.nom}`);

  console.log("\n═══════════════════════════════════════");
  console.log("🎉 Seed terminé avec succès !");
  console.log("═══════════════════════════════════════");
  // 5. Créer le Super Admin
  const admin = await prisma.superAdmin.create({
    data: {
      email: "admin@skoopay.sn",
      motDePasseHash,
    },
  });
  console.log(`\n👑 Super Admin créé: ${admin.email}`);

  console.log("\n📝 Comptes de démo :");
  console.log("   École: demo@ecole-amina.sn");
  console.log("   Admin: admin@skoopay.sn");
  console.log("   Mot de passe: password123 (pour tous)");
  console.log("\n🔗 Liens utiles :");
  console.log("   Page suivi parent (Fatou, 2 enfants): /suivi/demo-suivi-fatou");
  console.log("   Page suivi parent (Ibrahima): /suivi/demo-suivi-ibrahima");
  console.log("   Inscription 6ème A: /ecole/ecole-amina/ecole-amina-6eme-a");
  console.log("   Recherche: / (page d'accueil)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
