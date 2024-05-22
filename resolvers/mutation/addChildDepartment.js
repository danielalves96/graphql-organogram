const addChildDepartment = async (parent, { parentDepartmentId, childDepartmentId }, { prisma }) => {
  try {
    const parentDepartment = await prisma.department.findUnique({ where: { id: parentDepartmentId } });
    const childDepartment = await prisma.department.findUnique({ where: { id: childDepartmentId } });
    if (!parentDepartment || !childDepartment) {
      return {
        statusCode: 404,
        status: "error",
        message: "Parent or child department not found | Departamento pai ou filho não encontrado"
      };
    }

    if (childDepartment.parentId !== null) {
      return {
        statusCode: 409,
        status: "error",
        message: "Child department already has a parent | Departamento filho já possui um pai"
      };
    }

    await prisma.department.update({
      where: { id: childDepartmentId },
      data: { parentId: parentDepartmentId }
    });

    return {
      statusCode: 200,
      status: "success",
      message: "Child department added successfully | Departamento filho adicionado com sucesso"
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "error",
      message: "Internal server error | Erro interno do servidor"
    };
  }
};

module.exports = { addChildDepartment };
