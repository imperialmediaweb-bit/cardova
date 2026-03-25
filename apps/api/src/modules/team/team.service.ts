import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';

export class TeamService {
  static async createTeam(userId: string, name: string) {
    const existingTeam = await prisma.team.findUnique({ where: { ownerId: userId } });
    if (existingTeam) throw new AppError('You already own a team', 409);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isPro) throw new AppError('Pro plan required to create teams', 403);

    const team = await prisma.team.create({
      data: { name, ownerId: userId },
    });
    await prisma.user.update({ where: { id: userId }, data: { teamId: team.id } });
    return team;
  }

  static async getTeam(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { ownedTeam: true } });
    if (!user) throw new AppError('User not found', 404);

    const team = user.ownedTeam || (user.teamId ? await prisma.team.findUnique({ where: { id: user.teamId }, include: { members: { select: { id: true, name: true, email: true, card: { select: { username: true } } } }, owner: { select: { id: true, name: true, email: true } } } }) : null);
    if (!team) return null;

    const teamWithMembers = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
        members: { select: { id: true, name: true, email: true, card: { select: { username: true } } } },
        owner: { select: { id: true, name: true, email: true } },
      },
    });
    return teamWithMembers;
  }

  static async inviteMember(ownerId: string, email: string) {
    const team = await prisma.team.findUnique({ where: { ownerId }, include: { members: true } });
    if (!team) throw new AppError('Team not found', 404);
    if (team.members.length >= team.maxCards) throw new AppError(`Team limit reached (${team.maxCards} members)`, 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('User not found. They must register first.', 404);
    if (user.teamId) throw new AppError('User is already in a team', 409);

    await prisma.user.update({ where: { id: user.id }, data: { teamId: team.id } });
    return { message: `${email} added to team` };
  }

  static async removeMember(ownerId: string, memberId: string) {
    const team = await prisma.team.findUnique({ where: { ownerId } });
    if (!team) throw new AppError('Team not found', 404);
    if (memberId === ownerId) throw new AppError('Cannot remove yourself', 400);

    await prisma.user.update({ where: { id: memberId }, data: { teamId: null } });
    return { message: 'Member removed' };
  }

  static async updateTeam(ownerId: string, data: { name?: string; maxCards?: number }) {
    const team = await prisma.team.findUnique({ where: { ownerId } });
    if (!team) throw new AppError('Team not found', 404);
    return prisma.team.update({ where: { id: team.id }, data });
  }

  static async deleteTeam(ownerId: string) {
    const team = await prisma.team.findUnique({ where: { ownerId } });
    if (!team) throw new AppError('Team not found', 404);
    await prisma.user.updateMany({ where: { teamId: team.id }, data: { teamId: null } });
    await prisma.team.delete({ where: { id: team.id } });
    return { message: 'Team deleted' };
  }
}
