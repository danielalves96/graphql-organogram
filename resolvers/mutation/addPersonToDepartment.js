const { v4: uuidv4 } = require('uuid');

const addPersonToDepartment = async (parent, { personId, departmentId }, { prisma }) => {
  try {
    const person = await prisma.person.findUnique({ where: { id: personId } });
    if (!person) {
      return {
        statusCode: 404,
        status: "error",
        message: "Person not found | Pessoa não encontrada"
      };
    }

    await prisma.personOnDepartment.create({
      data: {
        personId: personId,
        departmentId: departmentId
      }
    });

    await prisma.department.update({
      where: { id: departmentId },
      data: { numberOfPeople: { increment: 1 } }
    });

    return {
      statusCode: 200,
      status: "success",
      message: "Person added to department successfully | Pessoa adicionada ao departamento com sucesso"
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "error",
      message: "Internal server error | Erro interno do servidor"
    };
  }
};

module.exports = { addPersonToDepartment };
