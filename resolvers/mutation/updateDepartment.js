const updateDepartment = async (parent, { input }, { prisma }) => {
  try {
    const existingDepartment = await prisma.department.findUnique({ where: { id: input.id } });
    if (!existingDepartment) {
      return {
        statusCode: 404,
        status: "error",
        message: "Department not found | Departamento não encontrado"
      };
    }

    const updatedDepartment = await prisma.department.update({
      where: { id: input.id },
      data: {
        name: input.name,
        code: input.code,
        type: input.type,
        enabled: input.enabled,
        parentId: input.parentId
      }
    });

    return {
      statusCode: 200,
      status: "success",
      message: "Department updated successfully | Departamento atualizado com sucesso",
      result: updatedDepartment
    };
  } catch (error) {
    console.error("Error updating department:", error);
    return {
      statusCode: 500,
      status: "error",
      message: "Internal server error | Erro interno do servidor"
    };
  }
};

module.exports = { updateDepartment };
