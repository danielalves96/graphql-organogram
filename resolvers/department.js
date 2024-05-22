const departmentResolvers = {
  Department: {
    people: async (department, args, { prisma }) => {
      try {
        const people = await prisma.personOnDepartment.findMany({
          where: {
            departmentId: department.id
          },
          include: {
            person: true
          }
        });

        return people.map(pd => pd.person);
      } catch (error) {
        throw new Error("Failed to fetch people | Falha ao buscar pessoas");
      }
    }
  }
};

module.exports = { departmentResolvers };
