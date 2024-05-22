const removePersonFromDepartment = async (parent, { personId, departmentId }, { prisma }) => {
  try {
    const person = await prisma.person.findUnique({ where: { id: personId } });
    if (!person) {
      return {
        statusCode: 404,
        status: "error",
        message: "Person not found | Pessoa não encontrada"
      };
    }

    await prisma.personOnDepartment.delete({
      where: {
        personId_departmentId: {
          personId: personId,
          departmentId: departmentId
        }
      }
    });

    await prisma.department.update({
      where: { id: departmentId },
      data: { numberOfPeople: { decrement: 1 } }
    });

    return {
      statusCode: 200,
      status: "success",
      message: "Person removed from department successfully | Pessoa removida do departamento com sucesso"
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "error",
      message: "Internal server error | Erro interno do servidor"
    };
  }
};

module.exports = { removePersonFromDepartment };
