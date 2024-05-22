const activateDepartment = async (parent, { departmentId }, { prisma }) => {
  try {
    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      return {
        statusCode: 404,
        status: "error",
        message: "Department not found | Departamento não encontrado"
      };
    }

    if (department.enabled) {
      return {
        statusCode: 409,
        status: "error",
        message: "Department is already active | Departamento já está ativo"
      };
    }

    await prisma.department.update({
      where: { id: departmentId },
      data: { enabled: true }
    });

    return {
      statusCode: 200,
      status: "success",
      message: "Department activated successfully | Departamento ativado com sucesso"
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "error",
      message: "Internal server error | Erro interno do servidor"
    };
  }
};

module.exports = { activateDepartment };
