[System.IO.Directory]::CreateDirectory("$PWD\src\app\api\admin\ecoles\[id]") | Out-Null
[System.IO.Directory]::CreateDirectory("$PWD\src\app\suivi\[token]") | Out-Null

$content1 = @'
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function verifierSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return null;
  }
  return session;
}

// GET /api/admin/ecoles/[id] — Fiche détaillée d'une école (super-admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifierSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const ecole = await prisma.ecole.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            _count: { select: { inscriptions: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!ecole) {
      return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
    }

    const echeancesPayees = await prisma.echeance.aggregate({
      where: {
        statut: "paye",
        inscription: { classe: { ecoleId: id } },
      },
      _sum: { montant: true },
    });

    const nombreEleves = await prisma.inscription.count({
      where: { classe: { ecoleId: id }, statut: "confirme" },
    });

    return NextResponse.json({
      ...ecole,
      nombreEleves,
      revenuTotal: echeancesPayees._sum.montant || 0,
    });
  } catch (error) {
    console.error("Erreur détail école admin:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

// PATCH /api/admin/ecoles/[id] — Suspendre / réactiver une école
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifierSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { actif } = body;

    if (typeof actif !== "boolean") {
      return NextResponse.json(
        { error: "Le champ 'actif' est requis (true ou false)" },
        { status: 400 }
      );
    }

    const ecole = await prisma.ecole.update({
      where: { id },
      data: { actif },
    });

    return NextResponse.json(ecole);
  } catch (error) {
    console.error("Erreur PATCH admin/ecoles/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ecoles/[id] — Supprimer définitivement une école
// Refusé si l'école a encore des classes, pour éviter de perdre par erreur
// des inscriptions et des historiques de paiement réels. Il faut d'abord
// que l'école n'ait plus aucune classe pour pouvoir la supprimer.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifierSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const ecole = await prisma.ecole.findUnique({
      where: { id },
      include: { _count: { select: { classes: true } } },
    });

    if (!ecole) {
      return NextResponse.json({ error: "École introuvable" }, { status: 404 });
    }

    if (ecole._count.classes > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer : cette école a encore ${ecole._count.classes} classe(s) avec des élèves inscrits. Suspendez-la plutôt, ou supprimez d'abord ses classes.`,
        },
        { status: 409 }
      );
    }

    await prisma.ecole.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE admin/ecoles/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

'@
[System.IO.File]::WriteAllText("$PWD\src\app\api\admin\ecoles\[id]\route.ts", $content1, [System.Text.Encoding]::UTF8)

$content2 = @'
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatMontant, formatDate, formatDateCourte } from "@/lib/utils";
import Link from "next/link";
import { Check, AlertCircle, CreditCard, CheckCircle2 } from "lucide-react";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SuiviParentPage({ params }: PageProps) {
  const { token } = await params;

  // Trouver toutes les inscriptions liées à ce token
  const inscriptions = await prisma.inscription.findMany({
    where: {
      lienSuiviUnique: token,
      statut: "confirme",
    },
    include: {
      classe: {
        include: {
          ecole: { select: { nom: true, nomPublic: true } },
        },
      },
      echeances: {
        orderBy: { dateLimite: "asc" },
      },
    },
  });

  if (inscriptions.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen hero-gradient">
      {/* Navbar */}
      <nav className="flex items-center justify-center px-6 py-4">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="EduPay" className="h-9 w-auto object-contain" />
        </Link>
      </nav>

      <div className="px-4 py-8 max-w-lg mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-xl font-bold text-ink-900 mb-1">
            Suivi des paiements
          </h1>
          <p className="text-sm text-ink-400">
            {inscriptions[0].nomParent}
          </p>
        </div>

        {/* Liste des enfants inscrits */}
        <div className="space-y-6 stagger-children">
          {inscriptions.map((inscription) => {
            const echeances = inscription.echeances;
            const totalPaye = echeances
              .filter((e) => e.statut === "paye")
              .reduce((sum, e) => sum + e.montant, 0);
            const totalGeneral = echeances.reduce(
              (sum, e) => sum + e.montant,
              0
            );
            const prochainePaiement = echeances.find(
              (e) => e.statut !== "paye"
            );
            const nbPayes = echeances.filter(
              (e) => e.statut === "paye"
            ).length;
            const nbTotal = echeances.length;
            const pourcentage =
              nbTotal > 0 ? Math.round((nbPayes / nbTotal) * 100) : 0;

            return (
              <div key={inscription.id} className="glass-card-static overflow-hidden">
                {/* En-tête enfant */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-ink-900">
                        {inscription.nomEleve}
                      </h2>
                      <p className="text-sm text-ink-400 mt-0.5">
                        {inscription.classe.ecole.nomPublic ||
                          inscription.classe.ecole.nom}{" "}
                        — {inscription.classe.nom}
                      </p>
                      <span className="text-xs text-blue-600 font-mono bg-blue-100 px-2 py-0.5 rounded-md mt-2 inline-block">
                        {inscription.identifiantCourt}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-ink-900">
                        {pourcentage}%
                      </div>
                      <div className="text-xs text-ink-400">payé</div>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mt-4">
                    <div className="h-3 rounded-full bg-surface-soft overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000"
                        style={{ width: `${pourcentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-ink-400">
                      <span>{formatMontant(totalPaye)} payé</span>
                      <span>{formatMontant(totalGeneral)} total</span>
                    </div>
                  </div>
                </div>

                {/* Frise horizontale des échéances */}
                <div className="p-6">
                  <p className="text-sm font-medium text-ink-600 mb-4">
                    Échéancier de l&apos;année
                  </p>
                  <div className="frise-container">
                    {echeances.map((echeance, idx) => (
                      <div key={echeance.id} className="frise-item">
                        <div className={`frise-dot ${echeance.statut}`}>
                          {echeance.statut === "paye" ? (
                            <Check size={12} strokeWidth={3} />
                          ) : echeance.statut === "en_retard" ? (
                            "!"
                          ) : echeance.type === "inscription" ? (
                            "I"
                          ) : (
                            echeance.numeroMois
                          )}
                        </div>
                        <div className="frise-label">
                          <div className="font-medium text-ink-600">
                            {formatMontant(echeance.montant).replace(
                              " FCFA",
                              ""
                            )}
                          </div>
                          <div>
                            {formatDateCourte(echeance.dateLimite)}
                          </div>
                          {echeance.statut === "paye" && (
                            <div className="text-emerald-400 text-[10px] font-semibold">
                              Payé
                            </div>
                          )}
                          {echeance.statut === "en_retard" && (
                            <div className="text-red-400 text-[10px] font-semibold">
                              Retard
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bouton payer */}
                {prochainePaiement && (
                  <div className="px-6 pb-6">
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-500/20 mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-ink-600 flex items-center gap-1.5">
                            {prochainePaiement.statut === "en_retard" && (
                              <AlertCircle size={14} strokeWidth={2} className="text-red-500" />
                            )}
                            {prochainePaiement.statut === "en_retard"
                              ? "Paiement en retard"
                              : "Prochain paiement"}
                          </p>
                          <p className="text-xs text-ink-400 mt-0.5">
                            Échéance :{" "}
                            {formatDate(prochainePaiement.dateLimite)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            {formatMontant(prochainePaiement.montant)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <a
                      href={prochainePaiement.lienPaiement || "#"}
                      className="btn-primary w-full text-center flex items-center justify-center gap-2 text-lg py-4"
                      id={`btn-payer-${inscription.id}`}
                    >
                      <CreditCard size={20} strokeWidth={2} /> Payer maintenant
                    </a>
                  </div>
                )}

                {/* Tout est payé */}
                {!prochainePaiement && (
                  <div className="px-6 pb-6">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <p className="text-emerald-400 font-semibold flex items-center justify-center gap-2">
                        <CheckCircle2 size={18} strokeWidth={2} /> Tous les paiements sont à jour !
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-ink-400">
          <p>Propulsé par EduPay</p>
          <p className="mt-1">Lien de suivi personnel — ne le partagez pas</p>
        </div>
      </div>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("$PWD\src\app\suivi\[token]\page.tsx", $content2, [System.Text.Encoding]::UTF8)

Write-Host "Fichiers crees"
Write-Host "Verification (methode .NET, fiable avec les crochets):"
[System.IO.File]::Exists("$PWD\src\app\api\admin\ecoles\[id]\route.ts")
[System.IO.File]::Exists("$PWD\src\app\suivi\[token]\page.tsx")
