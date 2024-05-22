const personDetails = async (parent, { personId }, { prisma }) => {
  try {
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        departments: {
          include: {
            department: true
          }
        }
      }
    });

    if (!person) {
      return {
        statusCode: 404,
        status: "error",
        message: "Person not found | Pessoa não encontrada"
      };
    }

    return {
      statusCode: 200,
      status: "success",
      message: "Person retrieved successfully | Pessoa recuperada com sucesso",
      result: person
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "error",
      message: "Internal server error | Erro interno do servidor"
    };
  }
};

module.exports = { personDetails };
