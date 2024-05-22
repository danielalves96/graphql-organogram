const deactivateDepartment = async (parent, { departmentId }, { prisma }) => {
  try {
    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      return {
        statusCode: 404,
        status: "error",
        message: "Department not found | Departamento não encontrado"
      };
    }

    if (!department.enabled) {
      return {
        statusCode: 409,
        status: "error",
        message: "Department is already inactive | Departamento já está inativo"
      };
    }

    await prisma.department.update({
      where: { id: departmentId },
      data: { enabled: false }
    });

    return {
      statusCode: 200,
      status: "success",
      message: "Department deactivated successfully | Departamento desativado com sucesso"
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "error",
      message: "Internal server error | Erro interno do servidor"
    };
  }
};

module.exports = { deactivateDepartment };
