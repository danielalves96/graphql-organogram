const personResolvers = {
  Person: {
    departments: async (person, args, { prisma }) => {
      try {
        const personDepartments = await prisma.personOnDepartment.findMany({
          where: {
            personId: person.id
          },
          include: {
            department: true
          }
        });

        return personDepartments.map(pd => pd.department);
      } catch (error) {
        throw new Error("Failed to fetch departments | Falha ao buscar departamentos");
      }
    }
  }
};

module.exports = { personResolvers };
