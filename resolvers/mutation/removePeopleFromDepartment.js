const { v4: uuidv4 } = require('uuid');

const removePeopleFromDepartment = async (parent, { personIds, departmentId }, { prisma }) => {
  try {
    const people = await prisma.person.findMany({
      where: { id: { in: personIds } }
    });

    if (people.length !== personIds.length) {
      return {
        statusCode: 404,
        status: "error",
        message: "One or more persons not found | Uma ou mais pessoas não foram encontradas"
      };
    }

    await prisma.$transaction(async (prisma) => {
      for (const personId of personIds) {
        await prisma.personOnDepartment.deleteMany({
          where: {
            personId: personId,
            departmentId: departmentId
          }
        });
      }

      await prisma.department.update({
        where: { id: departmentId },
        data: { numberOfPeople: { decrement: personIds.length } }
      });
    });

    return {
      statusCode: 200,
      status: "success",
      message: "People removed from department successfully | Pessoas removidas do departamento com sucesso"
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "error",
      message: "Internal server error | Erro interno do servidor"
    };
  }
};

module.exports = { removePeopleFromDepartment };
