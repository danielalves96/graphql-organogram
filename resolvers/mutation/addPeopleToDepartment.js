const { v4: uuidv4 } = require('uuid');

const addPeopleToDepartment = async (parent, { personIds, departmentId }, { prisma }) => {
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
        const existingEntry = await prisma.personOnDepartment.findUnique({
          where: {
            personId_departmentId: {
              personId: personId,
              departmentId: departmentId
            }
          }
        });

        if (!existingEntry) {
          await prisma.personOnDepartment.create({
            data: {
              personId: personId,
              departmentId: departmentId
            }
          });
        }
      }

      await prisma.department.update({
        where: { id: departmentId },
        data: { numberOfPeople: { increment: personIds.length } }
      });
    });

    return {
      statusCode: 200,
      status: "success",
      message: "People added to department successfully | Pessoas adicionadas ao departamento com sucesso"
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "error",
      message: "Internal server error | Erro interno do servidor"
    };
  }
};

module.exports = { addPeopleToDepartment };
