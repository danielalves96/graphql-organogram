const people = async (parent, { filter, search, pageSize = 10, currentPage = 1 }, { prisma }) => {
  try {
    let people = await prisma.person.findMany({
      include: {
        departments: {
          include: {
            department: true
          }
        }
      }
    });

    if (filter) {
      if (filter.name) {
        people = people.filter(person => person.name.includes(filter.name));
      }
      if (filter.phone) {
        people = people.filter(person => person.phone.includes(filter.phone));
      }
      if (filter.cpf) {
        people = people.filter(person => person.cpf.includes(filter.cpf));
      }
    }

    if (search) {
      people = people.filter(person =>
        person.name.includes(search) ||
        person.phone.includes(search) ||
        person.cpf.includes(search)
      );
    }

    const totalResults = people.length;
    const totalPages = Math.ceil(totalResults / pageSize);
    const start = (currentPage - 1) * pageSize;
    const paginatedPeople = people.slice(start, start + pageSize);

    return {
      statusCode: 200,
      status: "success",
      message: "People retrieved successfully | Pessoas recuperadas com sucesso",
      totalResults,
      totalPages,
      currentPage,
      results: paginatedPeople
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "error",
      message: "Internal server error | Erro interno do servidor"
    };
  }
};

module.exports = { people };
