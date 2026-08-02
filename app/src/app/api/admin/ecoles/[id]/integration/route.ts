import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { waveBusinessApiKey, waveActivationStatut } = await req.json();

    const ecole = await prisma.ecole.update({
      where: { id },
      data: {
        waveBusinessApiKey,
        waveActivationStatut,
      },
    });

    return NextResponse.json(ecole);
  } catch (error) {
    console.error('Erreur API intégration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
